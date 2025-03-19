/**
 * ArtworkItem class
 * Represents a single artwork item in the 3D world
 */

import * as THREE from 'three';
import { EnhancedRotation } from '../components/EnhancedRotation.js';
import { BubbleEffect } from '../components/BubbleEffect.js';

export class ArtworkItem {
    constructor(world, data) {
        this.world = world;
        this.scene = world.scene;
        this.data = data;
        
        // Properties
        this.name = data.name;
        this.title = data.title;
        this.description = data.description;
        this.dimensions = data.dimensions;
        this.material = data.material;
        this.year = data.year;
        this.position = data.position || new THREE.Vector3(0, 0, 0);
        this.rotation = data.rotation || new THREE.Euler(0, 0, 0);
        this.scale = data.scale || new THREE.Vector3(1, 1, 1);
        this.model = data.model; // GLB model reference
        this.particleColors = data.particleColors || [
            '#c1c4b1', // Laqueno light
            '#a6a995', // Laqueno medium
            '#e4e3d3', // Laqueno cream
            '#FFB178', // Default soft orange
            '#E78F8E', // Default soft red
            '#FEEAA7', // Default pale yellow
            '#D4A373'  // Default soft brown
        ];
        
        // State
        this.isVisible = false;
        
        // Effects
        this.bubbleEffect = null;
        
        // Container setup
        this.container = new THREE.Group();
        this.container.name = this.name;
        this.container.position.copy(this.position);
        this.container.rotation.copy(this.rotation);
        this.container.scale.copy(this.scale);
        this.container.visible = false;
        
        this.scene.add(this.container);
        
        // Load model
        this.loadGLBModel();
    }
    
    /**
     * Load GLB model
     */
    loadGLBModel() {
        if (!this.model) {
            console.error(`No GLB model provided for ${this.name}`);
            return;
        }
        
        // Clone the model to avoid modifying the original
        this.modelScene = this.model.scene.clone();
        
        // Enable shadows for all meshes
        this.modelScene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Improve material quality
                if (child.material) {
                    child.material.roughness = 0.7;
                    child.material.metalness = 0.1;
                }
            }
        });
        
        // Add model to container
        this.container.add(this.modelScene);
        this.mesh = this.modelScene; // For consistency with effects methods

        // Initialize bubble effect after model is loaded
        this.createBubbleEffect();

        // Initialize the rotation controller with specific configuration
        this.rotationController = new EnhancedRotation(this.world.experience, this.modelScene);
        // Specific adjustments for mobile experience
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            // On mobile, make rotation smoother
            this.rotationController.config.sensitivity = 1.2; // Higher sensitivity for touch screens
            this.rotationController.config.damping = 0.99; // More inertia
            this.rotationController.config.autoRotateSpeed = 0.7; // Slower auto rotation
        }
        
        console.log(`GLB model loaded for ${this.name}`);
    }

    /**
     * Create bubble effect for this artwork
     */
    createBubbleEffect() {
        // Configure bubble effect with the artwork's colors and specific settings
        const isMobile = this.world.experience && this.world.experience.sizes && 
                       this.world.experience.sizes.isMobile;
        
        const bubbleOptions = {
            // Color scheme from artwork data
            colors: this.particleColors,
            
            // Bubble count - fewer on mobile
            bubbleCount: {
                min: isMobile ? 1 : 1,
                max: isMobile ? 1 : 3,
                initial: isMobile ? 1 : 1
            },
            
            // Bubble size
            bubbleSize: { 
                min: 0.0015, 
                max: 0.006
            },
            
            // Bubble speed
            bubbleSpeed: { 
                min: 0.005, 
                max: 0.02 
            },
            
        };
        
        // Create bubble effect attached to artwork container
        this.bubbleEffect = new BubbleEffect(this.container, bubbleOptions);
    }
    
    /**
     * Apply trackball rotation to the item using EnhancedRotation
     * @param {THREE.Quaternion} rotationDelta - Rotation to apply
     * @param {THREE.Vector2} velocity - Velocity for momentum
     */
    applyTrackballRotation(rotationDelta, velocity) {
        if (!this.isVisible || !this.modelScene) return;
        
        // If we have a rotation controller, delegate to it
        if (this.rotationController) {
            // No need to do anything here, EnhancedRotation handles everything
            return;
        }
    }
    
    /**
     * Show the item with optional transition effect
     */
    show(direction = null) {
        this.container.visible = true;
        this.isVisible = true;
        
        // Reset position and rotation
        this.container.position.copy(this.position);
        
        // Reset trackball rotation and restart auto-rotation
        if (this.rotationController) {
            this.rotationController.resetRotation(true); // Add parameter to force immediate reset
        
            // Reset rotation velocity
            if (this.rotationController.state && this.rotationController.state.rotationVelocity) {
                this.rotationController.state.rotationVelocity.set(0, 0);
            }
            
            // Start auto-rotation after a brief delay
            setTimeout(() => {
                this.rotationController.startAutoRotation();
            }, 100);
        }
        
        // Apply special entrance effect for horizontal transitions
        if (direction) {
            // Apply entrance effect based on direction
            const offset = direction === 'left' ? 5 : -5;
            
            // Animate entrance from left or right
            this.container.position.x += offset;
            
            // Animate to final position
            const targetX = this.position.x;
            const animate = () => {
                const diff = targetX - this.container.position.x;
                if (Math.abs(diff) < 0.05) {
                    this.container.position.x = targetX;
                } else {
                    this.container.position.x += diff * 0.1;
                    requestAnimationFrame(animate);
                }
            };
            
            animate();
        }
    }
    
    /**
     * Hide the item
     */
    hide() {
        this.container.visible = false;
        this.isVisible = false;
        
        // Pause auto-rotation when hidden
        if (this.rotationController) {
            this.rotationController.pauseAutoRotation();
        }
    }
    
    /**
     * Update item on each frame
     */
    update() {
        if (!this.isVisible || !this.modelScene) return;

        // Update the enhanced rotation controller
        if (this.rotationController) {
            this.rotationController.update();
        }
        
        // Update bubble effect
        if (this.bubbleEffect) {
            this.bubbleEffect.update();
        }
    }
    
    /**
     * Clean up and destroy resources
     */
    destroy() {
        // Remove from scene
        if (this.container.parent) {
            this.container.parent.remove(this.container);
        }
        
        // Dispose of GLB model
        if (this.modelScene) {
            this.modelScene.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => material.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
        }

        // Clean up the rotation controller
        if (this.rotationController) {
            this.rotationController.destroy();
            this.rotationController = null;
        }
        
        // Clean up bubble effect
        if (this.bubbleEffect) {
            this.bubbleEffect.destroy();
            this.bubbleEffect = null;
        }
    }
}