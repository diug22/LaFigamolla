/**
 * World class
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
        this.scene.background = new THREE.Color('#050810');
        
        // Add subtle fog
        this.scene.fog = new THREE.FogExp2('#050810', 0.035);
        
        // Create environment group
        this.environment = new THREE.Group();
        this.scene.add(this.environment);
        
        // Add ambient particles
        this.addAmbientParticles();
    }

    /**
     * Animate particles for transitions between artworks
     */
    animateParticlesForHorizontalNavigation(direction) {
        // Solo continuar si tenemos constelaciones
        if (!this.particles) return;
        
        console.log(`Animando constelaciones para navegación horizontal ${direction}`);
        
        // Velocidad y dirección de la animación
        const speed = direction === 'left' ? -0.25 : 0.25;
        const targetX = direction === 'left' ? -15 : 15;
        
        // Guardar las posiciones originales para restaurarlas después
        if (!this.originalParticlePositions) {
            this.originalParticlePositions = [];
            
            this.particles.children.forEach(constellation => {
                const constellationData = {
                    position: constellation.position.clone(),
                    children: []
                };
                
                // Guardar datos de cada hijo (estrellas y líneas)
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
        
        // Animación activa
        let animating = true;
        
        // Función para animar las constelaciones en cada frame
        const animateConstellations = () => {
            if (!animating) return;
            
            let allConstellationsReached = true;
            
            // Mover cada constelación hacia el objetivo
            this.particles.children.forEach(constellation => {
                // Mover en la dirección de la navegación
                constellation.position.x += speed;
                
                // Añadir efecto de desvanecimiento gradual
                constellation.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity *= 0.95;
                    }
                });
                
                // Comprobar si la constelación ha alcanzado el destino
                if ((direction === 'left' && constellation.position.x > targetX) || 
                    (direction === 'right' && constellation.position.x < targetX)) {
                    allConstellationsReached = false;
                }
            });
            
            // Animar también las partículas del ítem actual si existen
            if (this.items[this.currentIndex] && this.items[this.currentIndex].particles) {
                this.items[this.currentIndex].particles.children.forEach(particle => {
                    if (particle.isMesh) {
                        particle.position.x += speed * 1.5; // Ligeramente más rápido
                        particle.material.opacity *= 0.9; // Desvanecimiento más rápido
                    }
                });
            }
            
            // Si todas las constelaciones han alcanzado su destino, restaurar posiciones
            if (allConstellationsReached) {
                animating = false;
                this.resetParticlePositions();
            } else {
                requestAnimationFrame(animateConstellations);
            }
        };
        
        // Iniciar animación
        animateConstellations();
    }
    
    /**
     * Reset particles to original positions after animation
     */
    resetParticlePositions() {
        if (!this.particles) return;
        
        // Para cada constelación
        this.particles.children.forEach((constellation, index) => {
            // Calcular nueva posición aleatoria
            const newPosition = new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 30,
                -30 - Math.random() * 20
            );
            
            // Aplicar nueva posición con una pequeña variación
            constellation.position.x = newPosition.x;
            constellation.position.y = newPosition.y;
            constellation.position.z = newPosition.z;
            
            // Reiniciar velocidades de movimiento con dirección aleatoria
            constellation.userData.movementSpeed = {
                x: (Math.random() - 0.5) * 0.002,
                y: (Math.random() - 0.5) * 0.002,
                z: (Math.random() - 0.5) * 0.001
            };
            
            // Reiniciar velocidades de rotación
            constellation.userData.rotationSpeed = {
                x: (Math.random() - 0.5) * 0.0001,
                y: (Math.random() - 0.5) * 0.0001,
                z: (Math.random() - 0.5) * 0.0001
            };
            
            // Reiniciar fase de animación para cada estrella y línea
            constellation.children.forEach(child => {
                if (child.isMesh) {
                    // Actualizar fase de pulsación
                    child.userData.pulsePhase = Math.random() * Math.PI * 2;
                    
                    // Si se ha guardado la posición original, reiniciarla
                    if (child.userData.originalPosition) {
                        child.position.copy(child.userData.originalPosition);
                    }
                }
                else if (child.isLine) {
                    child.userData.pulsePhase = Math.random() * Math.PI * 2;
                }
            });
        });
        
        // También restaurar estrellas de los ítems actuales si existen
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
     * Add ambient particles to the environment
     */
    addAmbientParticles() {
        // Crear grupo para contener todas las constelaciones
        const constellationsGroup = new THREE.Group();
        this.scene.add(constellationsGroup);
        
        // Número de constelaciones a crear
        const numConstellations = this.experience.sizes.isMobile ? 5 : 8;
        
        // Crear cada constelación
        for (let c = 0; c < numConstellations; c++) {
            // Crear un grupo para esta constelación
            const constellationGroup = new THREE.Group();
            
            // Posición aleatoria para el centro de la constelación
            const centerPosition = new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 30,
                -30 - Math.random() * 20
            );
            
            constellationGroup.position.copy(centerPosition);
            
            // Número aleatorio de estrellas (3-7 por constelación)
            const starCount = 3 + Math.floor(Math.random() * 5);
            
            // Array para almacenar las estrellas de esta constelación
            const stars = [];
            
            // Crear material para las estrellas
            const starMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xffffff,
                transparent: true,
                opacity: 0.8
            });
            
            // Geometría para las estrellas - diferentes tamaños
            const starGeometries = [
                new THREE.SphereGeometry(0.05, 8, 8),
                new THREE.SphereGeometry(0.08, 8, 8),
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.SphereGeometry(0.15, 8, 8)
            ];
            
            // Crear estrellas para esta constelación
            for (let i = 0; i < starCount; i++) {
                // Posición aleatoria dentro del radio de la constelación
                const position = new THREE.Vector3(
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 4
                );
                
                // Seleccionar una geometría aleatoria
                const geometry = starGeometries[Math.floor(Math.random() * starGeometries.length)];
                
                // Crear la estrella
                const star = new THREE.Mesh(geometry, starMaterial.clone());
                star.position.copy(position);
                
                // Añadir propiedades de animación
                star.userData.originalOpacity = 0.6 + Math.random() * 0.4;
                star.userData.pulseSpeed = 0.3 + Math.random() * 0.5;
                star.userData.pulsePhase = Math.random() * Math.PI * 2;
                star.userData.movementAmplitude = 0.05 + Math.random() * 0.1;
                star.userData.movementSpeed = 0.2 + Math.random() * 0.3;
                star.userData.movementOffset = Math.random() * Math.PI * 2;
                star.material.opacity = star.userData.originalOpacity;
                
                // Añadir al grupo de la constelación y guardar referencia
                constellationGroup.add(star);
                stars.push(star);
            }
            
            // Crear líneas para conectar las estrellas
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: 0xffffff,
                transparent: true,
                opacity: 0.3,
                linewidth: 1
            });
            
            // Generar las conexiones - cada estrella se conecta a 1-2 estrellas cercanas
            for (let i = 0; i < stars.length; i++) {
                // Decidir cuántas conexiones tendrá esta estrella
                const connectionCount = Math.min(stars.length - 1, 1 + Math.floor(Math.random() * 2));
                
                // Calcular distancias a todas las demás estrellas
                const distances = [];
                for (let j = 0; j < stars.length; j++) {
                    if (i !== j) {
                        distances.push({
                            index: j,
                            distance: stars[i].position.distanceTo(stars[j].position)
                        });
                    }
                }
                
                // Ordenar por distancia
                distances.sort((a, b) => a.distance - b.distance);
                
                // Conectar con las estrellas más cercanas
                for (let c = 0; c < connectionCount; c++) {
                    // Evitar duplicados de líneas (solo conectar si j > i)
                    const targetIndex = distances[c].index;
                    if (targetIndex > i) {
                        // Crear puntos para la línea
                        const points = [
                            stars[i].position.clone(),
                            stars[targetIndex].position.clone()
                        ];
                        
                        // Crear geometría y mesh para la línea
                        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                        const line = new THREE.Line(lineGeometry, lineMaterial.clone());
                        
                        // Propiedades de animación para la línea
                        line.userData.originalOpacity = 0.1 + Math.random() * 0.3;
                        line.userData.pulseSpeed = 0.2 + Math.random() * 0.4;
                        line.userData.pulsePhase = Math.random() * Math.PI * 2;
                        line.material.opacity = line.userData.originalOpacity;
                        
                        // Añadir referencia a las estrellas que conecta
                        line.userData.star1 = i;
                        line.userData.star2 = targetIndex;
                        
                        // Añadir al grupo
                        constellationGroup.add(line);
                    }
                }
            }
            
            // Añadir movimiento global a la constelación
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
            
            // Añadir el grupo de la constelación al grupo principal
            constellationsGroup.add(constellationGroup);
        }
        
        // Guardar referencia al grupo de constelaciones
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
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(2, 2, 2),
                model: this.resources.getItem('obj')
            },
            {
                name: 'ceramic2',
                title: 'Cuenco Textural',
                description: 'Pieza de cerámica con relieves táctiles que evocan la corteza de los árboles en otoño.',
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 1),
                model: this.resources.getItem('obj2'),
                particleColors: [
                    '#556B2F', // Dark Olive Green
                    '#6B8E23', // Olive Drab
                    '#808000', // Olive
                    '#BDB76B', // Dark Khaki
                    '#F0E68C'  // Khaki
                ]
            },
            {
                name: 'lamina1',
                title: 'Acuarela Otoñal',
                description: 'Técnica mixta sobre papel, capturando la esencia de los bosques en otoño con tonos cálidos y texturas.',
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 1),
                model: this.resources.getItem('lamina1'),
                particleColors: [
                    '#FF7F50', // Coral
                    '#FF4500', // Orange Red
                    '#FF8C00', // Dark Orange
                    '#FFA500', // Orange
                    '#FFBF00'  // Amber
                ]
            },
            {
                name: 'moon',
                title: 'Acuarela Otoñal',
                description: 'Técnica mixta sobre papel, capturando la esencia de los bosques en otoño con tonos cálidos y texturas.',
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 1),
                model: this.resources.getItem('moon'),
                particleColors: [
                    '#FF7F50', // Coral
                    '#FF4500', // Orange Red
                    '#FF8C00', // Dark Orange
                    '#FFA500', // Orange
                    '#FFBF00'  // Amber
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
        const fillLight = new THREE.DirectionalLight(0xffd0b0, 0.7); // Warm fill light
        fillLight.position.set(-5, 3, -5);
        this.scene.add(fillLight);
        
        // Rim light
        const rimLight = new THREE.DirectionalLight(0xa0d0ff, 0.5); // Cool rim light
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
            // Actualizar cada grupo de constelación
            for (const constellation of this.particles.children) {
                // Aplicar rotación y movimiento global a la constelación
                constellation.rotation.x += constellation.userData.rotationSpeed.x;
                constellation.rotation.y += constellation.userData.rotationSpeed.y;
                constellation.rotation.z += constellation.userData.rotationSpeed.z;
                
                constellation.position.x += constellation.userData.movementSpeed.x;
                constellation.position.y += constellation.userData.movementSpeed.y;
                constellation.position.z += constellation.userData.movementSpeed.z;
                
                // Límites de movimiento - hacer que vuelvan al área visible
                const maxDistance = 50;
                if (Math.abs(constellation.position.x) > maxDistance) {
                    constellation.userData.movementSpeed.x *= -1;
                }
                if (Math.abs(constellation.position.y) > maxDistance) {
                    constellation.userData.movementSpeed.y *= -1;
                }
                if (Math.abs(constellation.position.z) > maxDistance) {
                    constellation.userData.movementSpeed.z *= -1;
                }
                
                // Para cada elemento de la constelación (estrellas y líneas)
                constellation.children.forEach(child => {
                    const time = this.experience.time.elapsed / 1000; // tiempo en segundos
                    
                    if (child.isMesh) {
                        // Es una estrella - animar brillo pulsante
                        const pulseValue = 0.5 + 0.5 * Math.sin(
                            time * child.userData.pulseSpeed + child.userData.pulsePhase
                        );
                        
                        // Aplicar opacidad pulsante
                        child.material.opacity = child.userData.originalOpacity * pulseValue;
                        
                        // Pequeño movimiento de oscilación
                        const xMove = child.userData.movementAmplitude * Math.sin(
                            time * child.userData.movementSpeed + child.userData.movementOffset
                        );
                        const yMove = child.userData.movementAmplitude * Math.cos(
                            time * child.userData.movementSpeed * 0.8 + child.userData.movementOffset
                        );
                        
                        // Guardar posición original si es la primera vez
                        if (!child.userData.originalPosition) {
                            child.userData.originalPosition = child.position.clone();
                        }
                        
                        // Aplicar movimiento basado en la posición original
                        child.position.x = child.userData.originalPosition.x + xMove;
                        child.position.y = child.userData.originalPosition.y + yMove;
                        
                        // Añadir un pequeño efecto de escala pulsante
                        const scaleFactor = 0.9 + 0.2 * pulseValue;
                        child.scale.set(scaleFactor, scaleFactor, scaleFactor);
                    } 
                    else if (child.isLine) {
                        // Es una línea - hacer que su opacidad siga a las estrellas
                        const pulseValue = 0.5 + 0.5 * Math.sin(
                            time * child.userData.pulseSpeed + child.userData.pulsePhase
                        );
                        
                        child.material.opacity = child.userData.originalOpacity * pulseValue;
                        
                        // Actualizar puntos de la línea para seguir el movimiento de las estrellas
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