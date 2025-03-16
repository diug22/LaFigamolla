/**
 * Controls class
 * Handles user interactions (touch, mouse, gyroscope)
 * Optimized for mobile devices
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
        
        // Event callbacks
        this.callbacks = {};
        
        // Setup
        this.setupEventListeners();
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
    }
    
    /**
     * Handle touch start event
     */
    onTouchStart(event) {
        if (!this.isActive) return;
        
        event.preventDefault();
        
        // Single touch (drag)
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.touchStart.x = event.touches[0].clientX;
            this.touchStart.y = event.touches[0].clientY;
            this.touchCurrent.x = this.touchStart.x;
            this.touchCurrent.y = this.touchStart.y;
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
            this.touchCurrent.x = event.touches[0].clientX;
            this.touchCurrent.y = event.touches[0].clientY;
            
            // Calculate delta
            this.touchDelta.x = this.touchCurrent.x - this.touchStart.x;
            this.touchDelta.y = this.touchCurrent.y - this.touchStart.y;
            
            // Detect swipe direction
            if (Math.abs(this.touchDelta.x) > Math.abs(this.touchDelta.y)) {
                if (this.touchDelta.x > this.swipeThreshold) {
                    this.swipeDirection = 'right';
                } else if (this.touchDelta.x < -this.swipeThreshold) {
                    this.swipeDirection = 'left';
                }
            }
        }
        // Double touch (pinch)
        else if (this.isZooming && event.touches.length === 2) {
            // Calculate current pinch distance
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            this.pinchCurrent = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate delta
            this.pinchDelta = this.pinchCurrent - this.pinchStart;
        }
    }
    
    /**
     * Handle touch end event
     */
    onTouchEnd(event) {
        if (!this.isActive) return;
        
        // Handle swipe
        if (this.swipeDirection === 'left') {
            this.nextItem();
        } else if (this.swipeDirection === 'right') {
            this.previousItem();
        }
        
        // Reset states
        this.isDragging = false;
        this.isZooming = false;
        this.touchDelta.x = 0;
        this.touchDelta.y = 0;
        this.pinchDelta = 0;
        this.swipeDirection = null;
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
    }
    
    /**
     * Handle mouse move event
     */
    onMouseMove(event) {
        if (!this.isActive || !this.isDragging) return;
        
        this.touchCurrent.x = event.clientX;
        this.touchCurrent.y = event.clientY;
        
        // Calculate delta
        this.touchDelta.x = this.touchCurrent.x - this.touchStart.x;
        this.touchDelta.y = this.touchCurrent.y - this.touchStart.y;
        
        // Detect swipe direction
        if (Math.abs(this.touchDelta.x) > Math.abs(this.touchDelta.y)) {
            if (this.touchDelta.x > this.swipeThreshold) {
                this.swipeDirection = 'right';
            } else if (this.touchDelta.x < -this.swipeThreshold) {
                this.swipeDirection = 'left';
            }
        }
    }
    
    /**
     * Handle mouse up event
     */
    onMouseUp(event) {
        if (!this.isActive) return;
        
        // Handle swipe
        if (this.swipeDirection === 'left') {
            this.nextItem();
        } else if (this.swipeDirection === 'right') {
            this.previousItem();
        }
        
        // Reset states
        this.isDragging = false;
        this.touchDelta.x = 0;
        this.touchDelta.y = 0;
        this.swipeDirection = null;
    }
    
    /**
     * Handle mouse wheel event
     */
    onWheel(event) {
        if (!this.isActive) return;
        
        event.preventDefault();
        
        // Simulate pinch with wheel
        this.pinchDelta = event.deltaY * 0.05;
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
    }
    
    /**
     * Navigate to the next item
     */
    nextItem() {
        if (this.currentIndex < this.totalItems - 1) {
            this.currentIndex++;
            this.emit('itemChange', this.currentIndex);
            
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
            
            // Update UI
            this.updateNavDots();
            
            // Show gesture hint
            this.showGestureHint();
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
        this.updateNavDots();
    }
    
    /**
     * Update controls on each frame
     */
    update() {
        if (!this.isActive || !this.camera) return;
        
        // Apply gyroscope rotation if active
        if (this.isGyroActive) {
            // Convert gyro data to radians and apply to camera rotation
            const betaRad = THREE.MathUtils.degToRad(this.gyro.beta * 0.5);
            const gammaRad = THREE.MathUtils.degToRad(this.gyro.gamma * 0.5);
            
            // Apply to camera target rotation
            this.camera.targetRotation = {
                x: betaRad,
                y: gammaRad
            };
        }
        // Apply touch/mouse rotation
        else if (this.isDragging) {
            // Convert touch delta to rotation
            const rotX = this.touchDelta.y * 0.01;
            const rotY = this.touchDelta.x * 0.01;
            
            // Apply to camera target rotation
            this.camera.targetRotation = {
                x: rotX,
                y: rotY
            };
        }
        
        // Apply pinch zoom
        if (this.isZooming || this.pinchDelta !== 0) {
            // Convert pinch delta to zoom
            const zoom = this.pinchDelta * 0.01;
            
            // Apply to camera target zoom
            this.camera.targetZoom = Math.max(0.5, Math.min(2, this.camera.targetZoom - zoom));
            
            // Reset pinch delta
            this.pinchDelta = 0;
        }
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
