/**
 * World class - Updated for Laqueno
 * Manages the 3D world and all artwork objects
 */

import * as THREE from 'three';
import { ArtworkItem } from './ArtworkItem.js';

export class World {
    constructor(experience) {
        this.experience = experience;
        this.scene = this.experience.scene;
        console.log('World initialized with scene:', !!this.scene);
        
        this.resources = this.experience.resources;
        this.camera = this.experience.camera;
        this.controls = this.experience.controls;
        
        // Artwork items
        this.items = [];
        this.currentIndex = 0;
        
        // Environment
        this.environment = null;
        
        // Setup
        this.resources.on('ready', () => {
            console.log('Resources ready in World, setting up scene');
            this.setupEnvironment();
            this.setupArtworks();
            this.setupLights();
            
            // Set total items in controls
            if (this.controls) {
                this.controls.on('horizontalTransition', (direction) => {
                    this.animateParticlesForHorizontalNavigation(direction);
                });
                
                this.controls.on('itemChange', (index) => {
                    // Find transition direction
                    const direction = index > this.currentIndex ? 'left' : 'right';
                    this.showItemWithHorizontalTransition(index, direction);
                });
            }
            
            this.experience.emit('worldReady');
        });
    }
    
    /**
     * Setup environment (background, fog, etc.)
     */
    setupEnvironment() {
        // Set background color
        this.scene.background = new THREE.Color('#2b2e1f'); // Laqueno theme color
        
        // Add subtle fog
        this.scene.fog = new THREE.FogExp2('#2b2e1f', 0.035);
        
        // Create environment group
        this.environment = new THREE.Group();
        this.scene.add(this.environment);
        
        // Add ambient particles - moved to the right side
        this.addAmbientParticles();
    }

    /**
     * Animate particles for transitions between artworks
     */
    animateParticlesForHorizontalNavigation(direction) {
        // Only continue if we have constellations
        if (!this.particles) return;
        
        console.log(`Animating constellations for horizontal navigation ${direction}`);
        
        // Animation speed and direction
        const speed = direction === 'left' ? -0.25 : 0.25;
        const targetX = direction === 'left' ? -15 : 15;
        
        // Save original positions to restore later
        if (!this.originalParticlePositions) {
            this.originalParticlePositions = [];
            
            this.particles.children.forEach(constellation => {
                const constellationData = {
                    position: constellation.position.clone(),
                    children: []
                };
                
                // Save data for each child (stars and lines)
                constellation.children.forEach(child => {
                    if (child.isMesh) {
                        constellationData.children.push({
                            index: child.userData.index,
                            position: child.position.clone(),
                            scale: child.scale.clone(),
                            opacity: child.material.opacity
                        });
                    }
                });
                
                this.originalParticlePositions.push(constellationData);
            });
        }
        
        // Active animation
        let animating = true;
        
        // Function to animate constellations each frame
        const animateConstellations = () => {
            if (!animating) return;
            
            let allConstellationsReached = true;
            
            // Move each constellation toward the target
            this.particles.children.forEach(constellation => {
                // Move in the navigation direction
                constellation.position.x += speed;
                
                // Add gradual fade-out effect
                constellation.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity *= 0.95;
                    }
                });
                
                // Check if the constellation has reached its destination
                if ((direction === 'left' && constellation.position.x > targetX) || 
                    (direction === 'right' && constellation.position.x < targetX)) {
                    allConstellationsReached = false;
                }
            });
            
            // Also animate the current item's particles if they exist
            if (this.items[this.currentIndex] && this.items[this.currentIndex].particles) {
                this.items[this.currentIndex].particles.children.forEach(particle => {
                    if (particle.isMesh) {
                        particle.position.x += speed * 1.5; // Slightly faster
                        particle.material.opacity *= 0.9; // Faster fade-out
                    }
                });
            }
            
            // If all constellations have reached their destination, restore positions
            if (allConstellationsReached) {
                animating = false;
                this.resetParticlePositions();
            } else {
                requestAnimationFrame(animateConstellations);
            }
        };
        
        // Start animation
        animateConstellations();
    }
    
    /**
     * Reset particles to original positions after animation
     */
    resetParticlePositions() {
        if (!this.particles) return;
        
        // For each constellation
        this.particles.children.forEach((constellation, index) => {
            // Calculate new random position on the right side
            const newPosition = new THREE.Vector3(
                (Math.random() * 20) + 10, // Position on the right side
                (Math.random() - 0.5) * 30,
                -30 - Math.random() * 20
            );
            
            // Apply new position with a small variation
            constellation.position.x = newPosition.x;
            constellation.position.y = newPosition.y;
            constellation.position.z = newPosition.z;
            
            // Reset movement speeds with random direction
            constellation.userData.movementSpeed = {
                x: (Math.random() - 0.5) * 0.002,
                y: (Math.random() - 0.5) * 0.002,
                z: (Math.random() - 0.5) * 0.001
            };
            
            // Reset rotation speeds
            constellation.userData.rotationSpeed = {
                x: (Math.random() - 0.5) * 0.0001,
                y: (Math.random() - 0.5) * 0.0001,
                z: (Math.random() - 0.5) * 0.0001
            };
            
            // Reset animation phase for each star and line
            constellation.children.forEach(child => {
                if (child.isMesh) {
                    // Update pulse phase
                    child.userData.pulsePhase = Math.random() * Math.PI * 2;
                    
                    // If original position has been saved, reset it
                    if (child.userData.originalPosition) {
                        child.position.copy(child.userData.originalPosition);
                    }
                }
                else if (child.isLine) {
                    child.userData.pulsePhase = Math.random() * Math.PI * 2;
                }
            });
        });
        
        // Also restore stars of current items if they exist
        if (this.items[this.currentIndex] && this.items[this.currentIndex].resetParticles) {
            this.items[this.currentIndex].resetParticles();
        }
    }

    /**
     * Show item with horizontal transition
     */
    showItemWithHorizontalTransition(index, direction) {
        if (index < 0 || index >= this.items.length) return;
        
        console.log(`Showing item ${index} with horizontal transition ${direction}`);
        
        // Hide all items
        for (const item of this.items) {
            item.hide();
        }
        
        // Show the selected item with transition effect
        this.items[index].show(direction);
        this.currentIndex = index;
        
        // Move camera to item position
        if (this.camera) {
            const position = new THREE.Vector3(0, 0, 5);
            const lookAt = new THREE.Vector3(0, 0, 0);
            
            this.camera.moveTo(position, lookAt);
        }
        
        // Trigger particle animation for transition effect
        this.animateParticlesForHorizontalNavigation(direction);
    }

    /**
     * Add ambient particles to the environment - positioned on the right side
     */
    addAmbientParticles() {
        // Create group to contain all constellations
        const constellationsGroup = new THREE.Group();
        this.scene.add(constellationsGroup);
        
        // Number of constellations to create
        const numConstellations = this.experience.sizes.isMobile ? 5 : 8;
        
        // Create each constellation
        for (let c = 0; c < numConstellations; c++) {
            // Create a group for this constellation
            const constellationGroup = new THREE.Group();
            
            // Random position for the constellation center - placed on the right side
            const centerPosition = new THREE.Vector3(
                (Math.random() * 20) + 10, // Position on the right side (x > 0)
                (Math.random() - 0.5) * 30,
                -30 - Math.random() * 20
            );
            
            constellationGroup.position.copy(centerPosition);
            
            // Random number of stars (3-7 per constellation)
            const starCount = 3 + Math.floor(Math.random() * 5);
            
            // Array to store the stars in this constellation
            const stars = [];
            
            // Create material for the stars - use Laqueno color palette
            const starMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xe4e3d3, // Cream color to match Laqueno theme
                transparent: true,
                opacity: 0.8
            });
            
            // Geometry for the stars - different sizes
            const starGeometries = [
                new THREE.SphereGeometry(0.05, 8, 8),
                new THREE.SphereGeometry(0.08, 8, 8),
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.SphereGeometry(0.15, 8, 8)
            ];
            
            // Create stars for this constellation
            for (let i = 0; i < starCount; i++) {
                // Random position within the constellation radius
                const position = new THREE.Vector3(
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 4
                );
                
                // Select a random geometry
                const geometry = starGeometries[Math.floor(Math.random() * starGeometries.length)];
                
                // Create the star
                const star = new THREE.Mesh(geometry, starMaterial.clone());
                star.position.copy(position);
                
                // Add animation properties
                star.userData.originalOpacity = 0.6 + Math.random() * 0.4;
                star.userData.pulseSpeed = 0.3 + Math.random() * 0.5;
                star.userData.pulsePhase = Math.random() * Math.PI * 2;
                star.userData.movementAmplitude = 0.05 + Math.random() * 0.1;
                star.userData.movementSpeed = 0.2 + Math.random() * 0.3;
                star.userData.movementOffset = Math.random() * Math.PI * 2;
                star.material.opacity = star.userData.originalOpacity;
                
                // Add to the constellation group and save reference
                constellationGroup.add(star);
                stars.push(star);
            }
            
            // Create lines to connect the stars with Laqueno colors
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: 0xa6a995, // Soft gray-green to match Laqueno theme
                transparent: true,
                opacity: 0.3,
                linewidth: 1
            });
            
            // Generate connections - each star connects to 1-2 nearby stars
            for (let i = 0; i < stars.length; i++) {
                // Decide how many connections this star will have
                const connectionCount = Math.min(stars.length - 1, 1 + Math.floor(Math.random() * 2));
                
                // Calculate distances to all other stars
                const distances = [];
                for (let j = 0; j < stars.length; j++) {
                    if (i !== j) {
                        distances.push({
                            index: j,
                            distance: stars[i].position.distanceTo(stars[j].position)
                        });
                    }
                }
                
                // Sort by distance
                distances.sort((a, b) => a.distance - b.distance);
                
                // Connect with the closest stars
                for (let c = 0; c < connectionCount; c++) {
                    // Avoid duplicate lines (only connect if j > i)
                    const targetIndex = distances[c].index;
                    if (targetIndex > i) {
                        // Create points for the line
                        const points = [
                            stars[i].position.clone(),
                            stars[targetIndex].position.clone()
                        ];
                        
                        // Create geometry and mesh for the line
                        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                        const line = new THREE.Line(lineGeometry, lineMaterial.clone());
                        
                        // Animation properties for the line
                        line.userData.originalOpacity = 0.1 + Math.random() * 0.3;
                        line.userData.pulseSpeed = 0.2 + Math.random() * 0.4;
                        line.userData.pulsePhase = Math.random() * Math.PI * 2;
                        line.material.opacity = line.userData.originalOpacity;
                        
                        // Add reference to the stars it connects
                        line.userData.star1 = i;
                        line.userData.star2 = targetIndex;
                        
                        // Add to the group
                        constellationGroup.add(line);
                    }
                }
            }
            
            // Add global movement to the constellation
            constellationGroup.userData.rotationSpeed = {
                x: (Math.random() - 0.5) * 0.0001,
                y: (Math.random() - 0.5) * 0.0001,
                z: (Math.random() - 0.5) * 0.0001
            };
            
            constellationGroup.userData.movementSpeed = {
                x: (Math.random() - 0.5) * 0.002,
                y: (Math.random() - 0.5) * 0.002,
                z: (Math.random() - 0.5) * 0.001
            };
            
            // Add the constellation group to the main group
            constellationsGroup.add(constellationGroup);
        }
        
        // Save reference to the constellations group
        this.particles = constellationsGroup;
    }
    
    /**
     * Setup artwork items
     */
    setupArtworks() {
        // Define artwork items (all GLB models)
        const artworkData = [
            {
                name: 'ceramic1',
                title: 'Vasija Otoñal',
                description: 'Cerámica artesanal con esmaltes en tonos tierra y ocre, inspirada en las formas orgánicas de la naturaleza.',
                dimensions: '30 × 15 × 15 cm',
                material: 'Cerámica esmaltada',
                year: '2025',
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(3.5, 3.5, 3.5),
                model: this.resources.getItem('obj')
            },
            {
                name: 'ceramic2',
                title: 'Cuenco Textural',
                description: 'Pieza de cerámica con relieves táctiles que evocan la corteza de los árboles en otoño.',
                dimensions: '25 × 20 × 20 cm',
                material: 'Arcilla blanca con óxidos',
                year: '2025',
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 1),
                model: this.resources.getItem('about-model'),
                particleColors: [
                    '#c1c4b1', // Laqueno light
                    '#a6a995', // Laqueno medium
                    '#e4e3d3', // Laqueno cream
                    '#5e634d', // Laqueno dark
                    '#2b2e1f'  // Laqueno background
                ]
            },
            {
                name: 'lamina1',
                title: 'Acuarela Otoñal',
                description: 'Técnica mixta sobre papel, capturando la esencia de los bosques en otoño con tonos cálidos y texturas.',
                dimensions: '40 × 30 cm',
                material: 'Técnica mixta sobre papel',
                year: '2024',
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 1),
                model: this.resources.getItem('lamina1'),
                particleColors: [
                    '#e4e3d3', // Laqueno cream
                    '#c1c4b1', // Laqueno light
                    '#a6a995', // Laqueno medium
                    '#5e634d', // Laqueno dark
                    '#2b2e1f'  // Laqueno background
                ]
            },
            {
                name: 'lamina1',
                title: 'Acuarela Otoñal',
                description: 'Técnica mixta sobre papel, capturando la esencia de los bosques en otoño con tonos cálidos y texturas.',
                dimensions: '40 × 30 cm',
                material: 'Técnica mixta sobre papel',
                year: '2024',
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 1),
                model: this.resources.getItem('lamina1'),
                particleColors: [
                    '#e4e3d3', // Laqueno cream
                    '#c1c4b1', // Laqueno light
                    '#a6a995', // Laqueno medium
                    '#5e634d', // Laqueno dark
                    '#2b2e1f'  // Laqueno background
                ]
            }
        ];
        
        // Create artwork items
        for (const data of artworkData) {
            const item = new ArtworkItem(this, data);
            this.items.push(item);
        }
        
        // Show first item
        if (this.items.length > 0) {
            this.showItem(0);

            if (this.experience.ui) {
                this.experience.ui.updateInfoForItem(0);
            }
        }
    }
    
    /**
     * Setup lights
     */
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(5, 5, 5);
        mainLight.castShadow = true;
        
        // Configure shadow
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -10;
        mainLight.shadow.camera.right = 10;
        mainLight.shadow.camera.top = 10;
        mainLight.shadow.camera.bottom = -10;
        
        this.scene.add(mainLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0xe4e3d3, 0.7); // Laqueno cream color
        fillLight.position.set(-5, 3, -5);
        this.scene.add(fillLight);
        
        // Rim light
        const rimLight = new THREE.DirectionalLight(0xc1c4b1, 0.5); // Laqueno light color
        rimLight.position.set(0, -5, -5);
        this.scene.add(rimLight);
    }
    
    /**
     * Show a specific artwork item
     */
    showItem(index) {
        if (index < 0 || index >= this.items.length) return;
        
        // Hide all items
        for (const item of this.items) {
            item.hide();
        }
        
        // Show selected item
        this.items[index].show();
        this.currentIndex = index;
        
        // Move camera to item position
        if (this.camera) {
            const position = new THREE.Vector3(0, 0, 5);
            const lookAt = new THREE.Vector3(0, 0, 0);
            this.camera.moveTo(position, lookAt);
        }
    }
    
    /**
     * Handle window resize
     */
    resize() {
        // Update items
        for (const item of this.items) {
            if (item.resize) item.resize();
        }
    }
    
    /**
     * Update world on each frame
     */
    update() {
        // Update items
        for (const item of this.items) {
            if (item.update) item.update();
        }
        
        // Update particles
        if (this.particles) {
            // Update each constellation group
            for (const constellation of this.particles.children) {
                // Apply global rotation and movement to the constellation
                constellation.rotation.x += constellation.userData.rotationSpeed.x;
                constellation.rotation.y += constellation.userData.rotationSpeed.y;
                constellation.rotation.z += constellation.userData.rotationSpeed.z;
                
                constellation.position.x += constellation.userData.movementSpeed.x;
                constellation.position.y += constellation.userData.movementSpeed.y;
                constellation.position.z += constellation.userData.movementSpeed.z;
                
                // Movement boundaries - make them return to the visible area on the right side
                const maxDistanceX = 50;
                const maxDistanceY = 40;
                const maxDistanceZ = 60;
                
                // Keep particles mainly on the right side
                if (constellation.position.x < 0) {
                    constellation.position.x = (Math.random() * 20) + 10; // Reset to right side
                    constellation.userData.movementSpeed.x = Math.abs(constellation.userData.movementSpeed.x);
                }
                
                if (constellation.position.x > maxDistanceX) {
                    constellation.userData.movementSpeed.x *= -1;
                }
                
                if (Math.abs(constellation.position.y) > maxDistanceY) {
                    constellation.userData.movementSpeed.y *= -1;
                }
                
                if (Math.abs(constellation.position.z) > maxDistanceZ) {
                    constellation.userData.movementSpeed.z *= -1;
                }
                
                // For each element of the constellation (stars and lines)
                constellation.children.forEach(child => {
                    const time = this.experience.time.elapsed / 1000; // time in seconds
                    
                    if (child.isMesh) {
                        // Star - animate pulsating brightness
                        const pulseValue = 0.5 + 0.5 * Math.sin(
                            time * child.userData.pulseSpeed + child.userData.pulsePhase
                        );
                        
                        // Apply pulsating opacity
                        child.material.opacity = child.userData.originalOpacity * pulseValue;
                        
                        // Small oscillation movement
                        const xMove = child.userData.movementAmplitude * Math.sin(
                            time * child.userData.movementSpeed + child.userData.movementOffset
                        );
                        const yMove = child.userData.movementAmplitude * Math.cos(
                            time * child.userData.movementSpeed * 0.8 + child.userData.movementOffset
                        );
                        
                        // Save original position if it's the first time
                        if (!child.userData.originalPosition) {
                            child.userData.originalPosition = child.position.clone();
                        }
                        
                        // Apply movement based on original position
                        child.position.x = child.userData.originalPosition.x + xMove;
                        child.position.y = child.userData.originalPosition.y + yMove;
                        
                        // Add small pulsating scale effect
                        const scaleFactor = 0.9 + 0.2 * pulseValue;
                        child.scale.set(scaleFactor, scaleFactor, scaleFactor);
                    } 
                    else if (child.isLine) {
                        // Line - make its opacity follow the stars
                        const pulseValue = 0.5 + 0.5 * Math.sin(
                            time * child.userData.pulseSpeed + child.userData.pulsePhase
                        );
                        
                        child.material.opacity = child.userData.originalOpacity * pulseValue;
                        
                        // Update line points to follow star movement
                        if (child.userData.star1 !== undefined && child.userData.star2 !== undefined) {
                            const star1 = constellation.children[child.userData.star1];
                            const star2 = constellation.children[child.userData.star2];
                            
                            if (star1 && star2) {
                                const points = [
                                    star1.position.clone(),
                                    star2.position.clone()
                                ];
                                
                                child.geometry.setFromPoints(points);
                                child.geometry.attributes.position.needsUpdate = true;
                            }
                        }
                    }
                });
            }
        }
    }
    
    /**
     * Clean up and destroy world
     */
    destroy() {
        // Dispose of items
        for (const item of this.items) {
            if (item.destroy) item.destroy();
        }
        
        // Clear arrays
        this.items = [];
    }
}