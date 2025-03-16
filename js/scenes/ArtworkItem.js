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
            this.texture = data.texture;
            this.position = data.position || new THREE.Vector3(0, 0, 0);
            this.rotation = data.rotation || new THREE.Euler(0, 0, 0);
            this.scale = data.scale || new THREE.Vector3(1, 1, 1);
            this.geometryType = data.geometry || 'box';
            this.model = data.model; // Add GLB model reference
            
            // State
            this.isVisible = false;
            this.isAnimating = false;
            this.rotationSpeed = 0.005;
            this.hoverEffect = 0;
            
            // Setup
            this.container = new THREE.Group();
            this.container.name = this.name;
            this.container.position.copy(this.position);
            this.container.rotation.copy(this.rotation);
            this.container.scale.copy(this.scale);
            this.container.visible = false;
            
            this.scene.add(this.container);
            
            // Create mesh or load model
            if (this.geometryType === 'glb' && this.model) {
                this.loadGLBModel();
            } else {
                this.createMesh();
            }
            
            // Add effects
            this.addEffects();
        }
        
        /**
         * Load GLB model
         */
        loadGLBModel() {
            if (!this.model) {
                console.error(`No GLB model provided for ${this.name}`);
                // Fallback to a basic shape
                this.geometryType = 'box';
                this.createMesh();
                return;
            }
            
            // The model should already be loaded by the Resource manager
            // and passed in the data object
            
            // Clone the model to avoid modifying the original
            this.modelScene = this.model.scene.clone();
            
            // Apply custom materials if texture is provided
            if (this.texture) {
                this.modelScene.traverse((child) => {
                    if (child.isMesh) {
                        child.material = new THREE.MeshStandardMaterial({
                            map: this.texture,
                            roughness: 0.7,
                            metalness: 0.1
                        });
                        
                        // Enable shadows
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
            } else {
                // Just enable shadows for all meshes
                this.modelScene.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
            }
            
            // Add model to container
            this.container.add(this.modelScene);
            this.mesh = this.modelScene; // For consistency with other methods
            
            console.log(`GLB model loaded for ${this.name}`);
        }
    
    
    /**
     * Create the mesh based on geometry type
     */
    createMesh() {
        // Create geometry based on type
        let geometry;
        
        switch (this.geometryType) {
            case 'vase':
                // Create vase-like geometry
                geometry = this.createVaseGeometry();
                break;
                
            case 'bowl':
                // Create bowl-like geometry
                geometry = this.createBowlGeometry();
                break;
                
            case 'sculpture':
                // Create abstract sculpture geometry
                geometry = this.createSculptureGeometry();
                break;
                
            case 'plane':
                // Create plane for prints/paintings
                geometry = new THREE.PlaneGeometry(3, 4, 1, 1);
                break;
                
            case 'teaSet':
                // Create tea set (group of objects)
                this.createTeaSet();
                return; // Early return as we create the meshes directly
                
            default:
                // Default to box
                geometry = new THREE.BoxGeometry(1, 1, 1);
                break;
        }
        
        // Create material
        let material;
        
        if (this.texture) {
            // Use texture if available
            material = new THREE.MeshStandardMaterial({
                map: this.texture,
                roughness: 0.7,
                metalness: 0.1
            });
        } else {
            // Use color material with random autumn color
            const autumnColors = [
                0xFFB178, // Soft orange
                0xE78F8E, // Soft red
                0xFEEAA7, // Pale yellow
                0xD4A373, // Soft brown
                0xA8DADC  // Pastel green
            ];
            
            const colorIndex = Math.floor(Math.random() * autumnColors.length);
            const color = autumnColors[colorIndex];
            
            material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.7,
                metalness: 0.1
            });
        }
        
        // Create mesh
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Add to container
        this.container.add(this.mesh);
    }
    
    /**
     * Create vase geometry
     */
    createVaseGeometry() {
        // Create vase shape
        const points = [];
        
        // Base
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(0.5, 0));
        points.push(new THREE.Vector2(0.5, 0.1));
        
        // Body
        points.push(new THREE.Vector2(0.8, 0.5));
        points.push(new THREE.Vector2(0.7, 1.0));
        points.push(new THREE.Vector2(0.9, 1.5));
        
        // Neck
        points.push(new THREE.Vector2(0.8, 1.8));
        points.push(new THREE.Vector2(0.6, 2.0));
        
        // Lip
        points.push(new THREE.Vector2(0.7, 2.1));
        points.push(new THREE.Vector2(0.6, 2.2));
        points.push(new THREE.Vector2(0, 2.2));
        
        // Create lathe geometry
        return new THREE.LatheGeometry(points, 32);
    }
    
    /**
     * Create bowl geometry
     */
    createBowlGeometry() {
        // Create bowl shape
        const points = [];
        
        // Base
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(0.8, 0));
        points.push(new THREE.Vector2(0.8, 0.1));
        
        // Body
        points.push(new THREE.Vector2(1.0, 0.2));
        points.push(new THREE.Vector2(1.2, 0.4));
        points.push(new THREE.Vector2(1.3, 0.6));
        points.push(new THREE.Vector2(1.2, 0.8));
        points.push(new THREE.Vector2(0, 0.8));
        
        // Create lathe geometry
        return new THREE.LatheGeometry(points, 32);
    }
    
    /**
     * Create abstract sculpture geometry
     */
    createSculptureGeometry() {
        // Use a more complex geometry for sculpture
        return new THREE.TorusKnotGeometry(1, 0.3, 128, 32, 2, 3);
    }
    
    /**
     * Create tea set (multiple objects)
     */
    createTeaSet() {
        // Create group for tea set
        this.teaSet = new THREE.Group();
        
        // Create teapot
        const teapotBody = this.createTeapotGeometry();
        const teapotMaterial = new THREE.MeshStandardMaterial({
            color: 0xD4A373,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const teapot = new THREE.Mesh(teapotBody, teapotMaterial);
        teapot.position.set(0, 0, 0);
        teapot.scale.set(0.7, 0.7, 0.7);
        teapot.castShadow = true;
        teapot.receiveShadow = true;
        
        this.teaSet.add(teapot);
        
        // Create cups (3 cups in a semicircle)
        const cupGeometry = this.createCupGeometry();
        const cupMaterial = new THREE.MeshStandardMaterial({
            color: 0xE78F8E,
            roughness: 0.7,
            metalness: 0.1
        });
        
        for (let i = 0; i < 3; i++) {
            const cup = new THREE.Mesh(cupGeometry, cupMaterial);
            
            // Position in semicircle
            const angle = (Math.PI / 4) * (i - 1);
            const radius = 1.5;
            
            cup.position.set(
                Math.sin(angle) * radius,
                -0.3,
                Math.cos(angle) * radius
            );
            
            cup.scale.set(0.3, 0.3, 0.3);
            cup.castShadow = true;
            cup.receiveShadow = true;
            
            this.teaSet.add(cup);
        }
        
        // Add to container
        this.container.add(this.teaSet);
    }
    
    /**
     * Create teapot geometry
     */
    createTeapotGeometry() {
        // Create teapot body
        const points = [];
        
        // Base
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(0.8, 0));
        points.push(new THREE.Vector2(0.8, 0.1));
        
        // Body
        points.push(new THREE.Vector2(1.0, 0.2));
        points.push(new THREE.Vector2(1.2, 0.6));
        points.push(new THREE.Vector2(1.0, 1.0));
        points.push(new THREE.Vector2(0.8, 1.2));
        
        // Neck
        points.push(new THREE.Vector2(0.6, 1.3));
        points.push(new THREE.Vector2(0.4, 1.4));
        
        // Lid
        points.push(new THREE.Vector2(0.4, 1.5));
        points.push(new THREE.Vector2(0.6, 1.5));
        points.push(new THREE.Vector2(0.6, 1.6));
        points.push(new THREE.Vector2(0.4, 1.6));
        points.push(new THREE.Vector2(0.2, 1.7));
        points.push(new THREE.Vector2(0, 1.7));
        
        // Create lathe geometry for body
        const bodyGeometry = new THREE.LatheGeometry(points, 32);
        
        // Create spout
        const spoutGeometry = new THREE.CylinderGeometry(0.1, 0.2, 1, 16);
        const spoutMesh = new THREE.Mesh(spoutGeometry);
        spoutMesh.position.set(0.8, 0.8, 0);
        spoutMesh.rotation.set(0, 0, Math.PI / 3);
        
        // Create handle
        const handleShape = new THREE.Shape();
        handleShape.absarc(0, 0, 0.4, 0, Math.PI, false);
        handleShape.absarc(0, 0, 0.3, Math.PI, 0, true);
        
        const handleGeometry = new THREE.ExtrudeGeometry(handleShape, {
            steps: 1,
            depth: 0.1,
            bevelEnabled: false
        });
        console.log('NETRY')

        const handleMesh = new THREE.Mesh(handleGeometry);
        handleMesh.position.set(-0.8, 0.8, 0);
        handleMesh.rotation.set(Math.PI / 2, 0, 0);
        
        // Combine geometries
        const teapotGeometry = new THREE.BufferGeometry();
        
        // Return body geometry for now (combining geometries is more complex)
        return bodyGeometry;
    }
    
    /**
     * Create cup geometry
     */
    createCupGeometry() {
        // Create cup shape
        const points = [];
        
        // Base
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(0.6, 0));
        points.push(new THREE.Vector2(0.6, 0.1));
        
        // Body
        points.push(new THREE.Vector2(0.7, 0.2));
        points.push(new THREE.Vector2(0.8, 0.5));
        points.push(new THREE.Vector2(0.8, 1.2));
        points.push(new THREE.Vector2(0.7, 1.3));
        points.push(new THREE.Vector2(0, 1.3));
        
        // Create lathe geometry
        return new THREE.LatheGeometry(points, 32);
    }
    
    /**
     * Add visual effects to the item
     */
    addEffects() {
        // Add glow effect - don't add to GLB models or tea sets
        if (this.geometryType !== 'teaSet' && this.geometryType !== 'glb') {
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.1,
                side: THREE.BackSide
            });
            
            // Create slightly larger geometry for glow effect
            let glowGeometry;
            
            if (this.mesh.geometry && this.mesh.geometry.clone) {
                glowGeometry = this.mesh.geometry.clone();
                
                // Scale vertices outward
                const positionAttribute = glowGeometry.getAttribute('position');
                const positions = positionAttribute.array;
                
                for (let i = 0; i < positions.length; i += 3) {
                    const x = positions[i];
                    const y = positions[i + 1];
                    const z = positions[i + 2];
                    
                    const length = Math.sqrt(x * x + y * y + z * z);
                    const scale = 1.05; // 5% larger
                    
                    if (length > 0) {
                        positions[i] = x * scale;
                        positions[i + 1] = y * scale;
                        positions[i + 2] = z * scale;
                    }
                }
                
                positionAttribute.needsUpdate = true;
            } else {
                // Fallback for geometries without clone method
                switch (this.geometryType) {
                    case 'vase':
                    case 'bowl':
                        glowGeometry = new THREE.SphereGeometry(1.1, 32, 32);
                        break;
                    case 'sculpture':
                        glowGeometry = new THREE.TorusKnotGeometry(1.1, 0.35, 128, 32, 2, 3);
                        break;
                    case 'plane':
                        glowGeometry = new THREE.PlaneGeometry(3.1, 4.1, 1, 1);
                        break;
                    default:
                        glowGeometry = new THREE.SphereGeometry(1.1, 32, 32);
                        break;
                }
            }
            
            this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            this.container.add(this.glowMesh);
        }
        
        // Add particle effect
        this.addParticles();
    }
    
    /**
     * Add particle effect around the item
     */
    addParticles() {
        // Create particles
        const particleCount = 20;
        const particles = new THREE.Group();
        
        // Autumn colors
        const colors = [
            new THREE.Color('#FFB178'), // Soft orange
            new THREE.Color('#E78F8E'), // Soft red
            new THREE.Color('#FEEAA7'), // Pale yellow
            new THREE.Color('#D4A373'), // Soft brown
            new THREE.Color('#A8DADC')  // Pastel green
        ];
        
        // Create particle geometry
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        
        for (let i = 0; i < particleCount; i++) {
            // Random color
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
     * Show the item
     */
    show() {
        this.container.visible = true;
        this.isVisible = true;
        
        // Reset position and rotation
        this.container.position.copy(this.position);
        this.container.rotation.copy(this.rotation);
        
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
        
        // Update glow effect
        if (this.glowMesh) {
            this.glowMesh.material.opacity = 0.1 + Math.sin(Date.now() * 0.001) * 0.05;
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
     * Handle window resize
     */
    resize() {
        // Any resize-specific updates
    }
    destroy() {
        // Remove from scene
        if (this.container.parent) {
            this.container.parent.remove(this.container);
        }
        
        // Dispose of geometries and materials
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) {
                if (Array.isArray(this.mesh.material)) {
                    this.mesh.material.forEach(material => material.dispose());
                } else {
                    this.mesh.material.dispose();
                }
            }
        }
        
        // Dispose of GLB model if present
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
        
        if (this.glowMesh) {
            if (this.glowMesh.geometry) this.glowMesh.geometry.dispose();
            if (this.glowMesh.material) this.glowMesh.material.dispose();
        }
        
        if (this.particles) {
            for (const particle of this.particles.children) {
                if (particle.geometry) particle.geometry.dispose();
                if (particle.material) particle.material.dispose();
            }
        }
    }
}
