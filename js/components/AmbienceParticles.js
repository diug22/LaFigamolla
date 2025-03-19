/**
 * AmbienceParticles class
 * Gestiona las partículas de fondo que crean un ambiente de constelaciones
 */

import * as THREE from 'three';

export class AmbienceParticles {
    constructor(scene, experience, options = {}) {
        this.scene = scene;
        this.experience = experience;
        this.time = experience.time;
        this.sizes = experience.sizes;
        
        // Configuración por defecto
        this.config = {
            // Número de constelaciones
            minConstellations: this.experience.sizes.isMobile ? 10 : 15,
            maxConstellations: this.experience.sizes.isMobile ? 15 : 25,
            
            // Posiciones - límites
            positionX: { min: -60, max: 60 },
            positionY: { min: -40, max: 40 },
            positionZ: { min: -5, max: 5 },
            
            // Velocidades de movimiento
            movementSpeed: { min: 0.0005, max: 0.003 },
            rotationSpeed: { min: 0.00001, max: 0.0001 },
            
            // Apariencia
            starOpacity: { min: 0.6, max: 0.9 },
            lineOpacity: { min: 0.3, max: 0.6 },
            
            // Animación de particulas
            pulseSpeed: { min: 0.2, max: 0.5 },
            
            // Profundidad Z
            globalZPosition: -80,
            
            // Configuración de fondo
            backgroundPlane: {
                enabled: true,
                width: 120,
                height: 80,
                color: 0x1a1a1a,
                opacity: 0.5,
                zPosition: -45
            }
        };
        
        // Sobrescribir configuración con opciones proporcionadas
        if (options) {
            this.config = {...this.config, ...options};
        }
        
        // Estado
        this.particles = null;
        this.particlesAnimating = false;
        this.particleAnimationRequest = null;
        this.particlesNeedStabilization = false;
        
        // Inicializar
        this.init();
    }
    
    /**
     * Inicializar el sistema de partículas
     */
    init() {
        // Crear grupo para contener todas las constelaciones
        const constellationsGroup = new THREE.Group();
        
        // Posicionar el grupo detrás de las obras
        constellationsGroup.position.z = this.config.globalZPosition;
        
        this.scene.add(constellationsGroup);
        
        // Determinar número aleatorio de constelaciones dentro del rango configurado
        const numConstellations = Math.floor(
            this.config.minConstellations + 
            Math.random() * (this.config.maxConstellations - this.config.minConstellations)
        );
        
        console.log(`Creando ${numConstellations} constelaciones ambientales`);
        
        // Crear cada constelación
        for (let c = 0; c < numConstellations; c++) {
            this.createConstellation(constellationsGroup);
        }
        
        // Guardar referencia al grupo de constelaciones
        this.particles = constellationsGroup;
        
        // Añadir plano de fondo si está habilitado
        if (this.config.backgroundPlane.enabled) {
            this.addBackgroundPlane();
        }
    }
    
    /**
     * Crear una constelación individual
     * @param {THREE.Group} parent - Grupo padre donde añadir la constelación
     */
    createConstellation(parent) {
        // Crear un grupo para esta constelación
        const constellationGroup = new THREE.Group();
        
        // Posición aleatoria para la constelación dentro de los límites configurados
        const centerPosition = new THREE.Vector3(
            this.getRandomInRange(this.config.positionX.min, this.config.positionX.max),
            this.getRandomInRange(this.config.positionY.min, this.config.positionY.max),
            this.getRandomInRange(this.config.positionZ.min, this.config.positionZ.max)
        );
        
        constellationGroup.position.copy(centerPosition);
        
        // Número aleatorio de estrellas (3-7 por constelación)
        const starCount = 3 + Math.floor(Math.random() * 5);
        
        // Array para almacenar las estrellas en esta constelación
        const stars = [];
        
        // Crear material para las estrellas
        const starMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: this.getRandomInRange(this.config.starOpacity.min, this.config.starOpacity.max)
        });
        
        // Geometrías para las estrellas - diferentes tamaños
        const starGeometries = [
            new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.SphereGeometry(0.15, 8, 8),
            new THREE.SphereGeometry(0.2, 8, 8)
        ];
        
        // Crear estrellas para esta constelación
        for (let i = 0; i < starCount; i++) {
            // Posición aleatoria dentro del radio de la constelación
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 4
            );
            
            // Seleccionar geometría aleatoria
            const geometry = starGeometries[Math.floor(Math.random() * starGeometries.length)];
            
            // Crear estrella con colores más vibrantes
            const starColors = [0xffffff, 0xe4e3d3, 0xf5f5f5, 0xececec]; // Variaciones de blanco
            const color = starColors[Math.floor(Math.random() * starColors.length)];
            const material = starMaterial.clone();
            material.color.set(color);
            
            const star = new THREE.Mesh(geometry, material);
            star.position.copy(position);
            
            // Añadir propiedades de animación
            star.userData.originalOpacity = this.getRandomInRange(
                this.config.starOpacity.min,
                this.config.starOpacity.max
            );
            star.userData.pulseSpeed = this.getRandomInRange(
                this.config.pulseSpeed.min,
                this.config.pulseSpeed.max
            );
            star.userData.pulsePhase = Math.random() * Math.PI * 2;
            star.userData.movementAmplitude = 0.08 + Math.random() * 0.15;
            star.userData.movementSpeed = 0.2 + Math.random() * 0.3;
            star.userData.movementOffset = Math.random() * Math.PI * 2;
            star.material.opacity = star.userData.originalOpacity;
            
            // Añadir a la constelación y guardar referencia
            constellationGroup.add(star);
            stars.push(star);
        }
        
        // Crear líneas para conectar las estrellas
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0xe4e3d3,
            transparent: true,
            opacity: this.getRandomInRange(this.config.lineOpacity.min, this.config.lineOpacity.max),
            linewidth: 1.5
        });
        
        // Generar conexiones - cada estrella conecta con 1-2 cercanas
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
                // Evitar líneas duplicadas (solo conectar si j > i)
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
                    line.userData.originalOpacity = this.getRandomInRange(
                        this.config.lineOpacity.min / 2,
                        this.config.lineOpacity.max / 2
                    );
                    line.userData.pulseSpeed = this.getRandomInRange(
                        this.config.pulseSpeed.min,
                        this.config.pulseSpeed.max
                    );
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
            x: this.getRandomInRange(-this.config.rotationSpeed.max, this.config.rotationSpeed.max),
            y: this.getRandomInRange(-this.config.rotationSpeed.max, this.config.rotationSpeed.max),
            z: this.getRandomInRange(-this.config.rotationSpeed.max, this.config.rotationSpeed.max)
        };
        
        constellationGroup.userData.movementSpeed = {
            x: this.getRandomInRange(-this.config.movementSpeed.max, this.config.movementSpeed.max),
            y: this.getRandomInRange(-this.config.movementSpeed.max, this.config.movementSpeed.max),
            z: this.getRandomInRange(-this.config.movementSpeed.max/2, this.config.movementSpeed.max/2)
        };
        
        // Añadir el grupo de la constelación al grupo principal
        parent.add(constellationGroup);
    }
    
    /**
     * Añadir plano de fondo para dar profundidad
     */
    addBackgroundPlane() {
        const config = this.config.backgroundPlane;
        
        const bgPlaneGeometry = new THREE.PlaneGeometry(config.width, config.height);
        const bgPlaneMaterial = new THREE.MeshBasicMaterial({
            color: config.color,
            transparent: true,
            opacity: config.opacity,
            side: THREE.DoubleSide
        });
        
        const bgPlane = new THREE.Mesh(bgPlaneGeometry, bgPlaneMaterial);
        bgPlane.position.z = config.zPosition;
        this.scene.add(bgPlane);
        
        // Guardar referencia
        this.backgroundPlane = bgPlane;
    }
    
    /**
     * Animar partículas para transiciones entre obras
     * @param {string} direction - Dirección de la transición ('left' o 'right')
     */
    animateParticlesForHorizontalNavigation(direction) {
        // Solo continuar si tenemos constelaciones
        if (!this.particles) return;
        
        console.log(`Animando constelaciones para navegación horizontal ${direction}`);
        
        // Detener animaciones previas
        if (this.particleAnimationRequest) {
            cancelAnimationFrame(this.particleAnimationRequest);
            this.particleAnimationRequest = null;
        }
        
        // Preparar para animación con valores más seguros
        const speed = direction === 'left' ? -0.12 : 0.12; // Velocidad reducida
        let animationStartTime = Date.now();
        const animationDuration = 800; // ms
        
        // Establecer flag para control de animación
        this.particlesAnimating = true;
        
        // Función para animar constelaciones cada frame con límite de tiempo
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
     * Resetear partículas a posiciones originales después de animación
     */
    resetParticlePositions() {
        if (!this.particles) return;
        
        // Detener todas las animaciones pendientes
        if (this.particleAnimationRequest) {
            cancelAnimationFrame(this.particleAnimationRequest);
            this.particleAnimationRequest = null;
        }
        
        // Restablecer posición global del grupo
        this.particles.position.set(0, 0, this.config.globalZPosition);
        
        // Para cada constelación
        this.particles.children.forEach((constellation, index) => {
            // Detener cualquier movimiento existente
            constellation.userData.movementSpeed = {
                x: 0, y: 0, z: 0
            };
            
            // Generar nueva posición aleatoria dentro de límites seguros
            const newPosition = new THREE.Vector3(
                this.getRandomInRange(this.config.positionX.min, this.config.positionX.max),
                this.getRandomInRange(this.config.positionY.min, this.config.positionY.max),
                this.getRandomInRange(this.config.positionZ.min, this.config.positionZ.max)
            );
            
            // Aplicar nueva posición inmediatamente
            constellation.position.copy(newPosition);
            
            // Reiniciar velocidades de movimiento con valores conservadores
            constellation.userData.movementSpeed = {
                x: this.getRandomInRange(-this.config.movementSpeed.min, this.config.movementSpeed.min),
                y: this.getRandomInRange(-this.config.movementSpeed.min, this.config.movementSpeed.min),
                z: this.getRandomInRange(-this.config.movementSpeed.min/2, this.config.movementSpeed.min/2)
            };
            
            // Resetear rotaciones
            constellation.rotation.set(0, 0, 0);
            constellation.userData.rotationSpeed = {
                x: this.getRandomInRange(-this.config.rotationSpeed.min, this.config.rotationSpeed.min),
                y: this.getRandomInRange(-this.config.rotationSpeed.min, this.config.rotationSpeed.min),
                z: this.getRandomInRange(-this.config.rotationSpeed.min, this.config.rotationSpeed.min)
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
     * Actualizar partículas en cada frame
     */
    update() {
        // Actualizar cada constelación
        if (this.particles) {
            for (const constellation of this.particles.children) {
                // Aplicar rotación y movimiento global a la constelación
                constellation.rotation.x += constellation.userData.rotationSpeed.x;
                constellation.rotation.y += constellation.userData.rotationSpeed.y;
                constellation.rotation.z += constellation.userData.rotationSpeed.z;
                
                constellation.position.x += constellation.userData.movementSpeed.x;
                constellation.position.y += constellation.userData.movementSpeed.y;
                constellation.position.z += constellation.userData.movementSpeed.z;
                
                // Límites de movimiento - hacer que regresen al área visible
                const maxDistanceX = Math.max(Math.abs(this.config.positionX.min), Math.abs(this.config.positionX.max));
                const maxDistanceY = Math.max(Math.abs(this.config.positionY.min), Math.abs(this.config.positionY.max));
                const maxDistanceZ = Math.max(Math.abs(this.config.positionZ.min), Math.abs(this.config.positionZ.max));
                
                // Mantener partículas principalmente en el área definida
                if (constellation.position.x < this.config.positionX.min) {
                    constellation.position.x = this.config.positionX.max * Math.random();
                    constellation.userData.movementSpeed.x = Math.abs(constellation.userData.movementSpeed.x);
                }
                
                if (constellation.position.x > this.config.positionX.max) {
                    constellation.userData.movementSpeed.x *= -1;
                }
                
                if (Math.abs(constellation.position.y) > maxDistanceY) {
                    constellation.userData.movementSpeed.y *= -1;
                }
                
                if (Math.abs(constellation.position.z) > maxDistanceZ) {
                    constellation.userData.movementSpeed.z *= -1;
                }
                
                // Actualizar cada estrella y línea en la constelación
                constellation.children.forEach(child => {
                    const time = this.time.elapsed / 1000; // tiempo en segundos
                    
                    if (child.isMesh) {
                        // Estrella - animar brillo pulsante
                        const pulseValue = 0.7 + 0.3 * Math.sin(
                            time * child.userData.pulseSpeed + child.userData.pulsePhase
                        );
                        
                        // Aplicar opacidad pulsante
                        child.material.opacity = Math.max(0.4, child.userData.originalOpacity * pulseValue);
                        
                        // Pequeño movimiento oscilatorio
                        const xMove = child.userData.movementAmplitude * 1.5 * Math.sin(
                            time * child.userData.movementSpeed + child.userData.movementOffset
                        );
                        const yMove = child.userData.movementAmplitude * 1.5 * Math.cos(
                            time * child.userData.movementSpeed * 0.8 + child.userData.movementOffset
                        );
                        
                        // Guardar posición original si es la primera vez
                        if (!child.userData.originalPosition) {
                            child.userData.originalPosition = child.position.clone();
                        }
                        
                        // Aplicar movimiento basado en posición original
                        child.position.x = child.userData.originalPosition.x + xMove;
                        child.position.y = child.userData.originalPosition.y + yMove;
                        
                        // Añadir pequeño efecto de escala pulsante
                        const scaleFactor = 0.8 + 0.4 * pulseValue;
                        child.scale.set(scaleFactor, scaleFactor, scaleFactor);
                    } 
                    else if (child.isLine) {
                        // Línea - hacer que su opacidad siga a las estrellas
                        const pulseValue = 0.6 + 0.4 * Math.sin(
                            time * child.userData.pulseSpeed + child.userData.pulsePhase
                        );
                        
                        child.material.opacity = Math.max(0.2, child.userData.originalOpacity * pulseValue);
                        
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
     * Obtener un valor aleatorio en un rango específico
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {number} - Valor aleatorio dentro del rango
     */
    getRandomInRange(min, max) {
        return min + Math.random() * (max - min);
    }
    
    /**
     * Limpiar recursos y eliminar partículas
     */
    destroy() {
        // Detener animaciones
        if (this.particleAnimationRequest) {
            cancelAnimationFrame(this.particleAnimationRequest);
            this.particleAnimationRequest = null;
        }
        
        // Eliminar partículas de la escena
        if (this.particles && this.particles.parent) {
            this.particles.parent.remove(this.particles);
        }
        
        // Eliminar plano de fondo si existe
        if (this.backgroundPlane && this.backgroundPlane.parent) {
            this.backgroundPlane.parent.remove(this.backgroundPlane);
        }
        
        // Liberar geometrías y materiales
        if (this.particles) {
            this.particles.traverse((child) => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
    }
}