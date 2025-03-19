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
        this.camera = experience.camera;
        
        // Configuración por defecto
        this.config = {
            // Número de constelaciones
            minConstellations: this.experience.sizes.isMobile ? 10 : 15,
            maxConstellations: this.experience.sizes.isMobile ? 15 : 25,
            
            // Posiciones - límites
            positionX: { min: -60, max: 60 },
            positionY: { min: -40, max: 40 },
            positionZ: { min: -5, max: 5 },
            
            // Evitar el centro donde está la obra
            avoidCenter: false,
            centerAvoidanceRadius: 30,
            
            // Tamaños de estrellas
            starSize: { min: 0.06, max: 0.15 },
            
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
     * Create a constellation individual
     * @param {THREE.Group} parent - Group where the constellation will be added
     */
    createConstellation(parent) {
        // Crear un grupo para esta constelación
        const constellationGroup = new THREE.Group();
        
        // Determinar posición para evitar el centro si está configurado
        let centerPosition;
        
        if (this.config.avoidCenter) {
            // Generar posición que evite el centro
            centerPosition = this.generatePositionAvoidingCenter();
        } else {
            // Posición aleatoria normal
            centerPosition = new THREE.Vector3(
                this.getRandomInRange(this.config.positionX.min, this.config.positionX.max),
                this.getRandomInRange(this.config.positionY.min, this.config.positionY.max),
                this.getRandomInRange(this.config.positionZ.min, this.config.positionZ.max)
            );
        }
        
        constellationGroup.position.copy(centerPosition);
        
        // Número aleatorio de estrellas - REDUCIDO
        const starCount = 3 + Math.floor(Math.random() * 3); // 3-5 estrellas
        
        // Array para almacenar las estrellas en esta constelación
        const stars = [];
        
        // Crear material para las estrellas - MÁS SUTIL
        const starMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: this.getRandomInRange(this.config.starOpacity.min, this.config.starOpacity.max)
        });
        
        // Geometrías para las estrellas - tamaños configurables
        const minSize = this.config.starSize.min;
        const maxSize = this.config.starSize.max;
        const starGeometries = [
            new THREE.SphereGeometry(minSize, 6, 6),
            new THREE.SphereGeometry(minSize + (maxSize - minSize) * 0.33, 6, 6),
            new THREE.SphereGeometry(minSize + (maxSize - minSize) * 0.66, 6, 6),
            new THREE.SphereGeometry(maxSize, 6, 6)
        ];
        
        // Crear estrellas para esta constelación - MÁS COMPACTAS
        for (let i = 0; i < starCount; i++) {
            // Posición aleatoria dentro del radio de la constelación (más compacta)
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * 4, // Más compacto
                (Math.random() - 0.5) * 4, // Más compacto
                // Importante: Z siempre negativo o cero para asegurar que esté detrás
                -(Math.random() * 2)
            );
            
            // Seleccionar geometría aleatoria
            const geometry = starGeometries[Math.floor(Math.random() * starGeometries.length)];
            
            // Color más sutil - variaciones de gris claro/blanco
            const colorValue = 0.8 + Math.random() * 0.2; // Valores entre 0.8 y 1.0
            const color = new THREE.Color(colorValue, colorValue, colorValue);
            const material = starMaterial.clone();
            material.color = color;
            
            const star = new THREE.Mesh(geometry, material);
            star.position.copy(position);
            
            // Añadir propiedades de animación - MÁS SUTILES
            star.userData.originalOpacity = this.getRandomInRange(
                this.config.starOpacity.min,
                this.config.starOpacity.max
            ) * 0.8; // Reducir opacidad un 20%
            star.userData.pulseSpeed = this.getRandomInRange(
                this.config.pulseSpeed.min,
                this.config.pulseSpeed.max
            ) * 0.5; // Pulso 50% más lento
            star.userData.pulsePhase = Math.random() * Math.PI * 2;
            star.userData.movementAmplitude = 0.01 + Math.random() * 0.04; // Amplitud mucho más pequeña
            star.userData.movementSpeed = 0.05 + Math.random() * 0.1; // Velocidad mucho más lenta
            star.userData.movementOffset = Math.random() * Math.PI * 2;
            star.material.opacity = star.userData.originalOpacity;
            
            // Añadir a la constelación y guardar referencia
            constellationGroup.add(star);
            stars.push(star);
        }
        
        // Crear líneas SOLO para algunas estrellas - no todas
        if (stars.length >= 3 && Math.random() < 0.7) { // 70% de probabilidad
            // Líneas más tenues
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: 0xe4e3d3,
                transparent: true,
                opacity: this.getRandomInRange(this.config.lineOpacity.min, this.config.lineOpacity.max) * 0.5, // 50% más tenue
            });
            
            // Número reducido de conexiones
            const maxConnections = Math.min(stars.length - 1, 2); // Máximo 2 conexiones
            
            // Conectar solo algunas estrellas
            for (let i = 0; i < stars.length && i < maxConnections; i++) {
                // Solo un subconjunto de estrellas tienen conexiones
                if (Math.random() < 0.5) continue; // 50% de probabilidad de saltarse una estrella
                
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
                
                // Conectar solo con la estrella más cercana
                if (distances.length > 0) {
                    const targetIndex = distances[0].index;
                    // Evitar líneas duplicadas (solo conectar si j > i)
                    if (targetIndex > i) {
                        // Crear puntos para la línea
                        const points = [
                            stars[i].position.clone(),
                            stars[targetIndex].position.clone()
                        ];
                        
                        // Crear geometría y mesh para la línea
                        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                        const line = new THREE.Line(lineGeometry, lineMaterial.clone());
                        
                        // Propiedades de animación para la línea - MUY SUTILES
                        line.userData.originalOpacity = this.getRandomInRange(
                            this.config.lineOpacity.min / 3,
                            this.config.lineOpacity.max / 3
                        );
                        line.userData.pulseSpeed = this.getRandomInRange(
                            this.config.pulseSpeed.min / 3,
                            this.config.pulseSpeed.max / 3
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
        }
        
        // Movimientos extremadamente lentos
        constellationGroup.userData.rotationSpeed = {
            x: this.getRandomInRange(-this.config.rotationSpeed.max/10, this.config.rotationSpeed.max/10),
            y: this.getRandomInRange(-this.config.rotationSpeed.max/10, this.config.rotationSpeed.max/10),
            z: this.getRandomInRange(-this.config.rotationSpeed.max/20, this.config.rotationSpeed.max/20)
        };
        
        constellationGroup.userData.movementSpeed = {
            x: this.getRandomInRange(-this.config.movementSpeed.max/10, this.config.movementSpeed.max/10),
            y: this.getRandomInRange(-this.config.movementSpeed.max/10, this.config.movementSpeed.max/10),
            z: 0 // No movimiento en Z
        };
        
        // Añadir el grupo de la constelación al grupo principal
        parent.add(constellationGroup);
    }

    generatePositionAvoidingCenter() {
        const radius = this.config.centerAvoidanceRadius;
        let x, y, z;
        let isValid = false;
        
        // Intentar hasta encontrar una posición válida
        while (!isValid) {
            // Generar posición candidata
            x = this.getRandomInRange(this.config.positionX.min, this.config.positionX.max);
            y = this.getRandomInRange(this.config.positionY.min, this.config.positionY.max);
            z = this.getRandomInRange(this.config.positionZ.min, this.config.positionZ.max);
            
            // Comprobar si está fuera del radio central
            const distanceFromCenter = Math.sqrt(x * x + y * y);
            
            // Si está fuera del radio o a veces en los bordes
            if (distanceFromCenter > radius || Math.random() < 0.1) {
                isValid = true;
            }
        }
        
        return new THREE.Vector3(x, y, z);
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
     * Método para ser llamado desde el update, que comprueba y corrige problemas
     * de acumulación de estrellas periódicamente
     */
    checkAndResetIfNeeded() {
        // Verificar si ha pasado suficiente tiempo desde el último reset
        const currentTime = Date.now();
        
        // Inicializar el tiempo del último reset si es la primera vez
        if (!this.lastResetTime) {
            this.lastResetTime = currentTime;
            return;
        }
        
        // Resetear posiciones cada 30 segundos para prevenir acumulación
        const resetInterval = 5000; // 30 segundos
        
        if (currentTime - this.lastResetTime > resetInterval) {
            this.resetConstellationPositions();
            this.lastResetTime = currentTime;
        }
    }

    resetConstellationPositions() {
        console.log("Reseteando posiciones de constelaciones para prevenir acumulación");
        
        if (!this.particles) return;
        
        // Para cada constelación
        this.particles.children.forEach((constellation, index) => {
            // Generar nueva posición evitando el centro
            let newPosition;
            
            if (this.config.avoidCenter) {
                newPosition = this.generatePositionAvoidingCenter();
            } else {
                newPosition = new THREE.Vector3(
                    this.getRandomInRange(this.config.positionX.min, this.config.positionX.max),
                    this.getRandomInRange(this.config.positionY.min, this.config.positionY.max),
                    this.getRandomInRange(this.config.positionZ.min, this.config.positionZ.max)
                );
            }
            
            // Aplicar nueva posición
            constellation.position.copy(newPosition);
            
            // Reiniciar velocidades de movimiento con valores muy lentos
            constellation.userData.movementSpeed = {
                x: this.getRandomInRange(-this.config.movementSpeed.max/10, this.config.movementSpeed.max/10),
                y: this.getRandomInRange(-this.config.movementSpeed.max/10, this.config.movementSpeed.max/10),
                z: 0
            };
            
            // Resetear rotaciones
            constellation.rotation.set(0, 0, 0);
            constellation.userData.rotationSpeed = {
                x: this.getRandomInRange(-this.config.rotationSpeed.max/10, this.config.rotationSpeed.max/10),
                y: this.getRandomInRange(-this.config.rotationSpeed.max/10, this.config.rotationSpeed.max/10),
                z: this.getRandomInRange(-this.config.rotationSpeed.max/20, this.config.rotationSpeed.max/20)
            };
            
            // Resetear cada estrella y línea
            constellation.children.forEach(child => {
                if (child.isMesh) {
                    // Generar nueva posición local
                    const newLocalPosition = new THREE.Vector3(
                        (Math.random() - 0.5) * 4, // Más compacto
                        (Math.random() - 0.5) * 4, // Más compacto
                        -(Math.random() * 2)       // Siempre negativo
                    );
                    
                    // Actualizar posición
                    child.position.copy(newLocalPosition);
                    
                    // Actualizar posición original
                    child.userData.originalPosition = newLocalPosition.clone();
                    
                    // Actualizar fase de animación
                    child.userData.pulsePhase = Math.random() * Math.PI * 2;
                    
                    // Resetear escala
                    child.scale.set(1, 1, 1);
                    
                    // Restablecer opacidad
                    child.material.opacity = child.userData.originalOpacity || 0.5;
                }
            });
            
            // Actualizar líneas después de mover estrellas
            constellation.children.forEach(child => {
                if (child.isLine) {
                    // Actualizar fase de animación
                    child.userData.pulsePhase = Math.random() * Math.PI * 2;
                    
                    // Restablecer opacidad
                    child.material.opacity = child.userData.originalOpacity || 0.2;
                    
                    // Actualizar geometría de la línea
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
    }
        
    /**
     * Actualizar partículas en cada frame
     */
    update() {
        // Actualizar cada constelación
        this.checkAndResetIfNeeded();

        if (this.particles) {
            for (const constellation of this.particles.children) {
                // Aplicar rotación y movimiento global a la constelación
                constellation.rotation.x += constellation.userData.rotationSpeed.x;
                constellation.rotation.y += constellation.userData.rotationSpeed.y;
                constellation.rotation.z += constellation.userData.rotationSpeed.z;
                
                constellation.position.x += constellation.userData.movementSpeed.x;
                constellation.position.y += constellation.userData.movementSpeed.y;
                // No aplicamos movimiento en Z
                
                // Aplicar límites más estrictos
                const maxDistanceX = Math.max(Math.abs(this.config.positionX.min), Math.abs(this.config.positionX.max)) * 0.7;
                const maxDistanceY = Math.max(Math.abs(this.config.positionY.min), Math.abs(this.config.positionY.max)) * 0.7;
                
                // Asegurar que se mantengan en los límites
                if (Math.abs(constellation.position.x) > maxDistanceX) {
                    constellation.userData.movementSpeed.x *= -0.8; // Invertir y reducir velocidad
                    constellation.position.x = Math.sign(constellation.position.x) * maxDistanceX * 0.95;
                }
                
                if (Math.abs(constellation.position.y) > maxDistanceY) {
                    constellation.userData.movementSpeed.y *= -0.8; // Invertir y reducir velocidad
                    constellation.position.y = Math.sign(constellation.position.y) * maxDistanceY * 0.95;
                }
                
                // Si se acerca demasiado al centro, alejar
                if (this.config.avoidCenter) {
                    const distanceFromCenter = Math.sqrt(
                        constellation.position.x * constellation.position.x + 
                        constellation.position.y * constellation.position.y
                    );
                    
                    if (distanceFromCenter < this.config.centerAvoidanceRadius) {
                        // Calcular vector desde el centro
                        const angle = Math.atan2(constellation.position.y, constellation.position.x);
                        const pushFactor = 0.05; // Factor de empuje suave
                        
                        // Empujar gradualmente hacia afuera
                        constellation.position.x += Math.cos(angle) * pushFactor;
                        constellation.position.y += Math.sin(angle) * pushFactor;
                    }
                }
                
                // Actualizar cada estrella y línea con animaciones muy sutiles
                constellation.children.forEach(child => {
                    const time = this.time.elapsed / 2000; // tiempo en segundos pero más lento
                    
                    if (child.isMesh) { // Estrella
                        // Pulsación muy sutil
                        const pulseValue = 0.8 + 0.2 * Math.sin(
                            time * child.userData.pulseSpeed + child.userData.pulsePhase
                        );
                        
                        // Aplicar opacidad pulsante
                        child.material.opacity = Math.max(0.2, child.userData.originalOpacity * pulseValue);
                        
                        // Pequeño movimiento oscilatorio (extremadamente sutil)
                        if (child.userData.originalPosition) {
                            const xMove = child.userData.movementAmplitude * Math.sin(
                                time * child.userData.movementSpeed + child.userData.movementOffset
                            );
                            const yMove = child.userData.movementAmplitude * Math.cos(
                                time * child.userData.movementSpeed * 0.5 + child.userData.movementOffset
                            );
                            
                            // Aplicar movimiento muy sutil
                            child.position.x = child.userData.originalPosition.x + xMove;
                            child.position.y = child.userData.originalPosition.y + yMove;
                        } else {
                            // Guardar posición original si es la primera vez
                            child.userData.originalPosition = child.position.clone();
                        }
                        
                        // Efecto de escala mínimo
                        const scaleFactor = 0.95 + 0.1 * pulseValue;
                        child.scale.set(scaleFactor, scaleFactor, scaleFactor);
                    } 
                    else if (child.isLine) { // Línea
                        // Opacidad pulsante muy sutil
                        const pulseValue = 0.85 + 0.15 * Math.sin(
                            time * child.userData.pulseSpeed + child.userData.pulsePhase
                        );
                        
                        child.material.opacity = Math.max(0.05, child.userData.originalOpacity * pulseValue);
                        
                        // Actualizar geometría para seguir a las estrellas
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