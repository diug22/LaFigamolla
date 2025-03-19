/**
 * BubbleEffect class
 * Creates sea-like bubbles that rise and form foam at the top
 * Designed for Laqueno with autumn palette colors
 * For use with ArtworkItem objects
 */

import * as THREE from 'three';

export class BubbleEffect {
    constructor(parent, options = {}) {
        // Parent object to attach to
        this.parent = parent;
        
        // Default configuration
        this.config = {
            // Bubble count control
            bubbleCount: { min: 15, max: 35, initial: 20 },
            // Bubble appearance
            bubbleSize: { min: 0.02, max: 0.08 },
            bubbleSpeed: { min: 0.01, max: 0.03 },
            // Foam controls
            resetInterval: 15000, // 15 seconds
            foamHeight: 0.8, // Height where foam starts to form (relative to model)
            foamWidth: 1.5, // Width of the foam area
            foamResetThreshold: 0.7, // Foam intensity threshold to trigger reset (0-1)
            // Position control for emission
            emissionArea: {
                width: 0.8, // Width of emission area at bottom
                height: 0.1, // Height of emission area
                yOffset: -0.2 // Y offset from model center
            },
            // Colors
            colors: [
                '#c1c4b1', // Laqueno light
                '#a6a995', // Laqueno medium
                '#e4e3d3', // Laqueno cream
                '#FFB178', // Soft orange
                '#E78F8E', // Soft red
                '#FEEAA7', // Pale yellow
                '#D4A373'  // Soft brown
            ]
        };
        
        // Override defaults with provided options
        if (options) {
            this.config = {...this.config, ...options};
        }
        
        // Initialize systems
        this.bubbleSystem = null;
        this.foamSystem = null;
        this.foamParticles = [];
        this.bubbles = [];
        this.foamIntensity = 0;
        this.lastFoamReset = Date.now();
        
        // Setup
        this.init();
    }
    
    /**
     * Initialize the bubble effect
     */
    init() {
        // Create container groups
        this.bubbleSystem = new THREE.Group();
        this.foamSystem = new THREE.Group();
        
        // Add to parent
        this.parent.add(this.bubbleSystem);
        this.parent.add(this.foamSystem);
        
        // Create bubbles
        this.createBubbles();
        
        // Create foam system
        this.createFoam();
    }
    
    /**
     * Create bubble particles
     */
    createBubbles() {
        const colors = this.config.colors;
        
        // Create initial set of bubbles
        for (let i = 0; i < this.config.bubbleCount; i++) {
            this.addBubble();
        }
    }
    
    /**
     * Add a new bubble that emerges from the artwork
     */
    addBubble() {
        // Random size within range
        const size = this.getRandomInRange(
            this.config.bubbleSize.min,
            this.config.bubbleSize.max
        );
        
        // Create bubble geometry (small sphere)
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        
        // Random color from palette
        const colorIndex = Math.floor(Math.random() * this.config.colors.length);
        const color = new THREE.Color(this.config.colors[colorIndex]);
        
        // Create material with transparency for bubble effect
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6 + Math.random() * 0.3,
            side: THREE.DoubleSide
        });
        
        // Create mesh
        const bubble = new THREE.Mesh(geometry, material);
        
        // Position bubble to emerge from underneath the artwork
        const emissionArea = this.config.emissionArea;
        bubble.position.x = (Math.random() - 0.5) * emissionArea.width;
        bubble.position.y = emissionArea.yOffset - Math.random() * emissionArea.height;
        bubble.position.z = (Math.random() - 0.5) * emissionArea.width;
        
        // Add bubble properties for animation
        bubble.userData = {
            speed: this.getRandomInRange(
                this.config.bubbleSpeed.min,
                this.config.bubbleSpeed.max
            ),
            originalSize: size,
            wobbleOffset: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.5 + Math.random() * 0.5,
            reachedTop: false,
            active: true
        };
        
        // Add to system
        this.bubbleSystem.add(bubble);
        this.bubbles.push(bubble);
    }
    
    /**
     * Create foam system that appears above the artwork
     */
    createFoam() {
        // Create a group for foam
        this.foamGroup = new THREE.Group();
        this.foamSystem.add(this.foamGroup);
        
        // Create foam particles using several smaller particle systems
        // This gives a more layered, realistic foam appearance
        for (let layer = 0; layer < 3; layer++) {
            const particleCount = 20 + layer * 15; // More particles in outer layers, but fewer total
            const foamGeometry = new THREE.BufferGeometry();
            const foamPositions = new Float32Array(particleCount * 3);
            const foamSizes = new Float32Array(particleCount);
            const foamColors = new Float32Array(particleCount * 3);
            
            // Slightly different color for each layer for depth
            const baseColor = new THREE.Color('#e4e3d3');
            const layerColor = new THREE.Color();
            layerColor.copy(baseColor);
            
            // Outer layers slightly more transparent and varied
            const layerOpacity = 1.0 - layer * 0.2;
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                
                // Distribute foam in an oval/circular shape at the top of the model
                const angle = Math.random() * Math.PI * 2;
                const radius = (0.4 + Math.random() * 0.4) * (layer + 1) * 0.4 * this.config.foamWidth;
                
                foamPositions[i3] = Math.cos(angle) * radius; 
                foamPositions[i3 + 1] = this.config.foamHeight + layer * 0.1 + Math.random() * 0.1;
                foamPositions[i3 + 2] = Math.sin(angle) * radius * 0.5; // Flatten in z for more 2D foam
                
                // Varied sizes
                foamSizes[i] = 0.05 + Math.random() * 0.1;
                
                // Slight color variation
                const colorVariation = 0.05 * Math.random();
                const particleColor = new THREE.Color().copy(layerColor);
                particleColor.r += colorVariation;
                particleColor.g += colorVariation;
                particleColor.b += colorVariation;
                
                foamColors[i3] = particleColor.r;
                foamColors[i3 + 1] = particleColor.g;
                foamColors[i3 + 2] = particleColor.b;
            }
            
            // Set buffer attributes
            foamGeometry.setAttribute('position', new THREE.BufferAttribute(foamPositions, 3));
            foamGeometry.setAttribute('size', new THREE.BufferAttribute(foamSizes, 1));
            foamGeometry.setAttribute('color', new THREE.BufferAttribute(foamColors, 3));
            
            // Create foam material
            const foamMaterial = new THREE.PointsMaterial({
                size: 0.1,
                map: this.createFoamTexture(),
                vertexColors: true,
                transparent: true,
                opacity: layerOpacity * 0.2, // Start nearly invisible
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
            
            // Create points system
            const foamParticles = new THREE.Points(foamGeometry, foamMaterial);
            this.foamGroup.add(foamParticles);
            
            // Store reference
            this.foamParticles.push({
                system: foamParticles,
                layer: layer,
                baseOpacity: layerOpacity * 0.7
            });
        }
        
        // Hide foam initially
        this.foamGroup.visible = false;
    }
    
    /**
     * Create a texture for foam particles
     */
    createFoamTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        
        const context = canvas.getContext('2d');
        
        // Create gradient for soft particles
        const gradient = context.createRadialGradient(
            32, 32, 0,
            32, 32, 32
        );
        
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(0.7, 'rgba(255,255,255,0.3)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        // Draw circle
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(32, 32, 32, 0, Math.PI * 2);
        context.fill();
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        return texture;
    }
    
    /**
     * Make a bubble "pop" at the surface
     */
    popBubble(bubble) {
        // Make bubble appear to "pop" with a small scale animation
        const startTime = Date.now();
        const popDuration = 300; // 300ms
        const startScale = bubble.scale.x;
        
        const popAnimation = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / popDuration, 1.0);
            
            if (progress < 0.5) {
                // First half: bubble grows slightly
                const growFactor = 1 + progress * 0.5;
                bubble.scale.set(startScale * growFactor, startScale * growFactor, startScale * growFactor);
                bubble.material.opacity *= (1 - progress * 0.5);
            } else {
                // Second half: bubble shrinks and fades
                const shrinkFactor = 1 - (progress - 0.5) * 2;
                bubble.scale.set(startScale * shrinkFactor, startScale * shrinkFactor, startScale * shrinkFactor);
                bubble.material.opacity *= shrinkFactor;
            }
            
            if (progress < 1.0) {
                requestAnimationFrame(popAnimation);
            } else {
                // Reset bubble after pop
                this.resetBubble(bubble);
            }
        };
        
        popAnimation();
    }
    
    /**
     * Reset a bubble to emerge from beneath the artwork again
     */
    resetBubble(bubble) {
        // Position bubble to emerge from underneath the artwork again
        const emissionArea = this.config.emissionArea;
        bubble.position.x = (Math.random() - 0.5) * emissionArea.width;
        bubble.position.y = emissionArea.yOffset - Math.random() * emissionArea.height;
        bubble.position.z = (Math.random() - 0.5) * emissionArea.width;
        
        // Reset properties
        bubble.material.opacity = 0.6 + Math.random() * 0.3;
        bubble.userData.reachedTop = false;
        bubble.userData.wobbleOffset = Math.random() * Math.PI * 2;
        bubble.scale.set(1, 1, 1);
    }
    
    /**
     * Add a burst of foam particles for added realism
     */
    addFoamBurst() {
        // Choose random position near the foam
        const burstX = (Math.random() - 0.5) * 2;
        const burstY = this.config.foamHeight + Math.random() * 0.2;
        const burstZ = (Math.random() - 0.5);
        
        // Create a small particle system for the burst
        const particleCount = 5 + Math.floor(Math.random() * 5);
        const burstGeometry = new THREE.BufferGeometry();
        const burstPositions = new Float32Array(particleCount * 3);
        const burstSizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position particles in a small cluster
            burstPositions[i3] = burstX + (Math.random() - 0.5) * 0.3;
            burstPositions[i3 + 1] = burstY + (Math.random() - 0.5) * 0.1;
            burstPositions[i3 + 2] = burstZ + (Math.random() - 0.5) * 0.3;
            
            // Random sizes
            burstSizes[i] = 0.05 + Math.random() * 0.1;
        }
        
        // Set buffer attributes
        burstGeometry.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
        burstGeometry.setAttribute('size', new THREE.BufferAttribute(burstSizes, 1));
        
        // Create material
        const burstMaterial = new THREE.PointsMaterial({
            size: 0.15,
            map: this.createFoamTexture(),
            color: 0xe4e3d3,
            transparent: true,
            opacity: 0.7,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        // Create points system
        const burstParticles = new THREE.Points(burstGeometry, burstMaterial);
        this.foamGroup.add(burstParticles);
        
        // Animate and remove after short duration
        const startTime = Date.now();
        const duration = 1000 + Math.random() * 1000; // 1-2 seconds
        
        const animateBurst = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1.0);
            
            // Rise and fade out
            const positions = burstGeometry.attributes.position.array;
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3 + 1] += 0.002; // Rise
            }
            
            burstGeometry.attributes.position.needsUpdate = true;
            
            // Fade out as it rises
            burstMaterial.opacity = 0.7 * (1 - progress);
            
            if (progress < 1.0) {
                requestAnimationFrame(animateBurst);
            } else {
                // Remove after animation completes
                this.foamGroup.remove(burstParticles);
                burstGeometry.dispose();
                burstMaterial.dispose();
            }
        };
        
        animateBurst();
    }
    
    /**
     * Update bubbles movement
     */
    updateBubbles() {
        const time = Date.now() / 1000; // Current time in seconds
        
        // Add more bubbles occasionally, respecting min/max limits
        if (this.bubbles.length < this.config.bubbleCount.max && Math.random() < 0.02) {
            this.addBubble();
        }
        
        for (let i = 0; i < this.bubbles.length; i++) {
            const bubble = this.bubbles[i];
            const data = bubble.userData;
            
            if (!data.active) continue;
            
            // Vary speed slightly for natural movement
            const speed = data.speed * (0.8 + 0.4 * Math.sin(time * 0.5 + data.wobbleOffset));
            
            // Make bubble rise with slight acceleration
            bubble.position.y += speed;
            
            // Add horizontal wobble for realism - subtle for more natural flow
            const wobbleX = Math.sin(time * data.wobbleSpeed + data.wobbleOffset) * 0.008;
            const wobbleZ = Math.cos(time * data.wobbleSpeed * 0.7 + data.wobbleOffset) * 0.008;
            
            bubble.position.x += wobbleX;
            bubble.position.z += wobbleZ;
            
            // Slightly vary size for pulsing effect
            const scaleFactor = 0.9 + 0.2 * Math.sin(time * 0.5 + data.wobbleOffset);
            bubble.scale.set(scaleFactor, scaleFactor, scaleFactor);
            
            // Apply slight rotation for more natural movement
            bubble.rotation.x += 0.01 * Math.sin(time * 0.3 + data.wobbleOffset);
            bubble.rotation.z += 0.01 * Math.cos(time * 0.4 + data.wobbleOffset);
            
            // Check if bubble reached the foam area
            if (bubble.position.y >= this.config.foamHeight && !data.reachedTop) {
                data.reachedTop = true;
                
                // Increase foam intensity
                this.foamIntensity += 0.05; // Slightly increased effect per bubble
                this.foamIntensity = Math.min(this.foamIntensity, 1.0);
                
                // Make bubble appear to "pop" at the surface
                this.popBubble(bubble);
            }
            
            // Reset bubbles that go too high
            if (bubble.position.y > this.config.foamHeight + 1.5) {
                this.resetBubble(bubble);
            }
        }
    }
    
    /**
     * Update foam appearance
     */
    updateFoam() {
        // Show foam when intensity increases
        if (this.foamIntensity > 0.01 && !this.foamGroup.visible) {
            this.foamGroup.visible = true;
        } else if (this.foamIntensity <= 0.01 && this.foamGroup.visible) {
            this.foamGroup.visible = false;
        }
        
        // Skip update if foam is invisible
        if (!this.foamGroup.visible) return;
        
        const time = Date.now() / 1000;
        
        // Update each foam layer
        for (let i = 0; i < this.foamParticles.length; i++) {
            const foam = this.foamParticles[i];
            const system = foam.system;
            const layer = foam.layer;
            
            // Get attributes
            const positions = system.geometry.attributes.position.array;
            const sizes = system.geometry.attributes.size.array;
            const particleCount = sizes.length;
            
            // Update material opacity based on foam intensity
            system.material.opacity = foam.baseOpacity * this.foamIntensity;
            
            // Animate foam bubbles
            for (let j = 0; j < particleCount; j++) {
                const j3 = j * 3;
                
                // More movement in outer layers
                const movementScale = 0.003 * (layer + 1);
                
                // Circular motion plus slight rise
                positions[j3] += Math.sin(time * 0.5 + j * 0.1) * movementScale;
                positions[j3 + 1] += Math.sin(time * 0.3 + j * 0.05) * movementScale * 0.5 + 0.001; // Slight rise
                positions[j3 + 2] += Math.cos(time * 0.5 + j * 0.1) * movementScale;
                
                // Vary size slightly for bubbling effect
                const sizePulse = 0.8 + 0.4 * Math.sin(time * 0.8 + j * 0.2);
                sizes[j] = (0.05 + Math.random() * 0.1) * sizePulse * (1 + this.foamIntensity);
            }
            
            // Mark attributes for update
            system.geometry.attributes.position.needsUpdate = true;
            system.geometry.attributes.size.needsUpdate = true;
        }
        
        // Add new foam particles occasionally as intensity increases
        if (this.foamIntensity > 0.3 && Math.random() < 0.05 * this.foamIntensity) {
            this.addFoamBurst();
        }
    }
    
    /**
     * Reset foam effect
     */
    resetFoam() {
        // Gradually reduce foam intensity
        const startIntensity = this.foamIntensity;
        const fadeDuration = 3000; // 3 seconds
        const startTime = Date.now();
        
        const fadeOut = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / fadeDuration, 1.0);
            
            // Reduce foam intensity
            this.foamIntensity = startIntensity * (1 - progress);
            
            if (progress < 1.0 && this.foamIntensity > 0.01) {
                requestAnimationFrame(fadeOut);
            } else {
                // Reset completely
                this.foamIntensity = 0;
                this.lastFoamReset = Date.now();
            }
        };
        
        fadeOut();
    }
    
    /**
     * Update method to be called on each frame
     */
    update() {
        // Update bubbles
        this.updateBubbles();
        
        // Update foam
        this.updateFoam();
        
        // Check if foam needs to be reset based on configurable threshold
        if (Date.now() - this.lastFoamReset > this.config.resetInterval && 
            this.foamIntensity > this.config.foamResetThreshold) {
            this.resetFoam();
        }
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        // Remove from parent
        if (this.bubbleSystem && this.bubbleSystem.parent) {
            this.bubbleSystem.parent.remove(this.bubbleSystem);
        }
        
        if (this.foamSystem && this.foamSystem.parent) {
            this.foamSystem.parent.remove(this.foamSystem);
        }
        
        // Dispose of geometries and materials
        for (const bubble of this.bubbles) {
            if (bubble.geometry) bubble.geometry.dispose();
            if (bubble.material) bubble.material.dispose();
        }
        
        for (const foam of this.foamParticles) {
            if (foam.system.geometry) foam.system.geometry.dispose();
            if (foam.system.material) {
                if (foam.system.material.map) foam.system.material.map.dispose();
                foam.system.material.dispose();
            }
        }
        
        // Clear arrays
        this.bubbles = [];
        this.foamParticles = [];
    }
    
    /**
     * Get random value in range
     */
    getRandomInRange(min, max) {
        return min + Math.random() * (max - min);
    }
}