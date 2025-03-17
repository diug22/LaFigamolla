/**
 * Controls class
 * Handles user interactions (touch, mouse) for artwork navigation and viewing
 * Optimized with improved rotation and zoom functionality
 */

import * as THREE from 'three';

export class Controls {
    constructor(experience) {
        this.experience = experience;
        this.camera = this.experience.camera;
        this.sizes = this.experience.sizes;
        this.time = this.experience.time;
        this.canvas = this.experience.canvas;
        this.ui = this.experience.ui;
        
        // Control states
        this.isActive = true;
        this.isDragging = false;
        this.isZooming = false;
        this.currentIndex = 0;
        this.totalItems = 0; // Will be set by World class
        
        // Touch/mouse positions
        this.touchStart = { x: 0, y: 0 };
        this.touchCurrent = { x: 0, y: 0 };
        this.touchDelta = { x: 0, y: 0 };
        
        // Pinch/zoom
        this.pinchStart = 0;
        this.pinchCurrent = 0;
        this.pinchDelta = 0;
        
        // Camera controls
        this.cameraRotation = { x: 0, y: 0 };
        this.cameraZoom = 1;
        
        // Swipe detection
        this.swipeThreshold = 50; // Minimum distance for a swipe
        this.swipeVerticalThreshold = 50; // Threshold for vertical swipe
        this.swipeDirection = null;
        this.swipeVerticalDirection = null;
        
        // Enhanced camera settings
        this.defaultDistance = 5;
        this.minDistance = 2;
        this.maxDistance = 8;
        this.rotationSensitivity = 0.005;
        this.zoomSensitivity = 0.001;
        this.dampingFactor = 0.95;
        
        // Camera motion
        this.momentum = { x: 0, y: 0 };
        this.isInertiaActive = true;
        
        // Zoom settings
        this.pinchZoomEnabled = true;
        this.pinchZoomSensitivity = 0.05;
        
        // Initial camera position/target for resets
        this.initialCameraPosition = new THREE.Vector3(0, 0, this.defaultDistance);
        this.initialLookAtPosition = new THREE.Vector3(0, 0, 0);
        
        // Event callbacks
        this.callbacks = {};
        
        // Setup
        this.setupEventListeners();
        this.setupOrbitControls();
    }
    
    /**
     * Setup additional orbit-like controls for smoother rotation
     */
    setupOrbitControls() {
        // Variables for orbit-like controls
        this.orbitTargetPosition = new THREE.Vector3(0, 0, 0);
        this.orbitDistance = this.defaultDistance;
        this.orbitRotation = { x: 0, y: 0 };
        this.orbitVelocity = { x: 0, y: 0 };
        this.damping = 0.92;
    }
    
    /**
     * Setup event listeners for user interactions
     */
    setupEventListeners() {
        // Touch events
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
        
        // Mouse events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // Wheel event for zoom
        this.canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
        
        // Double-tap/click for reset
        this.lastTapTime = 0;
        this.canvas.addEventListener('click', this.onCanvasClick.bind(this));
        
        // Key events for additional controls
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }
    
    /**
     * Handle key down events
     */
    onKeyDown(event) {
        if (!this.isActive) return;
        
        switch (event.key) {
            case 'ArrowLeft':
                this.previousItem();
                break;
            case 'ArrowRight':
                this.nextItem();
                break;
            case 'ArrowUp':
                this.showArtworkInfo();
                break;
            case 'ArrowDown':
                this.hideArtworkInfo();
                break;
            case 'r':
            case 'R':
                this.resetCameraView();
                break;
            default:
                break;
        }
    }
    
    /**
     * Handle canvas click for double-click detection
     */
    onCanvasClick(event) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.lastTapTime;
        
        if (tapLength < 300 && tapLength > 0) {
            // Double click/tap detected
            this.resetCameraView();
            event.preventDefault();
        }
        
        this.lastTapTime = currentTime;
    }
    
    /**
     * Handle touch start event
     */
    onTouchStart(event) {
        if (!this.isActive) return;
        
        event.preventDefault();
        
        // Reset momentum
        this.momentum = { x: 0, y: 0 };
        
        // Single touch (drag)
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.isZooming = false;
            this.touchStart.x = event.touches[0].clientX;
            this.touchStart.y = event.touches[0].clientY;
            this.touchCurrent.x = this.touchStart.x;
            this.touchCurrent.y = this.touchStart.y;
            this.touchDelta.x = 0;
            this.touchDelta.y = 0;
            this.swipeDirection = null;
            this.swipeVerticalDirection = null;
            
            // Store last position for momentum
            this.lastPosition = {
                x: this.touchStart.x,
                y: this.touchStart.y,
                time: Date.now()
            };
            
            this.touchStartTime = Date.now();
        }
        // Double touch (pinch)
        else if (event.touches.length === 2) {
            this.isDragging = false;
            this.isZooming = true;
            
            // Calculate initial pinch distance
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            this.pinchStart = Math.sqrt(dx * dx + dy * dy);
            this.pinchCurrent = this.pinchStart;
            this.pinchDelta = 0;
            
            // Store the midpoint of the pinch
            this.pinchMidpoint = {
                x: (event.touches[0].clientX + event.touches[1].clientX) / 2,
                y: (event.touches[0].clientY + event.touches[1].clientY) / 2
            };
            
            // Show a hint
            this.showGestureHint('Pinch to zoom in or out');
        }
    }
    
    /**
     * Handle touch move event
     */
    onTouchMove(event) {
        if (!this.isActive) return;
        
        event.preventDefault();
        
        // Single touch (drag)
        if (this.isDragging && event.touches.length === 1) {
            const now = Date.now();
            const x = event.touches[0].clientX;
            const y = event.touches[0].clientY;
            
            this.touchCurrent.x = x;
            this.touchCurrent.y = y;
            
            // Calculate delta with reduced movement for smoother control
            this.touchDelta.x = (this.touchCurrent.x - this.touchStart.x) * 0.8;
            this.touchDelta.y = (this.touchCurrent.y - this.touchStart.y) * 0.8;
            
            // Calculate momentum with reduced acceleration
            if (now - this.lastPosition.time > 10) {
                this.momentum.x = (x - this.lastPosition.x) * 0.02;
                this.momentum.y = (y - this.lastPosition.y) * 0.02;
                
                this.lastPosition = {
                    x: x,
                    y: y,
                    time: now
                };
            }
            
            // Detect horizontal swipe direction (for artwork navigation)
            if (Math.abs(this.touchDelta.x) > Math.abs(this.touchDelta.y)) {
                if (this.touchDelta.x > this.swipeThreshold) {
                    this.swipeDirection = 'right';
                    this.swipeVerticalDirection = null;
                } else if (this.touchDelta.x < -this.swipeThreshold) {
                    this.swipeDirection = 'left';
                    this.swipeVerticalDirection = null;
                }
            } 
            // Detect vertical swipe direction (for information panel)
            else {
                if (this.touchDelta.y > this.swipeVerticalThreshold) {
                    this.swipeVerticalDirection = 'down';
                    this.swipeDirection = null;
                } else if (this.touchDelta.y < -this.swipeVerticalThreshold) {
                    this.swipeVerticalDirection = 'up';
                    this.swipeDirection = null;
                }
            }
            
            // If not swiping, apply rotation to camera
            if (!this.swipeDirection && !this.swipeVerticalDirection) {
                const currentItem = this.getCurrentItem();
                
                if (currentItem && currentItem.geometryType === 'plane' && currentItem.handleManualRotation) {
                    // Si es un plano y tiene el método de rotación manual, enviar un factor más alto
                    currentItem.handleManualRotation(this.momentum.x * 200, this.momentum.y * 200); // Duplicado de 100
                } else {
                    this.applyTouchRotation();
                }
            }
        }
        // Double touch (pinch)
        else if (this.isZooming && event.touches.length === 2) {
            // Calculate current pinch distance
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            this.pinchCurrent = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate delta with smoother sensitivity
            this.pinchDelta = (this.pinchCurrent - this.pinchStart) * this.pinchZoomSensitivity;
            
            // Apply zoom
            this.applyZoom();
            
            // Update pinch start for smoother zooming
            this.pinchStart = this.pinchCurrent;
        }
    }
    
    
    /**
     * Handle touch end event
     */
    onTouchEnd(event) {
        if (!this.isActive) return;
        
        const now = Date.now();
        const touchDuration = now - this.touchStartTime;
        
        // Detect quick tap (for double tap detection)
        if (touchDuration < 300 && Math.abs(this.touchDelta.x) < 10 && Math.abs(this.touchDelta.y) < 10) {
            const currentTime = now;
            const tapLength = currentTime - this.lastTapTime;
            
            if (tapLength < 300 && tapLength > 0) {
                // Double tap detected
                this.onDoubleTap(this.touchCurrent.x, this.touchCurrent.y);
                event.preventDefault();
            }
            
            this.lastTapTime = currentTime;
        } 
        // Handle swipe with reduced sensitivity (for more intentional swipes)
        else if (touchDuration < 400) {
            // Handle horizontal swipe for artwork navigation
            if (this.swipeDirection === 'left' && Math.abs(this.touchDelta.x) > this.swipeThreshold * 1.2) {
                this.nextItem();
            } else if (this.swipeDirection === 'right' && Math.abs(this.touchDelta.x) > this.swipeThreshold * 1.2) {
                this.previousItem();
            }
            // Handle vertical swipe for artwork information
            else if (this.swipeVerticalDirection === 'up' && Math.abs(this.touchDelta.y) > this.swipeVerticalThreshold * 1.2) {
                this.showArtworkInfo();
            } else if (this.swipeVerticalDirection === 'down' && Math.abs(this.touchDelta.y) > this.swipeVerticalThreshold * 1.2) {
                this.hideArtworkInfo();
            }
        }
        
        // Reset states but keep momentum for smooth deceleration
        this.isDragging = false;
        this.isZooming = false;
        this.pinchDelta = 0;
        this.swipeDirection = null;
        this.swipeVerticalDirection = null;
    }
    
    /**
     * Handle double tap for quick zoom
     */
    onDoubleTap(x, y) {
        // Check current zoom level and toggle between zoomed and normal view
        if (this.cameraZoom < 0.9) {
            this.zoomIn();
        } else if (this.cameraZoom > 1.1) {
            this.resetCameraView();
        } else {
            this.zoomToPoint(x, y);
        }
    }
    
    /**
     * Zoom to a specific point on screen
     */
    zoomToPoint(x, y) {
        if (!this.camera) return;
        
        // Apply a focused zoom
        this.cameraZoom = Math.max(
            this.minDistance / this.defaultDistance, 
            this.cameraZoom * 0.5
        );
        
        // Apply the zoom
        this.applyTouchRotation();
    }
    
    /**
     * Handle mouse down event
     */
    onMouseDown(event) {
        if (!this.isActive) return;
        
        this.isDragging = true;
        this.touchStart.x = event.clientX;
        this.touchStart.y = event.clientY;
        this.touchCurrent.x = this.touchStart.x;
        this.touchCurrent.y = this.touchStart.y;
        this.touchDelta.x = 0;
        this.touchDelta.y = 0;
        this.swipeDirection = null;
        
        // Reset momentum
        this.momentum = { x: 0, y: 0 };
        
        // Store last position for momentum
        this.lastPosition = {
            x: this.touchStart.x,
            y: this.touchStart.y,
            time: Date.now()
        };
    }

    /**
     * Get the current artwork item
     * @returns {Object} The current artwork item or null
     */
    getCurrentItem() {
        if (this.experience && this.experience.world && 
            this.experience.world.items && 
            this.currentIndex < this.experience.world.items.length) {
            return this.experience.world.items[this.currentIndex];
        }
        return null;
    
    }
    
    /**
     * Handle mouse move event
     */
    onMouseMove(event) {
        if (!this.isActive || !this.isDragging) return;
        
        const now = Date.now();
        const x = event.clientX;
        const y = event.clientY;
        
        this.touchCurrent.x = x;
        this.touchCurrent.y = y;
        
        // Calculate delta
        this.touchDelta.x = this.touchCurrent.x - this.touchStart.x;
        this.touchDelta.y = this.touchCurrent.y - this.touchStart.y;
        
        // Calculate momentum
        if (now - this.lastPosition.time > 20) {
            this.momentum.x = (x - this.lastPosition.x) * 0.01;
            this.momentum.y = (y - this.lastPosition.y) * 0.01;
            
            this.lastPosition = {
                x: x,
                y: y,
                time: now
            };
        }
        
        // Detect horizontal swipe direction (for artwork navigation)
        if (Math.abs(this.touchDelta.x) > Math.abs(this.touchDelta.y)) {
            if (this.touchDelta.x > this.swipeThreshold) {
                this.swipeDirection = 'right';
                this.swipeVerticalDirection = null;
            } else if (this.touchDelta.x < -this.swipeThreshold) {
                this.swipeDirection = 'left';
                this.swipeVerticalDirection = null;
            }
        }
        // Detect vertical swipe direction (for information panel)
        else {
            if (this.touchDelta.y > this.swipeVerticalThreshold) {
                this.swipeVerticalDirection = 'down';
                this.swipeDirection = null;
            } else if (this.touchDelta.y < -this.swipeVerticalThreshold) {
                this.swipeVerticalDirection = 'up';
                this.swipeDirection = null;
            }
        }
        
        if (!this.swipeDirection && !this.swipeVerticalDirection) {
            // Primero comprobamos si el item actual es un plano para tratarlo de forma especial
            const currentItem = this.getCurrentItem();
            
                this.applyTouchRotation();
        }
    }
    
    /**
     * Handle mouse up event
     */
    onMouseUp(event) {
        if (!this.isActive) return;
        
        // Handle horizontal swipe for artwork navigation
        if (this.swipeDirection === 'left') {
            this.nextItem();
        } else if (this.swipeDirection === 'right') {
            this.previousItem();
        }
        // Handle vertical swipe for artwork information
        else if (this.swipeVerticalDirection === 'up') {
            this.showArtworkInfo();
        } else if (this.swipeVerticalDirection === 'down') {
            this.hideArtworkInfo();
        }
        
        // Reset state but keep momentum for smooth deceleration
        this.isDragging = false;
        this.swipeDirection = null;
        this.swipeVerticalDirection = null;
    }
    
    /**
     * Handle mouse wheel event for zoom
     */
    onWheel(event) {
        if (!this.isActive) return;
        
        event.preventDefault();
        
        // Smoother zoom with wheel
        this.pinchDelta = event.deltaY * 0.005;
        
        // Apply zoom
        this.applyZoom();
    }
    
    /**
     * Apply rotation based on touch/mouse movement
     * Improved for smoother rotation
     */
    applyTouchRotation() {
        if (!this.camera || (!this.isDragging && !this.isZooming)) return;
        
        // Special case for pinch zoom
        if (this.isZooming && !this.isDragging) {
            const distance = this.defaultDistance * this.cameraZoom;
            const cameraX = Math.sin(this.cameraRotation.y) * Math.cos(this.cameraRotation.x) * distance;
            const cameraY = Math.sin(this.cameraRotation.x) * distance;
            const cameraZ = Math.cos(this.cameraRotation.y) * Math.cos(this.cameraRotation.x) * distance;
            
            const newPosition = new THREE.Vector3(
                cameraX + this.initialLookAtPosition.x,
                cameraY + this.initialLookAtPosition.y,
                cameraZ + this.initialLookAtPosition.z
            );
            
            if (this.camera.moveTo) {
                this.camera.moveTo(newPosition, this.initialLookAtPosition, 0.3);
            }
            return;
        }
        
        // For normal dragging, calculate rotation based on touch delta
        // Aumentar la influencia del movimiento para respuesta más rápida
        const rotX = this.touchDelta.y * this.rotationSensitivity * 1.5;
        const rotY = this.touchDelta.x * this.rotationSensitivity * 1.5;
        
        // Update current rotation with smoother transitions pero más directas
        // Cambiar el factor de interpolación de 0.3 a 0.5 para respuesta más inmediata
        this.cameraRotation.x = THREE.MathUtils.lerp(this.cameraRotation.x, this.cameraRotation.x + rotX, 0.5);
        this.cameraRotation.y = THREE.MathUtils.lerp(this.cameraRotation.y, this.cameraRotation.y + rotY, 0.5);
        
        // Permitir una rotación vertical ligeramente mayor
        this.cameraRotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, this.cameraRotation.x));
        
        // Resto del método sin cambios...
        const distance = this.defaultDistance * this.cameraZoom;
        const cameraX = Math.sin(this.cameraRotation.y) * Math.cos(this.cameraRotation.x) * distance;
        const cameraY = Math.sin(this.cameraRotation.x) * distance;
        const cameraZ = Math.cos(this.cameraRotation.y) * Math.cos(this.cameraRotation.x) * distance;
        
        // Create new position vector
        const newPosition = new THREE.Vector3(
            cameraX + this.initialLookAtPosition.x,
            cameraY + this.initialLookAtPosition.y,
            cameraZ + this.initialLookAtPosition.z
        );
        
        // Update camera using its existing methods
        if (this.camera.moveTo) {
            // Ajustar la duración a un valor más bajo para respuesta más rápida
            this.camera.moveTo(newPosition, this.initialLookAtPosition, 0.2);
        }
    }
    
    
    /**
     * Apply zoom based on pinch/wheel
     */
    applyZoom() {
        if (!this.camera) return;
        
        // Calculate zoom factor with smoother sensitivity
        const zoomFactor = this.pinchDelta * this.zoomSensitivity;
        
        // Calculate target zoom with limits
        const targetZoom = Math.max(
            this.minDistance / this.defaultDistance,
            Math.min(
                this.maxDistance / this.defaultDistance,
                this.cameraZoom - zoomFactor
            )
        );
        
        // Smooth transition to target zoom
        this.cameraZoom = THREE.MathUtils.lerp(this.cameraZoom, targetZoom, 0.2);
        
        // Reset pinch delta
        this.pinchDelta = 0;
        
        // Apply zoom by updating camera position
        this.applyTouchRotation();
    }
    
    /**
     * Zoom in by a fixed amount
     */
    zoomIn() {
        if (!this.camera) return;
        
        // Zoom in by 30%
        this.cameraZoom = Math.max(
            this.minDistance / this.defaultDistance,
            this.cameraZoom * 0.7
        );
        
        // Apply zoom
        this.applyTouchRotation();
    }
    
    /**
     * Zoom out by a fixed amount
     */
    zoomOut() {
        if (!this.camera) return;
        
        // Zoom out by 30%
        this.cameraZoom = Math.min(
            this.maxDistance / this.defaultDistance,
            this.cameraZoom * 1.3
        );
        
        // Apply zoom
        this.applyTouchRotation();
    }
    
    /**
     * Navigate to the next item (slide from right)
     */
    nextItem() {
        if (this.currentIndex < this.totalItems - 1) {
            const oldIndex = this.currentIndex;
            this.currentIndex++;
            
            this.emit('itemChange', this.currentIndex);
            
            // Reset camera position and rotation with a horizontal transition
            this.resetCameraViewHorizontal('left');
            
            // Update UI
            this.updateNavDots();
            
            // Show gesture hint
            this.showGestureHint("Swipe left/right to navigate");
        }
    }
    
    /**
     * Navigate to the previous item (slide from left)
     */
    previousItem() {
        if (this.currentIndex > 0) {
            const oldIndex = this.currentIndex;
            this.currentIndex--;
            
            this.emit('itemChange', this.currentIndex);
            
            // Reset camera position and rotation with a horizontal transition
            this.resetCameraViewHorizontal('right');
            
            // Update UI
            this.updateNavDots();
            
            // Show gesture hint
            this.showGestureHint("Swipe left/right to navigate");
        }
    }
    
    /**
     * Show artwork information (triggered by swiping up)
     */
    showArtworkInfo() {
        // Emit event for UI to show info panel
        this.emit('showInfo', this.currentIndex);
        
        // Show gesture hint
        this.showGestureHint("Swipe down to hide info");
    }
    
    /**
     * Hide artwork information (triggered by swiping down)
     */
    hideArtworkInfo() {
        // Emit event for UI to hide info panel
        this.emit('hideInfo');
        
        // Show gesture hint
        this.showGestureHint("Swipe up to show info");
    }
    
    /**
     * Reset camera view with horizontal transition effect
     */
    resetCameraViewHorizontal(direction) {
        // Reset rotation and zoom
        this.cameraRotation = { x: 0, y: 0 };
        this.cameraZoom = 1;
        this.momentum = { x: 0, y: 0 };
        
        // Emit event for world to transition the artwork
        this.emit('horizontalTransition', direction);
        
        // Apply camera transition
        if (this.camera && this.camera.moveTo) {
            this.camera.moveTo(
                this.initialCameraPosition,
                this.initialLookAtPosition,
                0.8
            );
        }
    }
    
    /**
     * Reset camera to default view
     */
    resetCameraView() {
        this.cameraRotation = { x: 0, y: 0 };
        this.cameraZoom = 1;
        this.momentum = { x: 0, y: 0 };
        
        if (this.camera && this.camera.moveTo) {
            this.camera.moveTo(
                this.initialCameraPosition,
                this.initialLookAtPosition,
                0.7
            );
        }
    }
    
    /**
     * Update navigation dots in the UI
     */
    updateNavDots() {
        const navDots = document.getElementById('nav-dots');
        if (!navDots) return;
        
        // Clear existing dots
        navDots.innerHTML = '';
        
        // Create new dots
        for (let i = 0; i < this.totalItems; i++) {
            const dot = document.createElement('div');
            dot.className = 'nav-dot';
            if (i === this.currentIndex) {
                dot.classList.add('active');
            }
            
            // Add click event
            dot.addEventListener('click', () => {
                this.currentIndex = i;
                this.emit('itemChange', this.currentIndex);
                this.resetCameraView();
                this.updateNavDots();
            });
            
            navDots.appendChild(dot);
        }
    }
    
    /**
     * Show gesture hint with improved visibility
     */
    showGestureHint(text) {
        if (this.ui && this.ui.showGestureHint) {
            this.ui.showGestureHint(text);
        }
    }
    
    /**
     * Set total number of items
     */
    setTotalItems(count) {
        this.totalItems = count;
        this.updateNavDots();
    }
    
    /**
     * Apply momentum effect for smoother camera movement
     */
    applyMomentum() {
        if (!this.isInertiaActive || this.isDragging) return;
        
        // Reduce momentum over time
        this.momentum.x *= this.dampingFactor;
        this.momentum.y *= this.dampingFactor;
        
        // Only apply if momentum is significant
        if (Math.abs(this.momentum.x) < 0.01 && Math.abs(this.momentum.y) < 0.01) return;
        
        // Apply momentum to rotation
        this.cameraRotation.y += this.momentum.x * this.rotationSensitivity * 2;
        this.cameraRotation.x += this.momentum.y * this.rotationSensitivity * 2;
        
        // Limit vertical rotation
        this.cameraRotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, this.cameraRotation.x));
        
        // Update camera position
        this.applyTouchRotation();
    }
    
    /**
     * Update controls on each frame
     */
    update() {
        // Apply momentum effect for smooth deceleration
        this.applyMomentum();
    }
    
    /**
     * Event emitter methods
     */
    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
        
        return this;
    }
    
    off(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
        }
        
        return this;
    }
    
    emit(event, ...args) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(...args));
        }
        
        return this;
    }
}