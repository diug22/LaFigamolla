/**
 * Controls class
 * Handles user interactions (touch, mouse, gyroscope)
 * Optimized for mobile devices with improved artwork viewing
 */

import * as THREE from 'three';

export class Controls {
    constructor(experience) {
        this.experience = experience;
        this.camera = this.experience.camera;
        this.sizes = this.experience.sizes;
        this.time = this.experience.time;
        this.canvas = this.experience.canvas;
        
        // Control states
        this.isActive = true;
        this.isDragging = false;
        this.isZooming = false;
        this.isGyroActive = false;
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
        
        // Gyroscope
        this.gyro = {
            alpha: 0,
            beta: 0,
            gamma: 0
        };
        
        // Swipe detection
        this.swipeThreshold = 50; // Minimum distance for a swipe
        this.swipeTimeout = null;
        this.swipeDirection = null;
        
        // Enhanced camera settings
        this.defaultDistance = 3.5; // Closer default distance (was 5)
        this.minDistance = 1.5;    // Minimum zoom distance (closer to artwork)
        this.maxDistance = 6;      // Maximum zoom distance
        this.rotationSensitivity = 0.003; // Reduced for smoother rotation (was 0.005)
        this.zoomSensitivity = 0.0008;    // Adjusted for better zoom feel (was 0.001)
        this.dampingFactor = 0.92;        // Added for smooth deceleration of movements
        
        // Camera motion
        this.momentum = { x: 0, y: 0 };
        this.isInertiaActive = true;
        
        // Initial camera position/target for resets
        this.initialCameraPosition = new THREE.Vector3(0, 0, this.defaultDistance);
        this.initialLookAtPosition = new THREE.Vector3(0, 0, 0);
        
        // Add debugging
        this.debug = window.location.hash === '#debug';
        
        // Event callbacks
        this.callbacks = {};
        
        // Setup
        this.setupEventListeners();
        this.setupOrbitControls();
        
        console.log('Controls initialized with enhanced settings');
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
        this.damping = 0.95; // Damping factor for smooth rotation
    }
    
    /**
     * Setup event listeners for user interactions
     */
    setupEventListeners() {
        if (this.debug) console.log('Setting up event listeners');
        
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
        
        // Gyroscope events (if available)
        if (window.DeviceOrientationEvent) {
            // Request permission for iOS 13+ devices
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                // Create gyroscope button
                const gyroButton = document.createElement('button');
                gyroButton.textContent = '🔄 Activar Giroscopio';
                gyroButton.style.position = 'fixed';
                gyroButton.style.bottom = '20px';
                gyroButton.style.left = '20px';
                gyroButton.style.zIndex = '100';
                gyroButton.style.padding = '8px 12px';
                gyroButton.style.backgroundColor = 'rgba(255,255,255,0.2)';
                gyroButton.style.color = '#fff';
                gyroButton.style.border = 'none';
                gyroButton.style.borderRadius = '20px';
                gyroButton.style.backdropFilter = 'blur(5px)';
                
                gyroButton.addEventListener('click', () => {
                    DeviceOrientationEvent.requestPermission()
                        .then(response => {
                            if (response === 'granted') {
                                this.isGyroActive = true;
                                gyroButton.style.display = 'none';
                                window.addEventListener('deviceorientation', this.onDeviceOrientation.bind(this));
                            }
                        })
                        .catch(console.error);
                });
                
                document.body.appendChild(gyroButton);
            } else {
                // Non-iOS devices
                window.addEventListener('deviceorientation', this.onDeviceOrientation.bind(this));
            }
        }
        
        // Create UI controls for zoom
        this.createZoomControls();
    }
    
    /**
     * Create zoom in/out buttons
     */
    createZoomControls() {
        // Create container
        const controlsContainer = document.createElement('div');
        controlsContainer.style.position = 'fixed';
        controlsContainer.style.bottom = '20px';
        controlsContainer.style.right = '20px';
        controlsContainer.style.zIndex = '100';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.flexDirection = 'column';
        controlsContainer.style.gap = '10px';
        
        // Zoom in button
        const zoomInButton = document.createElement('button');
        zoomInButton.innerHTML = '➕';
        zoomInButton.title = 'Acercar';
        zoomInButton.style.width = '40px';
        zoomInButton.style.height = '40px';
        zoomInButton.style.borderRadius = '50%';
        zoomInButton.style.border = 'none';
        zoomInButton.style.backgroundColor = 'rgba(255,255,255,0.2)';
        zoomInButton.style.color = '#fff';
        zoomInButton.style.fontSize = '18px';
        zoomInButton.style.cursor = 'pointer';
        zoomInButton.style.display = 'flex';
        zoomInButton.style.alignItems = 'center';
        zoomInButton.style.justifyContent = 'center';
        zoomInButton.style.backdropFilter = 'blur(5px)';
        
        // Zoom out button
        const zoomOutButton = document.createElement('button');
        zoomOutButton.innerHTML = '➖';
        zoomOutButton.title = 'Alejar';
        zoomOutButton.style.width = '40px';
        zoomOutButton.style.height = '40px';
        zoomOutButton.style.borderRadius = '50%';
        zoomOutButton.style.border = 'none';
        zoomOutButton.style.backgroundColor = 'rgba(255,255,255,0.2)';
        zoomOutButton.style.color = '#fff';
        zoomOutButton.style.fontSize = '18px';
        zoomOutButton.style.cursor = 'pointer';
        zoomOutButton.style.display = 'flex';
        zoomOutButton.style.alignItems = 'center';
        zoomOutButton.style.justifyContent = 'center';
        zoomOutButton.style.backdropFilter = 'blur(5px)';
        
        // Reset button
        const resetButton = document.createElement('button');
        resetButton.innerHTML = '🔄';
        resetButton.title = 'Resetear Vista';
        resetButton.style.width = '40px';
        resetButton.style.height = '40px';
        resetButton.style.borderRadius = '50%';
        resetButton.style.border = 'none';
        resetButton.style.backgroundColor = 'rgba(255,255,255,0.2)';
        resetButton.style.color = '#fff';
        resetButton.style.fontSize = '18px';
        resetButton.style.cursor = 'pointer';
        resetButton.style.display = 'flex';
        resetButton.style.alignItems = 'center';
        resetButton.style.justifyContent = 'center';
        resetButton.style.backdropFilter = 'blur(5px)';
        
        // Add event listeners
        zoomInButton.addEventListener('click', () => {
            this.zoomIn();
        });
        
        zoomOutButton.addEventListener('click', () => {
            this.zoomOut();
        });
        
        resetButton.addEventListener('click', () => {
            this.resetCameraView();
        });
        
        // Add buttons to container
        controlsContainer.appendChild(zoomInButton);
        controlsContainer.appendChild(zoomOutButton);
        controlsContainer.appendChild(resetButton);
        
        // Add container to document
        document.body.appendChild(controlsContainer);
    }
    
    /**
     * Handle key down events
     */
    onKeyDown(event) {
        // Check if active
        if (!this.isActive) return;
        
        switch (event.key) {
            case 'ArrowLeft':
                this.previousItem();
                break;
            case 'ArrowRight':
                this.nextItem();
                break;
            case 'ArrowUp':
                this.zoomIn();
                break;
            case 'ArrowDown':
                this.zoomOut();
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
        
        if (this.debug) console.log('Touch start:', event.touches.length);
        
        // Single touch (drag)
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.touchStart.x = event.touches[0].clientX;
            this.touchStart.y = event.touches[0].clientY;
            this.touchCurrent.x = this.touchStart.x;
            this.touchCurrent.y = this.touchStart.y;
            this.touchDelta.x = 0;
            this.touchDelta.y = 0;
            this.swipeDirection = null;
            
            // Store last position for momentum
            this.lastPosition = {
                x: this.touchStart.x,
                y: this.touchStart.y,
                time: Date.now()
            };
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
            
            // Calculate delta
            this.touchDelta.x = this.touchCurrent.x - this.touchStart.x;
            this.touchDelta.y = this.touchCurrent.y - this.touchStart.y;
            
            // Calculate momentum
            if (now - this.lastPosition.time > 20) { // Only update every 20ms for stability
                this.momentum.x = (x - this.lastPosition.x) * 0.05; // Scaling factor
                this.momentum.y = (y - this.lastPosition.y) * 0.05;
                
                this.lastPosition = {
                    x: x,
                    y: y,
                    time: now
                };
            }
            
            // Detect swipe direction
            if (Math.abs(this.touchDelta.x) > Math.abs(this.touchDelta.y)) {
                if (this.touchDelta.x > this.swipeThreshold) {
                    this.swipeDirection = 'right';
                } else if (this.touchDelta.x < -this.swipeThreshold) {
                    this.swipeDirection = 'left';
                }
            }
            
            // Apply rotation to camera based on touch movement
            this.applyTouchRotation();
        }
        // Double touch (pinch)
        else if (this.isZooming && event.touches.length === 2) {
            // Calculate current pinch distance
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            this.pinchCurrent = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate delta
            this.pinchDelta = this.pinchCurrent - this.pinchStart;
            
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
        
        if (this.debug) console.log('Touch end, swipe direction:', this.swipeDirection);
        
        // Handle swipe
        if (this.swipeDirection === 'left') {
            this.nextItem();
        } else if (this.swipeDirection === 'right') {
            this.previousItem();
        }
        
        // Reset states but keep momentum
        this.isDragging = false;
        this.isZooming = false;
        this.pinchDelta = 0;
        this.swipeDirection = null;
    }
    
    /**
     * Handle mouse down event
     */
    onMouseDown(event) {
        if (!this.isActive) return;
        
        if (this.debug) console.log('Mouse down');
        
        // Reset momentum
        this.momentum = { x: 0, y: 0 };
        
        this.isDragging = true;
        this.touchStart.x = event.clientX;
        this.touchStart.y = event.clientY;
        this.touchCurrent.x = this.touchStart.x;
        this.touchCurrent.y = this.touchStart.y;
        this.touchDelta.x = 0;
        this.touchDelta.y = 0;
        this.swipeDirection = null;
        
        // Store last position for momentum
        this.lastPosition = {
            x: this.touchStart.x,
            y: this.touchStart.y,
            time: Date.now()
        };
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
        if (now - this.lastPosition.time > 20) { // Only update every 20ms for stability
            this.momentum.x = (x - this.lastPosition.x) * 0.05; // Scaling factor
            this.momentum.y = (y - this.lastPosition.y) * 0.05;
            
            this.lastPosition = {
                x: x,
                y: y,
                time: now
            };
        }
        
        // Detect swipe direction
        if (Math.abs(this.touchDelta.x) > Math.abs(this.touchDelta.y)) {
            if (this.touchDelta.x > this.swipeThreshold) {
                this.swipeDirection = 'right';
            } else if (this.touchDelta.x < -this.swipeThreshold) {
                this.swipeDirection = 'left';
            }
        }
        
        // Apply rotation to camera
        this.applyTouchRotation();
    }
    
    /**
     * Handle mouse up event
     */
    onMouseUp(event) {
        if (!this.isActive) return;
        
        if (this.debug) console.log('Mouse up, swipe direction:', this.swipeDirection);
        
        // Handle swipe
        if (this.swipeDirection === 'left') {
            this.nextItem();
        } else if (this.swipeDirection === 'right') {
            this.previousItem();
        }
        
        // Reset state but keep momentum
        this.isDragging = false;
        this.swipeDirection = null;
    }
    
    /**
     * Handle mouse wheel event
     */
    onWheel(event) {
        if (!this.isActive) return;
        
        event.preventDefault();
        
        // Smoother zoom with wheel
        this.pinchDelta = event.deltaY * 0.02;
        
        // Apply zoom
        this.applyZoom();
    }
    
    /**
     * Apply rotation based on touch/mouse movement
     * Enhanced for smoother camera control
     */
    applyTouchRotation() {
        if (!this.camera || !this.isDragging) return;
        
        // Calculate rotation amount based on touch delta with sensitivity adjustment
        const rotX = this.touchDelta.y * this.rotationSensitivity;
        const rotY = this.touchDelta.x * this.rotationSensitivity;
        
        // Update current rotation
        this.cameraRotation.x += rotX;
        this.cameraRotation.y += rotY;
        
        // Limit vertical rotation more naturally (-60° to +60°)
        this.cameraRotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, this.cameraRotation.x));
        
        // Calculate new camera position based on rotation
        const distance = this.defaultDistance * this.cameraZoom; // Distance from lookAt point
        const cameraX = Math.sin(this.cameraRotation.y) * Math.cos(this.cameraRotation.x) * distance;
        const cameraY = Math.sin(this.cameraRotation.x) * distance;
        const cameraZ = Math.cos(this.cameraRotation.y) * Math.cos(this.cameraRotation.x) * distance;
        
        // Create new position vector
        const newPosition = new THREE.Vector3(
            cameraX + this.initialLookAtPosition.x,
            cameraY + this.initialLookAtPosition.y,
            cameraZ + this.initialLookAtPosition.z
        );
        
        // Update camera using its existing methods with faster response time
        if (this.camera.moveTo) {
            this.camera.moveTo(newPosition, this.initialLookAtPosition, 0.15);
        }
    }
    
    /**
     * Apply zoom based on pinch/wheel
     * Enhanced for smoother zoom experience
     */
    applyZoom() {
        if (!this.camera) return;
        
        // Convert pinch delta to zoom factor with sensitivity adjustment
        const zoomFactor = this.pinchDelta * this.zoomSensitivity;
        
        // Update zoom level with improved limits
        this.cameraZoom = Math.max(this.minDistance / this.defaultDistance, 
                              Math.min(this.maxDistance / this.defaultDistance, 
                                  this.cameraZoom - zoomFactor));
        
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
        
        // Zoom in by 10%
        this.cameraZoom = Math.max(this.minDistance / this.defaultDistance, 
                              this.cameraZoom * 0.9);
        
        // Apply zoom
        this.applyTouchRotation();
    }
    
    /**
     * Zoom out by a fixed amount
     */
    zoomOut() {
        if (!this.camera) return;
        
        // Zoom out by 10%
        this.cameraZoom = Math.min(this.maxDistance / this.defaultDistance,
                              this.cameraZoom * 1.1);
        
        // Apply zoom
        this.applyTouchRotation();
    }
    
    /**
     * Handle device orientation event (gyroscope)
     */
    onDeviceOrientation(event) {
        if (!this.isActive || !this.isGyroActive) return;
        
        // Get gyroscope data
        this.gyro.alpha = event.alpha || 0; // Z-axis (0-360)
        this.gyro.beta = event.beta || 0;   // X-axis (-180-180)
        this.gyro.gamma = event.gamma || 0; // Y-axis (-90-90)
        
        if (this.debug) {
            console.log('Gyro data:', 
                this.gyro.alpha.toFixed(1),
                this.gyro.beta.toFixed(1),
                this.gyro.gamma.toFixed(1)
            );
        }
        
        // Apply gyroscope rotation with reduced sensitivity for smoother experience
        this.applyGyroRotation();
    }
    
    /**
     * Apply rotation based on gyroscope data
     * Enhanced for smoother experience
     */
    applyGyroRotation() {
        if (!this.camera) return;
        
        // Convert gyro data to radians with reduced sensitivity
        const betaRad = THREE.MathUtils.degToRad(this.gyro.beta * 0.3);
        const gammaRad = THREE.MathUtils.degToRad(this.gyro.gamma * 0.3);
        
        // Update rotation with smooth lerping
        this.cameraRotation.x = THREE.MathUtils.lerp(this.cameraRotation.x, betaRad, 0.05);
        this.cameraRotation.y = THREE.MathUtils.lerp(this.cameraRotation.y, gammaRad, 0.05);
        
        // Apply rotation (reuse same function as touch rotation)
        this.applyTouchRotation();
    }
    
    /**
     * Navigate to the next item
     */
    nextItem() {
        if (this.currentIndex < this.totalItems - 1) {
            this.currentIndex++;
            this.emit('itemChange', this.currentIndex);
            
            if (this.debug) console.log('Next item:', this.currentIndex);
            
            // Reset camera position and rotation
            this.resetCameraView();
            
            // Update UI
            this.updateNavDots();
            
            // Show gesture hint
            this.showGestureHint();
        }
    }
    
    /**
     * Navigate to the previous item
     */
    previousItem() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.emit('itemChange', this.currentIndex);
            
            if (this.debug) console.log('Previous item:', this.currentIndex);
            
            // Reset camera position and rotation
            this.resetCameraView();
            
            // Update UI
            this.updateNavDots();
            
            // Show gesture hint
            this.showGestureHint();
        }
    }
    
    /**
     * Reset camera to default view for current item
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
     * Show gesture hint
     */
    showGestureHint() {
        const gestureHint = document.getElementById('gesture-hint');
        if (!gestureHint) return;
        
        // Show hint
        gestureHint.classList.add('visible');
        
        // Hide after 2 seconds
        setTimeout(() => {
            gestureHint.classList.remove('visible');
        }, 2000);
    }
    
    /**
     * Set total number of items
     */
    setTotalItems(count) {
        this.totalItems = count;
        if (this.debug) console.log('Total items set:', count);
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
        this.cameraRotation.y += this.momentum.x * this.rotationSensitivity;
        this.cameraRotation.x += this.momentum.y * this.rotationSensitivity;
        
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