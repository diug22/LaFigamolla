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
        this.defaultDistance = 5; // Aumentado para una vista inicial más lejana (era 3.5)
        this.minDistance = 2;    // Ajustado para un zoom mínimo más razonable (era 1.5)
        this.maxDistance = 8;    // Aumentado para permitir alejarse más (era 6)
        this.rotationSensitivity = 0.001; // Reducido para rotación más lenta (era 0.003)
        this.zoomSensitivity = 0.0004;    // Reducido para zoom más lento (era 0.0008)
        this.dampingFactor = 0.95; 
        
        // Camera motion
        this.momentum = { x: 0, y: 0 };
        this.isInertiaActive = true;

        // Añadir esta propiedad para mejorar el zoom con pellizco:
        this.pinchZoomEnabled = true;
        this.pinchZoomSensitivity = 0.05; // Sensibilidad más suave para el zoom con pellizco
        
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
        this.createResetButton();
    }
    
    /**
     * Create zoom in/out buttons
     */
    createResetButton() {
        // Create reset button
        const resetButton = document.createElement('button');
        resetButton.innerHTML = '🔄';
        resetButton.title = 'Resetear Vista';
        resetButton.style.position = 'fixed';
        resetButton.style.bottom = '20px';
        resetButton.style.left = '20px';  // Posicionado a la izquierda
        resetButton.style.zIndex = '100';
        resetButton.style.background = 'rgba(255,255,255,0.2)';
        resetButton.style.color = '#fff';
        resetButton.style.border = 'none';
        resetButton.style.borderRadius = '50%';
        resetButton.style.width = '40px';
        resetButton.style.height = '40px';
        resetButton.style.cursor = 'pointer';
        resetButton.style.display = 'flex';
        resetButton.style.alignItems = 'center';
        resetButton.style.justifyContent = 'center';
        resetButton.style.backdropFilter = 'blur(5px)';
        
        // Add event listener
        resetButton.addEventListener('click', () => {
            this.resetCameraView();
        });
        
        // Add button to document
        document.body.appendChild(resetButton);
        this.resetButton = resetButton;
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
            this.isZooming = false; // Asegurarse de que no estamos en modo zoom
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
            
            // Añadir un pequeño umbral de tiempo para distinguir entre toques y arrastres
            this.touchStartTime = Date.now();
        }
        // Double touch (pinch) - mejorado para dispositivos móviles
        else if (event.touches.length === 2) {
            this.isDragging = false;
            this.isZooming = true;
            
            // Calculate initial pinch distance more accurately
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
            
            // Show a hint that tells the user they're zooming
            this.showGestureHint('Pellizca para acercar o alejar');
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
            
            // Calculate delta con movimiento más lento
            this.touchDelta.x = (this.touchCurrent.x - this.touchStart.x) * 0.5; // Reducido 50%
            this.touchDelta.y = (this.touchCurrent.y - this.touchStart.y) * 0.5; // Reducido 50%
            
            // Calculate momentum con aceleración reducida
            if (now - this.lastPosition.time > 20) {
                this.momentum.x = (x - this.lastPosition.x) * 0.02; // Reducido (era 0.05)
                this.momentum.y = (y - this.lastPosition.y) * 0.02; // Reducido (era 0.05)
                
                this.lastPosition = {
                    x: x,
                    y: y,
                    time: now
                };
            }
            
            // Detect swipe direction con umbral aumentado para evitar swipes accidentales
            if (Math.abs(this.touchDelta.x) > Math.abs(this.touchDelta.y)) {
                if (this.touchDelta.x > this.swipeThreshold * 1.5) {
                    this.swipeDirection = 'right';
                } else if (this.touchDelta.x < -this.swipeThreshold * 1.5) {
                    this.swipeDirection = 'left';
                }
            }
            
            // Apply rotation to camera based on touch movement
            this.applyTouchRotation();
        }
        // Double touch (pinch) - mejorado para zoom más suave
        else if (this.isZooming && event.touches.length === 2) {
            // Calculate current pinch distance
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            this.pinchCurrent = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate delta con mayor suavidad
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
        
        if (this.debug) console.log('Touch end, swipe direction:', this.swipeDirection);
        
        const now = Date.now();
        const touchDuration = now - this.touchStartTime;
        
        // Detect double tap (toques rápidos en la misma área)
        if (touchDuration < 300 && Math.abs(this.touchDelta.x) < 10 && Math.abs(this.touchDelta.y) < 10) {
            // Es un toque rápido, no un arrastre
            const currentTime = now;
            const tapLength = currentTime - this.lastTapTime;
            
            if (tapLength < 300 && tapLength > 0) {
                // Doble toque detectado
                this.onDoubleTap(this.touchCurrent.x, this.touchCurrent.y);
                event.preventDefault();
            }
            
            this.lastTapTime = currentTime;
        } 
        // Handle swipe with reduced sensitivity (less accidental swipes)
        else if (touchDuration < 400) { // Solo detectar swipes rápidos
            if (this.swipeDirection === 'left' && Math.abs(this.touchDelta.x) > this.swipeThreshold * 1.2) {
                this.nextItem();
            } else if (this.swipeDirection === 'right' && Math.abs(this.touchDelta.x) > this.swipeThreshold * 1.2) {
                this.previousItem();
            }
        }
        
        // Reset states but keep momentum
        this.isDragging = false;
        this.isZooming = false;
        this.pinchDelta = 0;
        this.swipeDirection = null;
    }

    // Mejorar el comportamiento del zoom al hacer doble toque (para móviles)
    // Añadir este método a Controls.js
    onDoubleTap(x, y) {
        // Esta función se llama cuando se detecta un doble toque rápido

        // Si ya estamos en un nivel de zoom, volvemos a la posición normal
        if (this.cameraZoom < 0.9) { // Si estamos alejados
            this.zoomIn();
        } else if (this.cameraZoom > 1.1) { // Si estamos acercados
            this.resetCameraView();
        } else {
            // Si estamos en zoom normal, hacemos zoom en el punto tocado
            this.zoomToPoint(x, y);
        }
    }

    // Añadir este nuevo método para zoom en punto específico
    zoomToPoint(x, y) {
        if (!this.camera) return;
        
        // Hacemos zoom a un punto específico
        // En una implementación real, necesitaríamos técnicas más avanzadas de raycasting
        // Pero esto es una aproximación simplificada
        
        // Zoom in por defecto
        this.cameraZoom = Math.max(this.minDistance / this.defaultDistance, 
                            this.cameraZoom * 0.6); // Zoom más pronunciado (era 0.9)
        
        // Aplicar zoom
        this.applyTouchRotation();
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
     * Mejorar el método applyTouchRotation para una rotación más suave
     */
    applyTouchRotation() {
        if (!this.camera || !this.isDragging && !this.isZooming) return;
        
        // Si estamos haciendo zoom pero no arrastrando, no aplicar rotación
        if (this.isZooming && !this.isDragging) {
            // Calculate new camera position based on current rotation
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
            
            // Update camera with slower transition (para zoom más suave)
            if (this.camera.moveTo) {
                this.camera.moveTo(newPosition, this.initialLookAtPosition, 0.25); // Más lento (era 0.15)
            }
            return;
        }
        
        // Para movimiento de arrastre normal
        // Calculate rotation amount based on touch delta with reduced sensitivity
        const rotX = this.touchDelta.y * this.rotationSensitivity * 0.8; // Reducido un 20%
        const rotY = this.touchDelta.x * this.rotationSensitivity * 0.8; // Reducido un 20%
        
        // Update current rotation with smoother transitions
        this.cameraRotation.x = THREE.MathUtils.lerp(this.cameraRotation.x, this.cameraRotation.x + rotX, 0.3);
        this.cameraRotation.y = THREE.MathUtils.lerp(this.cameraRotation.y, this.cameraRotation.y + rotY, 0.3);
        
        // Limit vertical rotation more naturally (-45° to +45°) en lugar de 60°
        this.cameraRotation.x = Math.max(-Math.PI/4, Math.min(Math.PI/4, this.cameraRotation.x));
        
        // Calculate new camera position based on rotation
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
        
        // Update camera using its existing methods with slower response time
        if (this.camera.moveTo) {
            this.camera.moveTo(newPosition, this.initialLookAtPosition, 0.25); // Más lento (era 0.15)
        }
    }
    
    /**
     * Mejorar el método applyZoom para un zoom más suave
     */
    applyZoom() {
        if (!this.camera) return;
        
        // Reduce zoom sensitivity for smoother experience
        const zoomFactor = this.pinchDelta * (this.zoomSensitivity * 0.8);
        
        // Smoother zoom transition with easing
        this.targetZoom = Math.max(this.minDistance / this.defaultDistance, 
                            Math.min(this.maxDistance / this.defaultDistance, 
                                this.cameraZoom - zoomFactor));
                                
        // Ease toward target zoom
        this.cameraZoom = THREE.MathUtils.lerp(this.cameraZoom, this.targetZoom, 0.1);
        
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
    
    // Mejorar el método showGestureHint para que sea más visible:
    showGestureHint(text) {
        const gestureHint = document.getElementById('gesture-hint');
        if (!gestureHint) return;
        
        // Clear any previous timeout
        if (this.gestureHintTimeout) {
            clearTimeout(this.gestureHintTimeout);
        }
        
        // Update text if provided
        if (text) {
            gestureHint.textContent = text;
        }
        
        // Make hint more visible on mobile
        gestureHint.style.fontSize = this.sizes.isMobile ? '18px' : '16px';
        gestureHint.style.padding = this.sizes.isMobile ? '12px 20px' : '10px 16px';
        gestureHint.style.backgroundColor = 'rgba(0,0,0,0.7)';
        
        // Show hint
        gestureHint.classList.add('visible');
        
        // Hide after 2.5 seconds (longer on mobile)
        this.gestureHintTimeout = setTimeout(() => {
            gestureHint.classList.remove('visible');
        }, this.sizes.isMobile ? 2500 : 2000);
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