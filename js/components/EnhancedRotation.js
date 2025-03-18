/**
 * Enhanced 3D Rotation Controls
 * 
 * This implementation provides smooth, intuitive rotation similar to <model-viewer> component.
 * Features:
 * - Auto-rotation with configurable speed
 * - Smooth trackball-style rotation
 * - Momentum with nice physics
 * - Double-click to reset view
 */

import * as THREE from 'three';

export class EnhancedRotation {
    constructor(experience, modelContainer) {
        // References
        this.experience = experience;
        this.modelContainer = modelContainer; // The 3D model container (THREE.Group)
        this.camera = experience.camera;
        this.sizes = experience.sizes;
        this.time = experience.time;
        
        // Configuration
        this.config = {
            autoRotate: true,
            autoRotateSpeed: 1.0, // Degrees per second
            damping: 0.98,        // Momentum reduction per frame (higher = more persistent rotation)
            sensitivity: 0.8,      // Rotation sensitivity multiplier
            enableReset: true,     // Enable double-click to reset
            resetTime: 1.0         // Time to reset rotation in seconds
        };
        
        // State
        this.state = {
            isDragging: false,
            previousPosition: new THREE.Vector2(),
            rotationVelocity: new THREE.Vector2(),
            currentRotation: new THREE.Quaternion(),
            targetRotation: new THREE.Quaternion(),
            initialRotation: new THREE.Quaternion(), // For reset functionality
            lastTapTime: 0 // Para detectar doble tap en móviles
        };
        
        // Save initial rotation
        if (this.modelContainer) {
            this.state.initialRotation.copy(this.modelContainer.quaternion);
        }
        
        // Event handler bindings para evitar problemas con removeEventListener
        this._boundMouseDown = this.onMouseDown.bind(this);
        this._boundMouseMove = this.onMouseMove.bind(this);
        this._boundMouseUp = this.onMouseUp.bind(this);
        this._boundTouchStart = this.onTouchStart.bind(this);
        this._boundTouchMove = this.onTouchMove.bind(this);
        this._boundTouchEnd = this.onTouchEnd.bind(this);
        this._boundDoubleClick = this.onDoubleClick.bind(this);
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize rotation controls
     */
    init() {
        // Set up event listeners if we have access to the canvas
        if (this.experience.canvas) {
            this.setupEventListeners();
        }
    }
    
    /**
     * Setup event listeners for interaction
     */
    setupEventListeners() {
        const canvas = this.experience.canvas;
        
        // Mouse events
        canvas.addEventListener('mousedown', this._boundMouseDown);
        window.addEventListener('mousemove', this._boundMouseMove);
        window.addEventListener('mouseup', this._boundMouseUp);
        
        // Touch events - usando los métodos vinculados
        canvas.addEventListener('touchstart', this._boundTouchStart, { passive: false });
        canvas.addEventListener('touchmove', this._boundTouchMove, { passive: false });
        canvas.addEventListener('touchend', this._boundTouchEnd, { passive: false });
        
        // Double-click/tap for reset
        if (this.config.enableReset) {
            canvas.addEventListener('dblclick', this._boundDoubleClick);
        }
    }
    
    /**
     * Project screen position onto a virtual trackball
     * @param {Number} x - Screen X coordinate
     * @param {Number} y - Screen Y coordinate
     * @returns {THREE.Vector3} - 3D point on the trackball sphere
     */
    projectOntoTrackball(x, y) {
        const width = this.sizes.width;
        const height = this.sizes.height;
        
        // Convert to normalized device coordinates (-1 to 1)
        const nx = (x / width) * 2 - 1;
        const ny = -((y / height) * 2 - 1);
        
        // Project onto sphere
        const radius = Math.min(width, height) * 0.5;
        const z = 0.5;  // Fixed z-coordinate for simplified trackball
        
        return new THREE.Vector3(nx, ny, z).normalize();
    }
    
    /**
     * Handle mouse down event
     */
    onMouseDown(event) {
        // No usar preventDefault aquí para permitir que el evento llegue a Controls.js
        
        // Start dragging
        this.state.isDragging = true;
        
        // Save initial position
        this.state.previousPosition.set(event.clientX, event.clientY);
        
        // Stop auto-rotation during manual control
        this.pauseAutoRotation();
    }
    
    /**
     * Handle mouse move event
     */
    onMouseMove(event) {
        if (!this.state.isDragging) return;
        
        const currentPosition = new THREE.Vector2(event.clientX, event.clientY);
        this.handleDrag(currentPosition);
    }
    
    /**
     * Handle mouse up event
     */
    onMouseUp(event) {
        this.state.isDragging = false;
        
        // Add a velocity boost for more dramatic rotation
        this.state.rotationVelocity.multiplyScalar(1.2);
    }
    
    /**
     * Handle touch start event
     */
    onTouchStart(event) {
        // Solo una prevención condicional para evitar conflictos
        if (event.touches.length === 1) {
            // Importante: no prevenir por defecto para permitir otros gestos
            // event.preventDefault();
            
            this.state.isDragging = true;
            this.state.previousPosition.set(
                event.touches[0].clientX,
                event.touches[0].clientY
            );
            
            // Detectar doble tap
            const now = Date.now();
            const tapLength = now - this.state.lastTapTime;
            if (tapLength < 300 && tapLength > 0) {
                this.resetRotation();
            }
            this.state.lastTapTime = now;
            
            // Stop auto-rotation during manual control
            this.pauseAutoRotation();
        }
    }
    
    /**
     * Handle touch move event
     */
    onTouchMove(event) {
        // Solo prevenir por defecto si estamos arrastrando
        if (!this.state.isDragging || event.touches.length !== 1) return;
        
        // Importante: permitir scrolling y otros gestos si no estamos rotando
        // event.preventDefault();
        
        const currentPosition = new THREE.Vector2(
            event.touches[0].clientX,
            event.touches[0].clientY
        );
        
        this.handleDrag(currentPosition);
    }
    
    /**
     * Handle touch end event
     */
    onTouchEnd(event) {
        this.state.isDragging = false;
        
        // Add a velocity boost for more dramatic rotation on touch devices
        this.state.rotationVelocity.multiplyScalar(2.0);
    }
    
    /**
     * Handle common drag logic for both mouse and touch
     */
    handleDrag(currentPosition) {
        // Calculate delta movement
        const delta = new THREE.Vector2()
            .subVectors(currentPosition, this.state.previousPosition)
            .multiplyScalar(0.01 * this.config.sensitivity);
        
        // Create rotation from the movement
        this.applyRotationFromDelta(delta.x, delta.y);
        
        // Save velocity for momentum
        this.state.rotationVelocity.copy(delta);
        
        // Update previous position
        this.state.previousPosition.copy(currentPosition);
    }
    
    /**
     * Apply rotation from delta movement
     */
    applyRotationFromDelta(deltaX, deltaY) {
        if (!this.modelContainer) return;
        
        // Create a quaternion for X rotation (around Y axis)
        const rotationY = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            -deltaX * Math.PI
        );
        
        // Create a quaternion for Y rotation (around X axis)
        const rotationX = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            -deltaY * Math.PI
        );
        
        // Combine rotations
        const rotation = new THREE.Quaternion()
            .multiplyQuaternions(rotationY, rotationX);
        
        // Apply rotation to model
        this.modelContainer.quaternion.multiplyQuaternions(
            rotation,
            this.modelContainer.quaternion
        );
    }
    
    /**
     * Handle double click to reset view
     */
    onDoubleClick(event) {
        this.resetRotation();
    }
    
    /**
     * Reset rotation to initial state with animation
     */
    resetRotation() {
        // Stop auto-rotation temporarily
        const wasAutoRotating = this.config.autoRotate;
        this.config.autoRotate = false;
        
        // Reset velocity
        this.state.rotationVelocity.set(0, 0);
        
        // Set target rotation to initial rotation
        this.state.targetRotation.copy(this.state.initialRotation);
        
        // Animate over time
        let progress = 0;
        const startRotation = this.modelContainer.quaternion.clone();
        const animate = () => {
            progress += this.time.delta / (this.config.resetTime * 1000);
            
            if (progress >= 1) {
                // Reset complete
                this.modelContainer.quaternion.copy(this.state.initialRotation);
                this.config.autoRotate = wasAutoRotating;
                return;
            }
            
            // Smooth interpolation
            const t = this.easeOutCubic(progress);
            this.modelContainer.quaternion.slerpQuaternions(
                startRotation,
                this.state.initialRotation,
                t
            );
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * Easing function for smooth animations
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    /**
     * Start auto-rotation
     */
    startAutoRotation() {
        this.config.autoRotate = true;
    }
    
    /**
     * Pause auto-rotation
     */
    pauseAutoRotation() {
        this.config.autoRotate = false;
    }
    
    /**
     * Update rotation on each frame
     */
    update() {
        if (!this.modelContainer) return;
        
        // Apply auto-rotation
        if (this.config.autoRotate && !this.state.isDragging) {
            // Convert degrees per second to radians per frame
            const speed = this.config.autoRotateSpeed * Math.PI / 1200;
            const rotation = new THREE.Quaternion().setFromAxisAngle(
                new THREE.Vector3(0, 1, 0), 
                speed * this.time.delta / 1000
            );
            
            this.modelContainer.quaternion.multiplyQuaternions(
                rotation,
                this.modelContainer.quaternion
            );
        }
        
        // Apply momentum if we have velocity
        if (!this.state.isDragging && 
            (Math.abs(this.state.rotationVelocity.x) > 0.0001 || 
             Math.abs(this.state.rotationVelocity.y) > 0.0001)) {
            
            // Apply rotation from velocity
            this.applyRotationFromDelta(
                this.state.rotationVelocity.x,
                this.state.rotationVelocity.y
            );
            
            // Reduce velocity (damping)
            this.state.rotationVelocity.multiplyScalar(this.config.damping);
            
            // Stop at very low speeds
            if (this.state.rotationVelocity.length() < 0.0001) {
                this.state.rotationVelocity.set(0, 0);
            }
        }
    }
    
    /**
     * Clean up and remove event listeners
     */
    destroy() {
        const canvas = this.experience.canvas;
        
        // Remove mouse events with bound handlers
        if (canvas) {
            canvas.removeEventListener('mousedown', this._boundMouseDown);
            canvas.removeEventListener('dblclick', this._boundDoubleClick);
            canvas.removeEventListener('touchstart', this._boundTouchStart);
            canvas.removeEventListener('touchmove', this._boundTouchMove);
            canvas.removeEventListener('touchend', this._boundTouchEnd);
        }
        
        window.removeEventListener('mousemove', this._boundMouseMove);
        window.removeEventListener('mouseup', this._boundMouseUp);
    }
}