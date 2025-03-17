/**
 * ArtworkItem class
 * Represents a single artwork item in the 3D world
 */

import * as THREE from 'three';

export class ArtworkItem {
    constructor(world, data) {
        this.world = world;
        this.scene = world.scene;
        this.data = data;
        
        // Properties
        this.name = data.name;
        this.title = data.title;
        this.description = data.description;
        this.position = data.position || new THREE.Vector3(0, 0, 0);
        this.rotation = data.rotation || new THREE.Euler(0, 0, 0);
        this.scale = data.scale || new THREE.Vector3(1, 1, 1);
        this.model = data.model; // GLB model reference
        this.particleColors = data.particleColors || [
            '#FFB178', // Default soft orange
            '#E78F8E', // Default soft red
            '#FEEAA7', // Default pale yellow
            '#D4A373', // Default soft brown
            '#A8DADC'  // Default pastel green
        ];
        
        // State
        this.isVisible = false;
        this.isAnimating = false;
        this.rotationSpeed = 0.005;
        
        // Setup
        this.container = new THREE.Group();
        this.container.name = this.name;
        this.container.position.copy(this.position);
        this.container.rotation.copy(this.rotation);
        this.container.scale.copy(this.scale);
        this.container.visible = false;
        
        this.scene.add(this.container);
        
        // Load model
        this.loadGLBModel();
        
        // Add effects
        this.addEffects();
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
        
        console.log(`GLB model loaded for ${this.name}`);
    }
    
    /**
     * Reset particles to original positions
     */
    resetParticles() {
        if (!this.particles) return;
        
        // Re-create particles
        this.container.remove(this.particles);
        this.addParticles();
    }
    
    /**
     * Add visual effects to the item
     */
    addEffects() {
        // Add particle effect
        this.addParticles();
    }
    
    /**
     * Add particle effect around the item
     */
    addParticles() {
        const particleCount = 20;
        const particles = new THREE.Group();
        
        // Use the custom particle colors defined for this artwork
        const colors = this.particleColors.map(colorHex => new THREE.Color(colorHex));
        
        // Create particle geometry
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        
        for (let i = 0; i < particleCount; i++) {
            // Random color from the artwork's color array
            const colorIndex = Math.floor(Math.random() * colors.length);
            const color = colors[colorIndex];
            
            // Create material
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.5
            });
            
            // Create mesh
            const mesh = new THREE.Mesh(geometry, material);
            
            // Random position in sphere around item
            const radius = 1.5 + Math.random() * 0.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
            mesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
            mesh.position.z = radius * Math.cos(phi);
            
            // Add animation properties
            mesh.userData.rotationSpeed = {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            };
            
            mesh.userData.movementSpeed = {
                theta: (Math.random() - 0.5) * 0.01,
                phi: (Math.random() - 0.5) * 0.01,
                radius: (Math.random() - 0.5) * 0.01
            };
            
            // Add to particles group
            particles.add(mesh);
        }
        
        // Add particles to container
        this.container.add(particles);
        this.particles = particles;
    }
    
    /**
     * Show the item with optional transition effect
     */
    show(direction = null) {
        this.container.visible = true;
        this.isVisible = true;
        
        // Reset position and rotation
        this.container.position.copy(this.position);
        this.container.rotation.copy(this.rotation);
        
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
        
        // Start animation
        this.isAnimating = true;
    }
    
    /**
     * Hide the item
     */
    hide() {
        this.container.visible = false;
        this.isVisible = false;
        this.isAnimating = false;
    }
    
    /**
     * Update item on each frame
     */
    update() {
        if (!this.isVisible) return;
        
        // Rotate item
        if (this.isAnimating) {
            this.container.rotation.y += this.rotationSpeed;
        }
        
        // Update particles
        if (this.particles) {
            for (const particle of this.particles.children) {
                // Get current spherical coordinates
                const radius = Math.sqrt(
                    particle.position.x * particle.position.x +
                    particle.position.y * particle.position.y +
                    particle.position.z * particle.position.z
                );
                
                let theta = Math.atan2(particle.position.y, particle.position.x);
                let phi = Math.acos(particle.position.z / radius);
                
                // Update spherical coordinates
                theta += particle.userData.movementSpeed.theta;
                phi += particle.userData.movementSpeed.phi;
                const newRadius = radius + particle.userData.movementSpeed.radius;
                
                // Convert back to Cartesian coordinates
                particle.position.x = newRadius * Math.sin(phi) * Math.cos(theta);
                particle.position.y = newRadius * Math.sin(phi) * Math.sin(theta);
                particle.position.z = newRadius * Math.cos(phi);
                
                // Keep particles within bounds
                const maxRadius = 2;
                const minRadius = 1;
                
                if (newRadius > maxRadius || newRadius < minRadius) {
                    particle.userData.movementSpeed.radius *= -1;
                }
            }
        }
    }
    
    /**
     * Handle manual rotation for the model
     * @param {Number} deltaX - Horizontal movement
     * @param {Number} deltaY - Vertical movement
     */
    handleManualRotation(deltaX, deltaY) {
        if (!this.isVisible) return;
        
        const rotYFactor = 0.01;
        const rotXFactor = 0.005;
        
        // Apply rotation directly to container
        this.container.rotation.y += deltaX * rotYFactor;
        
        // Limit vertical rotation range
        const newRotX = this.container.rotation.x + deltaY * rotXFactor;
        this.container.rotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, newRotX));
        
        // Disable automatic animation while user interacts
        this.isAnimating = false;
        
        // Restart animation after a pause in interaction
        clearTimeout(this.animationTimeout);
        this.animationTimeout = setTimeout(() => {
            this.isAnimating = true;
        }, 3000);
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
        
        // Dispose of particles
        if (this.particles) {
            for (const particle of this.particles.children) {
                if (particle.geometry) particle.geometry.dispose();
                if (particle.material) particle.material.dispose();
            }
        }
    }
}