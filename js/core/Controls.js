/**
 * Controls class
 * Handles user interactions (touch, mouse) for artwork navigation and viewing
 * Implements trackball rotation for intuitive 3D manipulation
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
        
        // Trackball rotation
        this.trackballRadius = 0.8; // Virtual sphere radius as a fraction of the smallest screen dimension
        this.rotationMatrix = new THREE.Matrix4();
        this.currentRotation = new THREE.Quaternion();
        this.targetRotation = new THREE.Quaternion();
        
        // Pinch/zoom
        this.pinchStart = 0;
        this.pinchCurrent = 0;
        this.pinchDelta = 0;
        
        // Camera controls
        this.cameraRotation = { x: 0, y: 0 };
        this.cameraZoom = 1;
        
        // Swipe detection
        this.swipeThreshold = this.isMobileDevice() ? 70 : 150;  // Mayor umbral en móviles
        this.swipeVerticalThreshold = 'ontouchstart' in window ? 70 : 50;
        this.swipeDirection = null;
        this.swipeVerticalDirection = null;
        
        // Camera settings
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
        this.zoomConfig = {
            minZoom: 0.5,            // Factor mínimo de zoom (1 = 100%)
            maxZoom: 3.0,            // Factor máximo de zoom (3 = 300%)
            defaultZoom: 1.0,        // Zoom por defecto
            currentZoom: 1.0,        // Zoom actual
            targetZoom: 1.0,         // Zoom objetivo para animación
            zoomSmoothness: 0.08,    // Suavidad de animación (0.08 = suave, 0.2 = más rápido)
            mouseWheelSpeed: 0.05,   // Velocidad de zoom con rueda de ratón
            pinchSpeed: 0.01,        // Velocidad de zoom con pellizco en móvil
            zoomCenter: new THREE.Vector2(0, 0),  // Centro de zoom para zoom a un punto
            zoomCenterObject: null,  // Objeto que está en el centro del zoom
            zoomAnimation: null,     // Para gestionar la animación de zoom
            zoomInProgress: false,   // Si hay un zoom en progreso
            zoomHintShown: false     // Si se ha mostrado el hint de zoom
        };

        this.lastPosition = {
            x: 0,
            y: 0,
            time: Date.now()
        };
        
        // Initial camera position/target for resets
        this.initialCameraPosition = new THREE.Vector3(0, 0, this.defaultDistance);
        this.initialLookAtPosition = new THREE.Vector3(0, 0, 0);

        this.allowArtworkRotation = true;

        
        // Event callbacks
        this.callbacks = {};
        
        // Setup
        this.setupEventListeners();
        this.setupTrackballControls();
    }
    
    /**
     * Setup trackball controls
     */
    setupTrackballControls() {
        // Initialize rotation matrix to identity
        this.rotationMatrix.identity();
        this.currentRotation.identity();
        this.targetRotation.identity();
        
        // Set initial rotation velocity
        this.rotationVelocity = new THREE.Vector2(0, 0);
        this.damping = 0.98; // Increased from 0.92 for more persistent rotation
        
        // Create axis of rotation visualization for debugging if needed
        this.axisOfRotation = new THREE.Vector3(0, 1, 0);
        
        // Rotation sensitivity - higher value means more rotation for the same mouse/touch movement
        this.trackballSensitivity = 2.5; // Default was effectively 1.0
    }
    
    /**
     * Projects a 2D screen point onto the trackball sphere
     * @param {Number} x - Screen X coordinate
     * @param {Number} y - Screen Y coordinate
     * @returns {THREE.Vector3} - 3D point on the trackball sphere
     */
    projectOntoSphere(x, y) {
        // Calculate normalized device coordinates (-1 to 1)
        const width = this.sizes.width;
        const height = this.sizes.height;
        const radius = Math.min(width, height) * this.trackballRadius;
        
        // Convert screen coordinates to normalized device coordinates
        const nx = (x / width) * 2 - 1;
        const ny = -((y / height) * 2 - 1);
        
        // Calculate the squared distance from the center of the screen
        const dist2 = nx * nx + ny * ny;
        
        let nz;
        // If the point is inside the trackball sphere
        if (dist2 <= 1.0) {
            // Project the point onto the sphere (Pythagoras)
            nz = Math.sqrt(1.0 - dist2);
        } else {
            // Project the point onto the hyperbolic sheet
            nz = 1.0 / Math.sqrt(dist2);
            // Normalize x and y
            const norm = 1.0 / Math.sqrt(dist2);
            nx *= norm;
            ny *= norm;
        }
        
        return new THREE.Vector3(nx, ny, nz).normalize();
    }
    
    /**
     * Calculates rotation from two trackball points
     * @param {THREE.Vector3} start - Starting point on trackball
     * @param {THREE.Vector3} end - Ending point on trackball
     * @returns {THREE.Quaternion} - Resulting rotation
     */
    getRotationBetweenVectors(start, end) {
        const axis = new THREE.Vector3().crossVectors(start, end).normalize();
        
        // If axis is zero (points are the same or opposite), no rotation
        if (axis.lengthSq() < 0.0001) {
            return new THREE.Quaternion();
        }
        
        const angle = Math.acos(Math.min(1.0, Math.max(-1.0, start.dot(end))));
        
        // Store axis for visualization if needed
        this.axisOfRotation.copy(axis);
        
        return new THREE.Quaternion().setFromAxisAngle(axis, angle);
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
        
        
        // Reset momentum
        this.momentum = { x: 0, y: 0 };
        this.rotationVelocity.set(0, 0);

        const currentItem = this.getCurrentItem();
        if (currentItem && currentItem.rotationController && 
            event.touches.length === 1 && 
            event.target === this.canvas) {
            this.allowArtworkRotation = true;
            // Guardar tiempo para posible doble tap
            this.touchStartTime = Date.now();
            
            // Almacenar posición inicial para detectar si es un swipe
            this.touchStart.x = event.touches[0].clientX;
            this.touchStart.y = event.touches[0].clientY;
            this.touchCurrent.x = this.touchStart.x;
            this.touchCurrent.y = this.touchStart.y;
            this.touchDelta.x = 0;
            this.touchDelta.y = 0;
            
            return;
        }
        
        
        this.allowArtworkRotation = false;
        
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
            
            // Store the initial trackball point
            this.startTrackballPoint = this.projectOntoSphere(this.touchStart.x, this.touchStart.y);
            
            // Store time for possible double tap
            this.touchStartTime = Date.now();
            
            // Show zoom hint if it's the user's first interaction
            if (!this.zoomConfig.zoomHintShown) {
                setTimeout(() => {
                    this.showGestureHint("Pinch to zoom, double tap to focus");
                    this.zoomConfig.zoomHintShown = true;
                }, 1000);
            }
        }
        // Double touch (pinch)
        else if (event.touches.length === 2) {
            this.isDragging = false;
            this.isZooming = true;
            
            // Reset pinch values
            this.pinchStart = 0;
            this.zoomConfig.zoomStartValue = this.zoomConfig.currentZoom;
            
            // Process the first pinch event
            this.handlePinchZoom(event);
            
            // Show gesture hint
            this.showGestureHint("Pinch to zoom in/out");
        }
    }
    
    /**
     * Handle touch move event
     */
    onTouchMove(event) {
        if (!this.isActive) return;
        
        if (this.isDragging || this.isZooming) {
            event.preventDefault();
        }
        if (this.isZooming && event.touches.length === 2) {
            this.handlePinchZoom(event);
            return;
        }

        if (this.allowArtworkRotation) {
            const currentItem = this.getCurrentItem();
            if (currentItem && currentItem.rotationController) {
                // Solo registramos el movimiento para detectar swipes
                if (event.touches.length === 1) {
                    const x = event.touches[0].clientX;
                    const y = event.touches[0].clientY;
                    
                    this.touchCurrent.x = x;
                    this.touchCurrent.y = y;
                    
                    // Calcular delta para detección de swipe
                    this.touchDelta.x = (this.touchCurrent.x - this.touchStart.x);
                    this.touchDelta.y = (this.touchCurrent.y - this.touchStart.y);
                    
                    // Detectar si es un swipe horizontal significativo
                    if (Math.abs(this.touchDelta.x) > this.swipeThreshold * 1.5 && 
                        Math.abs(this.touchDelta.x) > Math.abs(this.touchDelta.y) * 2) {
                        // Es claramente un intento de swipe horizontal, no rotación
                        if (this.touchDelta.x > 0) {
                            this.swipeDirection = 'right';
                        } else {
                            this.swipeDirection = 'left';
                        }
                    }
                }
                return;
            }
        }
        
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
            
            // Calculate velocity for momentum - increased multiplier for more significant effect
            if (now - this.lastPosition.time > 10) {
                this.rotationVelocity.x = (x - this.lastPosition.x) * 0.06; // Increased from 0.02
                this.rotationVelocity.y = (y - this.lastPosition.y) * 0.06; // Increased from 0.02
                
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
            
            // If not swiping, apply trackball rotation
            if (!this.swipeDirection && !this.swipeVerticalDirection) {
                const currentItem = this.getCurrentItem();
                
                if (currentItem && currentItem.handleTrackballRotation) {
                    // Apply rotation to the current item if it has a custom handler
                    this.applyTrackballRotation(currentItem);
                } else {
                    // Otherwise apply to the camera
                    this.applyTrackballRotation();
                }
            }
        }
    }
    
    /**
     * Apply trackball rotation based on touch/mouse movement
     * @param {Object} item - Optional item to rotate instead of camera
     */
    applyTrackballRotation(item = null) {
        if (!this.isDragging) return;
        
        // Get the current point on the trackball
        const currentTrackballPoint = this.projectOntoSphere(this.touchCurrent.x, this.touchCurrent.y);
        
        // Calculate rotation between start and current points
        const rotationDelta = this.getRotationBetweenVectors(this.startTrackballPoint, currentTrackballPoint);
        
        if (item) {
            // Apply rotation to the item with increased sensitivity
            item.applyTrackballRotation(rotationDelta, this.rotationVelocity);
        } else {
            // Apply rotation to the camera's target orientation with increased sensitivity
            // Use a temporary quaternion to apply a more pronounced rotation 
            const amplifiedRotation = new THREE.Quaternion();
            amplifiedRotation.copy(rotationDelta);
            
            // Adjust rotation to be more pronounced (effectively increasing sensitivity)
            // This technique helps maintain the rotation axis but increases the angle
            const angle = 2.0 * Math.acos(amplifiedRotation.w);
            if (angle > 0.0001) { // Avoid division by zero
                const sinHalfAngle = Math.sin(angle / 2);
                const axis = new THREE.Vector3(
                    amplifiedRotation.x / sinHalfAngle,
                    amplifiedRotation.y / sinHalfAngle,
                    amplifiedRotation.z / sinHalfAngle
                );
                // Create new quaternion with amplified angle but same axis
                const newAngle = angle * this.trackballSensitivity; // Apply sensitivity multiplier
                amplifiedRotation.setFromAxisAngle(axis, newAngle);
            }
            
            // Apply the amplified rotation
            this.targetRotation.multiplyQuaternions(amplifiedRotation, this.currentRotation);
            this.currentRotation.slerp(this.targetRotation, 0.3); // Faster follow-up
            
            // Update the camera position based on the rotation
            this.updateCameraPosition();
        }
        
        // Update start point for the next frame
        this.startTrackballPoint = currentTrackballPoint;
    }
    
    /**
     * Update camera position based on current rotation and zoom
     */
    updateCameraPosition() {
        if (!this.camera) return;
        
        // Calculate the camera position based on the rotation
        const distance = this.defaultDistance * this.cameraZoom;
        
        // Start with the initial position
        const initialPosition = new THREE.Vector3(0, 0, distance);
        
        // Apply the current rotation to the position
        initialPosition.applyQuaternion(this.currentRotation);
        
        // Add the target position (usually the center of the scene)
        const newPosition = initialPosition.add(this.initialLookAtPosition);
        
        // Update camera position
        if (this.camera.moveTo) {
            this.camera.moveTo(newPosition, this.initialLookAtPosition, 0.2);
        }
    }
    
    /**
     * Handle touch end event
     */
    onTouchEnd(event) {
        if (!this.isActive) return;
        
        const now = Date.now();
        const touchDuration = now - this.touchStartTime;
        if (this.allowArtworkRotation) {
            // Para swipes rápidos horizontales claros, cambiar de obra
            if (touchDuration < 400 && Math.abs(this.touchDelta.x) > this.swipeThreshold * 1.5 &&
                Math.abs(this.touchDelta.x) > Math.abs(this.touchDelta.y) * 2) {
                
                if (this.touchDelta.x > 0) {
                    this.previousItem();
                } else {
                    this.nextItem();
                }
                
                // Resetear estados después de la navegación
                this.allowArtworkRotation = false;
                this.isDragging = false;
                this.isZooming = false;
                this.swipeDirection = null;
                return;
            }
            
            // Detectar doble tap para zoom o reset
            if (touchDuration < 300 && Math.abs(this.touchDelta.x) < 10 && Math.abs(this.touchDelta.y) < 10) {
                const currentTime = now;
                const tapLength = currentTime - this.lastTapTime;
                
                if (tapLength < 300 && tapLength > 0) {
                    // Doble tap detectado
                    this.onDoubleTap(this.touchCurrent.x, this.touchCurrent.y);
                    event.preventDefault();
                }
                
                this.lastTapTime = currentTime;
            }
            
            return;
        }
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
        // Get object at the double tap position
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -((y / window.innerHeight) * 2 - 1)
        );
        
        raycaster.setFromCamera(mouse, this.camera.instance);
        
        // Look for intersections with objects in the scene
        const currentItem = this.getCurrentItem();
        if (!currentItem || !currentItem.mesh) return;
        
        // Decide whether to zoom in or out
        if (this.zoomConfig.currentZoom > 1.5) {
            // Already zoomed in, zoom out
            this.zoomConfig.targetZoom = this.zoomConfig.defaultZoom;
            this.zoomConfig.zoomCenterObject = null;
        } else {
            // Zoom in towards the object
            this.zoomToObject(currentItem.mesh, 2.5);
        }
        
        // Start animation
        this.startZoomAnimation();
        
        // Show indicator
        this.showZoomIndicator(this.zoomConfig.targetZoom);
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
        this.rotationVelocity.set(0, 0);
        
        // Store the initial trackball point
        this.startTrackballPoint = this.projectOntoSphere(this.touchStart.x, this.touchStart.y);
        
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
        
        // Calculate velocity for momentum - with much higher sensitivity
        // Calculate instantaneous velocity with higher multiplier
        const deltaTime = Math.max(1, now - this.lastPosition.time); // Avoid division by zero
        this.rotationVelocity.x = (x - this.lastPosition.x) / deltaTime * 0.5; // Much higher value
        this.rotationVelocity.y = (y - this.lastPosition.y) / deltaTime * 0.5; // Much higher value
        
        // Debug log
        console.log(`Mouse move velocity: ${this.rotationVelocity.x.toFixed(5)}, ${this.rotationVelocity.y.toFixed(5)}`);
        
        this.lastPosition = {
            x: x,
            y: y,
            time: now
        };
        
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
            // Check if current item has custom rotation handler
            const currentItem = this.getCurrentItem();
            
            if (currentItem && currentItem.handleTrackballRotation) {
                this.applyTrackballRotation(currentItem);
            } else {
                this.applyTrackballRotation();
            }
        }
    }
    
    /**
     * Handle mouse up event
     */
    onMouseUp(event) {
        if (!this.isActive) return;
        
        // Get current item to apply final rotation impulse
        const currentItem = this.getCurrentItem();
        
        // If we weren't swiping, apply a final velocity boost on release
        if (!this.swipeDirection && !this.swipeVerticalDirection && currentItem) {
            // Give a final velocity boost for more dramatic effect
            const boostFactor = 3.0;
            
            if (currentItem.handleTrackballRotation) {
                currentItem.rotationVelocity = {
                    x: this.rotationVelocity.x * boostFactor,
                    y: this.rotationVelocity.y * boostFactor
                };
                
                console.log(`Final velocity boost: ${currentItem.rotationVelocity.x.toFixed(5)}, ${currentItem.rotationVelocity.y.toFixed(5)}`);
            }
        }
        
        // Handle horizontal swipe for artwork navigation
        if (this.swipeDirection === 'left') {
            this.nextItem();
        } else if (this.swipeDirection === 'right') {
            this.previousItem();
        }
        
        // Reset state but keep velocity for smooth deceleration
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
        
        // Scroll direction (+1 down, -1 up)
        const direction = Math.sign(event.deltaY);
        
        // Calculate speed based on wheel velocity
        const speed = this.zoomConfig.mouseWheelSpeed * Math.min(Math.abs(event.deltaY), 100) / 100;
        
        // Calculate new target zoom
        const newZoom = this.zoomConfig.targetZoom * (1 - direction * speed);
        
        // Limit zoom to min and max
        this.zoomConfig.targetZoom = Math.max(
            this.zoomConfig.minZoom,
            Math.min(this.zoomConfig.maxZoom, newZoom)
        );
        
        // Store mouse position for zoom towards that point
        this.zoomConfig.zoomCenter.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.zoomConfig.zoomCenter.y = -((event.clientY / window.innerHeight) * 2 - 1);
        
        // Start zoom animation if not in progress
        this.startZoomAnimation();
        
        // Notify zoom change via event
        this.emit('zoomChange', this.zoomConfig.targetZoom);
        
        // Show zoom hint if it's the first time
        if (!this.zoomConfig.zoomHintShown) {
            this.showGestureHint(direction > 0 ? "Zoom out" : "Zoom in");
            this.zoomConfig.zoomHintShown = true;
        }
    }
    
    /**
     * Handle pinch zoom (replacing the existing function)
     */
    handlePinchZoom(event) {
        if (!this.isActive || !this.isZooming) return;
        
        // Calculate current distance between fingers
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If it's the first event, initialize
        if (this.pinchStart === 0) {
            this.pinchStart = distance;
            this.zoomConfig.zoomStartValue = this.zoomConfig.currentZoom;
            return;
        }
        
        // Calculate zoom factor based on distance difference
        const pinchRatio = distance / this.pinchStart;
        const zoomDelta = (pinchRatio - 1) * this.zoomConfig.pinchSpeed * 2;
        
        // Apply zoom based on pinch movement
        const newZoom = this.zoomConfig.zoomStartValue * (1 + zoomDelta * 30);  // Aumentar factor de 20 a 30

        
        // Limit to min/max zoom
        this.zoomConfig.targetZoom = Math.max(
            this.zoomConfig.minZoom,
            Math.min(this.zoomConfig.maxZoom, newZoom)
        );
        
        // Calculate the pinch center for zooming towards that point
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        this.zoomConfig.zoomCenter.x = (centerX / window.innerWidth) * 2 - 1;
        this.zoomConfig.zoomCenter.y = -((centerY / window.innerHeight) * 2 - 1);
        
        this.zoomConfig.zoomSmoothness = 0.12;
        // Start zoom animation
        this.startZoomAnimation();
        
        // Emit zoom change event
        this.emit('zoomChange', this.zoomConfig.targetZoom);
        
        // Show zoom indicator on screen
        this.showZoomIndicator(this.zoomConfig.targetZoom);
    }

    // Function to start zoom animation
    startZoomAnimation() {
        // Mark that zoom is in progress
        this.zoomConfig.zoomInProgress = true;
        
        // Cancel previous animation if exists
        if (this.zoomConfig.zoomAnimation) {
            cancelAnimationFrame(this.zoomConfig.zoomAnimation);
        }
        
        // Function for zoom animation
        const animateZoom = () => {
            // Calculate smooth interpolation between current and target zoom
            this.zoomConfig.currentZoom += (this.zoomConfig.targetZoom - this.zoomConfig.currentZoom) 
                * this.zoomConfig.zoomSmoothness;
            
            // Update camera based on new zoom
            this.updateCameraZoom();
            
            // Continue animation if we're not close enough to the target
            if (Math.abs(this.zoomConfig.currentZoom - this.zoomConfig.targetZoom) > 0.001) {
                this.zoomConfig.zoomAnimation = requestAnimationFrame(animateZoom);
            } else {
                // Finalize animation
                this.zoomConfig.zoomInProgress = false;
                this.zoomConfig.currentZoom = this.zoomConfig.targetZoom;
                this.updateCameraZoom();
            }
        };
        
        // Start animation
        this.zoomConfig.zoomAnimation = requestAnimationFrame(animateZoom);
    }

    // Function to update camera during zoom
    updateCameraZoom() {
        if (!this.camera) return;
        
        // Get zoom factor relative to default value
        const zoomFactor = this.zoomConfig.currentZoom / this.zoomConfig.defaultZoom;
        
        // Store the new zoom level
        this.cameraZoom = 1 / zoomFactor;
        
        // Update camera position
        this.updateCameraPosition();
    }

    // Show zoom level indicator on screen
    showZoomIndicator(zoomLevel) {
        // Check if UI exists
        if (!this.ui) return;
        
        // Calculate zoom percentage
        const zoomPercent = Math.round(zoomLevel * 100);
        
        // Show hint with zoom level
        this.showGestureHint(`Zoom: ${zoomPercent}%`);
    }

    // Method to zoom towards a specific object (called on double click)
    zoomToObject(object, targetZoom = null) {
        if (!object || !this.camera) return;
        
        // Save object as zoom center
        this.zoomConfig.zoomCenterObject = object;
        
        // Set zoom level, or use 2.5x as default
        this.zoomConfig.targetZoom = targetZoom || 2.5;
        
        // Start animation
        this.startZoomAnimation();
        
        // Emit zoom event
        this.emit('zoomChange', this.zoomConfig.targetZoom);
        
        // Show indicator
        this.showZoomIndicator(this.zoomConfig.targetZoom);
        
        // Clear zoom center after animation completes
        setTimeout(() => {
            this.zoomConfig.zoomCenterObject = null;
        }, 1000);
    }
    
    /**
     * Navigate to the next item
     */
    nextItem() {
        const oldIndex = this.currentIndex;
    
        // Toroidal navigation: If at the last item, loop to the first item
        if (this.currentIndex >= this.totalItems - 1) {
            this.currentIndex = 0;
        } else {
            this.currentIndex++;
        }
        
        this.emit('itemChange', this.currentIndex);
        
        // Direction is always 'left' for next item transitions
        this.resetCameraViewHorizontal('left');
        
        // Update UI
        this.updateNavDots('right'); // Pass navigation direction to updateNavDots
        
        // Show gesture hint
        this.showGestureHint("Swipe left/right to navigate");
    }
    
    /**
     * Navigate to the previous item
     */
    previousItem() {
        const oldIndex = this.currentIndex;
    
        // Toroidal navigation: If at the first item, loop to the last item
        if (this.currentIndex <= 0) {
            this.currentIndex = this.totalItems - 1;
        } else {
            this.currentIndex--;
        }
        
        this.emit('itemChange', this.currentIndex);
        
        // Direction is always 'right' for previous item transitions
        this.resetCameraViewHorizontal('right');
        
        // Update UI
        this.updateNavDots('left'); // Pass navigation direction to updateNavDots
        
        // Show gesture hint
        this.showGestureHint("Swipe left/right to navigate");
    }
    
    
    /**
     * Reset camera view with horizontal transition effect
     */
    resetCameraViewHorizontal(direction) {
        // Reset rotation and zoom
        this.currentRotation.identity();
        this.targetRotation.identity();
        this.cameraZoom = 1;
        this.rotationVelocity.set(0, 0);
        
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
        this.currentRotation.identity();
        this.targetRotation.identity();
        this.cameraZoom = 1;
        this.rotationVelocity.set(0, 0);
        
        if (this.camera && this.camera.moveTo) {
            this.camera.moveTo(
                this.initialCameraPosition,
                this.initialLookAtPosition,
                0.7
            );
        }
    }
    /**
     * Detect if the current device is mobile
     * @returns {boolean} True if the device is mobile, false otherwise
     */
    isMobileDevice() {
        return (
            'ontouchstart' in window || 
            navigator.maxTouchPoints > 0 || 
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        );
    }
    /**
     * Update navigation dots in the UI
     */
    updateNavDots() {
        const navDots = document.getElementById('nav-dots');
        if (!navDots) return;
        const currentIndex = this.currentIndex;
        const totalItems = this.totalItems;
        // Clear existing dots
        navDots.innerHTML = '';
        
        // Create new dots
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'nav-dot';
            
            // The middle dot (i=1) is always active, representing the current item
            if (this.currentIndex % 3 == i) {
                dot.classList.add('active');
            }
            
            // Calculate which item this dot represents
            // For a 3-dot system: [prev, current, next]
            let itemIndex;
            if (i === 0) { // Previous item
                itemIndex = (currentIndex - 1 + totalItems) % totalItems;
            } else if (i === 1) { // Current item
                itemIndex = currentIndex;
            } else { // Next item
                itemIndex = (currentIndex + 1) % totalItems;
            }
            
            // Store item index as data attribute
            dot.dataset.index = itemIndex;
            
            // Add click event
            dot.addEventListener('click', () => {
                if (this.controls) {
                    const clickedIndex = parseInt(dot.dataset.index);
                    
                    // Determine direction based on clicked dot
                    const direction = (i === 0) ? 'left' : 
                                     (i === 2) ? 'right' : null;
                    
                    // Only navigate if clicked dot is not the current one
                    if (clickedIndex !== currentIndex) {
                        this.currentIndex = clickedIndex;
                        this.emit('itemChange', clickedIndex);
                        this.resetCameraView();
                        this.updateNavDots(direction);
                    }
                }
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
     * Apply momentum effect for smoother rotation
     */
    applyMomentum() {
        if (!this.isInertiaActive || this.isDragging) return;
        
        // Only apply momentum if there's significant velocity
        const velocityMagnitude = this.rotationVelocity.length();
        if (velocityMagnitude < 0.001) return;
        
        // Reduce velocity over time (damping)
        this.rotationVelocity.multiplyScalar(this.damping);
        
        // Create movement vector for trackball
        const movement = this.rotationVelocity.clone();
        
        // Create start and end points for trackball rotation
        const center = { x: this.sizes.width / 2, y: this.sizes.height / 2 };
        const startPoint = this.projectOntoSphere(center.x, center.y);
        const endPoint = this.projectOntoSphere(center.x + movement.x * 100, center.y + movement.y * 100);
        
        // Calculate rotation from these points
        const momentumRotation = this.getRotationBetweenVectors(startPoint, endPoint);
        
        // Apply rotation
        this.currentRotation.multiplyQuaternions(momentumRotation, this.currentRotation);
        
        // Update camera position
        this.updateCameraPosition();
    }
    
    /**
     * Update controls on each frame
     */
    update() {
        // Smoothly interpolate between current and target rotation
        if (!this.isDragging && !this.currentRotation.equals(this.targetRotation)) {
            this.currentRotation.slerp(this.targetRotation, 0.1);
            this.updateCameraPosition();
        }
        
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