/**
 * Camera class
 * Handles camera setup and movement
 */

import * as THREE from 'three';

export class Camera {
    constructor(experience) {
        this.experience = experience;
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        
        console.log('Camera initializing with scene:', !!this.scene);
        
        // Camera settings
        this.fov = this.sizes.isMobile ? 65 : 60; // Reducido para una vista más natural (era 75/65)
        this.nearPlane = 0.1;
        this.farPlane = 100;
        
        // Camera state
        this.currentPosition = new THREE.Vector3(0, 0, 5);
        this.targetPosition = new THREE.Vector3(0, 0, 5);
        this.currentLookAt = new THREE.Vector3(0, 0, 0);
        this.targetLookAt = new THREE.Vector3(0, 0, 0);
        this.easing = 0.03; // Smoothing factor
        
        // Setup
        this.setInstance();
    }
    
    /**
     * Create the camera instance
     */
    setInstance() {
        // Create perspective camera
        this.instance = new THREE.PerspectiveCamera(
            this.fov,
            this.sizes.width / this.sizes.height,
            this.nearPlane,
            this.farPlane
        );
        
        // Set initial position
        this.instance.position.copy(this.currentPosition);
        this.instance.lookAt(this.currentLookAt);
        
        // Add to scene
        if (this.scene) {
            this.scene.add(this.instance);
            console.log('Camera added to scene');
        } else {
            console.error('Cannot add camera to scene: scene is missing');
        }
    }
    
    /**
     * Move camera to a new position with smooth transition
     * @param {THREE.Vector3} position - Target position
     * @param {THREE.Vector3} lookAt - Target lookAt point
     * @param {Number} duration - Transition duration in seconds
     */
    moveTo(position, lookAt, duration = 1.5) {
        this.targetPosition.copy(position);
        this.targetLookAt.copy(lookAt);
        
        // Ajustar easing para respuesta más rápida
        // Usar un factor de easing más grande para transiciones más rápidas
        this.easing = duration > 0 ? 1 / (duration * 60) : 1; // Reducido de 80 para transiciones más rápidas
        this.easing = Math.min(Math.max(this.easing, 0.01), 0.5); // Aumentado el valor mínimo para mayor velocidad
    }
    
    /**
     * Handle window resize
     */
    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
        
        // Adjust FOV for mobile
        if (this.sizes.isMobile) {
            this.instance.fov = 75;
        } else {
            this.instance.fov = 65;
        }
        this.instance.updateProjectionMatrix();
    }
    
    /**
     * Update camera on each frame
     */
    update() {
        // Smooth camera movement con factores más altos para respuesta más rápida
        const positionEasing = this.easing * 1.1; // Aumentado de 0.8
        const lookAtEasing = this.easing * 1.1; // Aumentado de 0.9
        
        // Apply easing with improved interpolation
        this.currentPosition.lerp(this.targetPosition, positionEasing);
        this.currentLookAt.lerp(this.targetLookAt, lookAtEasing);
        
        // Reducir el umbral para minimizar jitter pero permitir llegar a destino más rápido
        if (this.currentPosition.distanceTo(this.targetPosition) < 0.0005) {
            this.currentPosition.copy(this.targetPosition);
        }
        
        if (this.currentLookAt.distanceTo(this.targetLookAt) < 0.0005) {
            this.currentLookAt.copy(this.targetLookAt);
        }
        
        // Update camera position and lookAt
        this.instance.position.copy(this.currentPosition);
        this.instance.lookAt(this.currentLookAt);
    }
}
