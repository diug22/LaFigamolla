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
        // Solo continuar si tenemos constelaciones
        if (!this.particles) return;
        
        console.log(`Animating constellations for horizontal navigation ${direction}`);
        
        // Detener animaciones previas
        if (this.particleAnimationRequest) {
            cancelAnimationFrame(this.particleAnimationRequest);
            this.particleAnimationRequest = null;
        }
        
        // Preparar para animación con valores más seguros
        const speed = direction === 'left' ? -0.12 : 0.12; // Velocidad reducida
        const maxDistance = 8; // Distancia máxima reducida para evitar escape
        let animationStartTime = Date.now();
        const animationDuration = 800; // ms
        
        // Establecer flag para control de animación
        this.particlesAnimating = true;
        
        // Función para animar constellations cada frame con límite de tiempo
        const animateConstellations = () => {
            if (!this.particlesAnimating) return;
            
            const elapsed = Date.now() - animationStartTime;
            const progress = Math.min(elapsed / animationDuration, 1.0);
            
            // Mover cada constelación con velocidad controlada
            this.particles.children.forEach(constellation => {
                // Aplicar movimiento limitado
                constellation.position.x += speed;
                
                // Añadir desvanecimiento gradual
                constellation.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity *= 0.98;
                    }
                });
            });
            
            // Si la animación ha terminado o ha pasado demasiado tiempo, resetear
            if (progress >= 1.0) {
                this.particlesAnimating = false;
                this.resetParticlePositions();
                return;
            }
            
            // Continuar animación
            this.particleAnimationRequest = requestAnimationFrame(animateConstellations);
        };
        
        // Iniciar animación
        animateConstellations();
        
        // Forzar reseteo después de un tiempo máximo como precaución
        setTimeout(() => {
            if (this.particlesAnimating) {
                this.particlesAnimating = false;
                this.resetParticlePositions();
            }
        }, animationDuration + 200); // Un poco más de tiempo que la duración para seguridad
    }
    
    /**
     * Reset particles to original positions after animation
     */
    resetParticlePositions() {
        if (!this.particles) return;
        
        // Detener todas las animaciones pendientes
        if (this.particleAnimationRequest) {
            cancelAnimationFrame(this.particleAnimationRequest);
            this.particleAnimationRequest = null;
        }
        
        // Restablecer posición global del grupo
        this.particles.position.set(0, 0, -80);
        
        // Para cada constelación
        this.particles.children.forEach((constellation, index) => {
            // Detener cualquier movimiento existente
            constellation.userData.movementSpeed = {
                x: 0, y: 0, z: 0
            };
            
            // Generar nueva posición aleatoria dentro de límites seguros
            const newPosition = new THREE.Vector3(
                (Math.random() - 0.5) * 120,  // Distribuir horizontalmente
                (Math.random() - 0.5) * 80,  // Distribuir verticalmente
                (Math.random() - 0.5) * 10   // Pequeña variación en profundidad
            );
            
            // Aplicar nueva posición inmediatamente
            constellation.position.copy(newPosition);
            
            // Reiniciar velocidades de movimiento con valores conservadores
            constellation.userData.movementSpeed = {
                x: (Math.random() - 0.5) * 0.001, // Velocidad más lenta para evitar escape
                y: (Math.random() - 0.5) * 0.001,
                z: (Math.random() - 0.5) * 0.0005
            };
            
            // Resetear rotaciones
            constellation.rotation.set(0, 0, 0);
            constellation.userData.rotationSpeed = {
                x: (Math.random() - 0.5) * 0.00005,
                y: (Math.random() - 0.5) * 0.00005,
                z: (Math.random() - 0.5) * 0.00005
            };
            
            // Resetear cada estrella y línea
            constellation.children.forEach(child => {
                if (child.isMesh) {
                    // Actualizar fase de animación
                    child.userData.pulsePhase = Math.random() * Math.PI * 2;
                    
                    // Si tenía posición original, resetearla
                    if (child.userData.originalPosition) {
                        child.position.copy(child.userData.originalPosition);
                    }
                    
                    // Restablecer opacidad
                    child.material.opacity = child.userData.originalOpacity || 0.7;
                    
                    // Restablecer escala
                    child.scale.set(1, 1, 1);
                }
                else if (child.isLine) {
                    // Actualizar fase de animación
                    child.userData.pulsePhase = Math.random() * Math.PI * 2;
                    
                    // Restablecer opacidad
                    child.material.opacity = child.userData.originalOpacity || 0.4;
                    
                    // Actualizar geometría de la línea si es necesario
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
        });
        
        // Marcar el sistema como estable
        this.particlesNeedStabilization = false;
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

        if (this.items[this.currentIndex] && 
            this.items[this.currentIndex].rotationController) {
            this.items[this.currentIndex].rotationController.state.rotationVelocity.set(0, 0);
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
     * Add ambient particles to the environment - positioned in the background
     */
    addAmbientParticles() {
        // Create group to contain all constellations
        const constellationsGroup = new THREE.Group();
        
        // Importante: posicionar todo el grupo detrás de las obras
        constellationsGroup.position.z = -80; // Mover todo el grupo hacia atrás
        
        this.scene.add(constellationsGroup);
        
        // Number of constellations to create - aumentar para mayor densidad
        const numConstellations = this.experience.sizes.isMobile ? 12 : 20;
        
        // Create each constellation
        for (let c = 0; c < numConstellations; c++) {
            // Create a group for this constellation
            const constellationGroup = new THREE.Group();
            
            // Random position for the constellation distributed en un área más amplia
            const centerPosition = new THREE.Vector3(
                (Math.random() - 0.5) * 120, // Distribuir horizontalmente
                (Math.random() - 0.5) * 80, // Distribuir verticalmente
                (Math.random() - 0.5) * 10  // Pequeña variación en profundidad
            );
            
            constellationGroup.position.copy(centerPosition);
            
            // Random number of stars (3-7 per constellation)
            const starCount = 3 + Math.floor(Math.random() * 5);
            
            // Array to store the stars in this constellation
            const stars = [];
            
            // Create material for the stars - use brighter colors and more opacity
            const starMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xffffff, // Color blanco puro para mayor brillo
                transparent: true,
                opacity: 0.9 // Mayor opacidad
            });
            
            // Geometry for the stars - different sizes with bigger stars
            const starGeometries = [
                new THREE.SphereGeometry(0.08, 8, 8),
                new THREE.SphereGeometry(0.12, 8, 8),
                new THREE.SphereGeometry(0.15, 8, 8),
                new THREE.SphereGeometry(0.2, 8, 8)
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
                
                // Create the star with more vibrant colors
                const starColors = [0xffffff, 0xe4e3d3, 0xf5f5f5, 0xececec]; // Variaciones de blanco
                const color = starColors[Math.floor(Math.random() * starColors.length)];
                const material = starMaterial.clone();
                material.color.set(color);
                
                const star = new THREE.Mesh(geometry, material);
                star.position.copy(position);
                
                // Add animation properties with increased values
                star.userData.originalOpacity = 0.7 + Math.random() * 0.3; // Mayor opacidad base
                star.userData.pulseSpeed = 0.3 + Math.random() * 0.5;
                star.userData.pulsePhase = Math.random() * Math.PI * 2;
                star.userData.movementAmplitude = 0.08 + Math.random() * 0.15; // Mayor amplitud
                star.userData.movementSpeed = 0.2 + Math.random() * 0.3;
                star.userData.movementOffset = Math.random() * Math.PI * 2;
                star.material.opacity = star.userData.originalOpacity;
                
                // Add to the constellation group and save reference
                constellationGroup.add(star);
                stars.push(star);
            }
            
            // Create lines to connect the stars with more visible colors
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: 0xe4e3d3, // Color más claro y visible
                transparent: true,
                opacity: 0.6, // Mayor opacidad para las líneas
                linewidth: 1.5 // Líneas más gruesas (aunque no funciona en WebGL)
            });
            
            // Generate connections - cada estrella conecta con 1-2 cercanas
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
                        
                        // Animation properties for the line with more visibility
                        line.userData.originalOpacity = 0.3 + Math.random() * 0.3; // Mayor opacidad
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
                x: (Math.random() - 0.5) * 0.003, // Movimiento más pronunciado
                y: (Math.random() - 0.5) * 0.003,
                z: (Math.random() - 0.5) * 0.001
            };
            
            // Add the constellation group to the main group
            constellationsGroup.add(constellationGroup);
        }
        
        // Save reference to the constellations group
        this.particles = constellationsGroup;
        
        // Añadir un plano oscuro y transparente para dar profundidad
        const bgPlaneGeometry = new THREE.PlaneGeometry(120, 80);
        const bgPlaneMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a1a1a,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const bgPlane = new THREE.Mesh(bgPlaneGeometry, bgPlaneMaterial);
        bgPlane.position.z = -45;
        this.scene.add(bgPlane);
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
                const maxDistanceX = 120;
                const maxDistanceY = 60;
                const maxDistanceZ = 15;
                
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
                
                constellation.children.forEach(child => {
                    const time = this.experience.time.elapsed / 1000; // time in seconds
                    
                    if (child.isMesh) {
                        // Star - animate pulsating brightness with higher intensity
                        const pulseValue = 0.7 + 0.3 * Math.sin(
                            time * child.userData.pulseSpeed + child.userData.pulsePhase
                        );
                        
                        // Apply pulsating opacity with higher base value
                        child.material.opacity = Math.max(0.4, child.userData.originalOpacity * pulseValue);
                        
                        // Small oscillation movement with more visible motion
                        const xMove = child.userData.movementAmplitude * 1.5 * Math.sin(
                            time * child.userData.movementSpeed + child.userData.movementOffset
                        );
                        const yMove = child.userData.movementAmplitude * 1.5 * Math.cos(
                            time * child.userData.movementSpeed * 0.8 + child.userData.movementOffset
                        );
                        
                        // Save original position if it's the first time
                        if (!child.userData.originalPosition) {
                            child.userData.originalPosition = child.position.clone();
                        }
                        
                        // Apply movement based on original position
                        child.position.x = child.userData.originalPosition.x + xMove;
                        child.position.y = child.userData.originalPosition.y + yMove;
                        
                        // Add small pulsating scale effect for more visual interest
                        const scaleFactor = 0.8 + 0.4 * pulseValue;
                        child.scale.set(scaleFactor, scaleFactor, scaleFactor);
                    } 
                    else if (child.isLine) {
                        // Line - make its opacity follow the stars with higher values
                        const pulseValue = 0.6 + 0.4 * Math.sin(
                            time * child.userData.pulseSpeed + child.userData.pulsePhase
                        );
                        
                        child.material.opacity = Math.max(0.2, child.userData.originalOpacity * pulseValue);
                        
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