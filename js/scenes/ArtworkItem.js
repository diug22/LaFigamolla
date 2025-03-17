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
        const starCount = 20;  // Más estrellas
        const starGroup = new THREE.Group();
        
        // Crear material para las estrellas - color blanco más brillante
        const starMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.8  // Más opacidad para mayor visibilidad
        });
        
        // Geometrías variadas para las estrellas - tamaños más grandes
        const starGeometries = [
            new THREE.SphereGeometry(0.06, 8, 8),
            new THREE.SphereGeometry(0.09, 8, 8),
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.IcosahedronGeometry(0.08, 0)
        ];
        
        // Crear estrellas alrededor de la obra - principalmente detrás
        for (let i = 0; i < starCount; i++) {
            // Geometría aleatoria para variedad
            const geometry = starGeometries[Math.floor(Math.random() * starGeometries.length)];
            
            // Crear material con brillo propio
            const material = starMaterial.clone();
            
            // Crear estrella
            const star = new THREE.Mesh(geometry, material);
            
            // Posición esférica alrededor de la obra, pero principalmente detrás
            // Usamos un radio mayor y control de distribución para posicionar más estrellas detrás
            const radius = 2.5 + Math.random() * 2;  // Radio más grande
            const theta = Math.random() * Math.PI * 2;
            
            // Modificar phi para que la mayoría de estrellas estén detrás
            // phi cerca de 0 o PI = parte trasera, phi cerca de PI/2 = parte media
            let phi;
            const positionType = Math.random();
            if (positionType < 0.7) {
                // 70% de estrellas detrás
                phi = (Math.random() < 0.5) ? 
                    Math.random() * Math.PI * 0.3 :      // Parte superior trasera
                    Math.PI - Math.random() * Math.PI * 0.3;  // Parte inferior trasera
            } else {
                // 30% distribuidas por los lados
                phi = Math.PI * 0.3 + Math.random() * Math.PI * 0.4;
            }
            
            star.position.x = radius * Math.sin(phi) * Math.cos(theta);
            star.position.y = radius * Math.sin(phi) * Math.sin(theta);
            star.position.z = radius * Math.cos(phi) - 1;  // Desplazamiento adicional hacia atrás
            
            // Propiedades de animación - pulsaciones más visibles
            star.userData.originalOpacity = 0.5 + Math.random() * 0.5;
            star.userData.pulseSpeed = 0.2 + Math.random() * 0.5;
            star.userData.pulsePhase = Math.random() * Math.PI * 2;
            star.material.opacity = star.userData.originalOpacity;
            
            star.userData.movementSpeed = {
                theta: (Math.random() - 0.5) * 0.004,
                phi: (Math.random() - 0.5) * 0.004,
                radius: (Math.random() - 0.5) * 0.002
            };
            
            // Guardar posición original
            star.userData.originalPosition = {
                x: star.position.x,
                y: star.position.y,
                z: star.position.z
            };
            
            // Añadir al grupo
            starGroup.add(star);
        }
        
        // Crear algunas conexiones entre estrellas cercanas (mini-constelaciones)
        const connectedStars = 8;  // Más estrellas conectadas
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3  // Mayor opacidad
        });
        
        // Seleccionar aleatoriamente algunas estrellas para conectar
        const selectedIndices = [];
        while (selectedIndices.length < Math.min(connectedStars, starCount)) {
            const index = Math.floor(Math.random() * starCount);
            if (!selectedIndices.includes(index)) {
                selectedIndices.push(index);
            }
        }
        
        // Para cada estrella seleccionada, conectar a la más cercana
        for (let i = 0; i < selectedIndices.length; i++) {
            const starIndex = selectedIndices[i];
            const star = starGroup.children[starIndex];
            
            let closestIndex = -1;
            let closestDistance = Infinity;
            
            // Encontrar la estrella más cercana
            for (let j = 0; j < starGroup.children.length; j++) {
                if (j !== starIndex) {
                    const otherStar = starGroup.children[j];
                    const distance = star.position.distanceTo(otherStar.position);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = j;
                    }
                }
            }
            
            // Si encontramos una estrella cercana, crear la línea
            if (closestIndex !== -1 && closestDistance < 3) {  // Mayor distancia permitida
                const otherStar = starGroup.children[closestIndex];
                
                const points = [
                    star.position.clone(),
                    otherStar.position.clone()
                ];
                
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(lineGeometry, lineMaterial.clone());
                
                // Propiedades de animación para la línea
                line.userData.originalOpacity = 0.15 + Math.random() * 0.25;
                line.userData.pulseSpeed = 0.15 + Math.random() * 0.3;
                line.userData.pulsePhase = Math.random() * Math.PI * 2;
                line.material.opacity = line.userData.originalOpacity;
                
                // Referencias a las estrellas que conecta
                line.userData.star1 = starIndex;
                line.userData.star2 = closestIndex;
                
                // Añadir al grupo
                starGroup.add(line);
            }
        }
        
        // Añadir el grupo al contenedor de la obra
        this.container.add(starGroup);
        this.particles = starGroup;
    }
    
        /**
         * Método para restablecer las estrellas a sus posiciones originales
         * Añadir este método a la clase ArtworkItem
         */
        resetParticles() {
            if (!this.particles) return;
            
            this.particles.children.forEach(child => {
                if (child.isMesh) {
                    // Restaurar opacidad original
                    child.material.opacity = child.userData.originalOpacity;
                    
                    // Resetear posición si tiene una guardada
                    if (child.userData.originalPosition) {
                        child.position.x = child.userData.originalPosition.x;
                        child.position.y = child.userData.originalPosition.y;
                        child.position.z = child.userData.originalPosition.z;
                    }
                }
                else if (child.isLine) {
                    // Restaurar opacidad de las líneas
                    child.material.opacity = child.userData.originalOpacity;
                    
                    // Actualizar puntos de la línea
                    if (child.userData.star1 !== undefined && child.userData.star2 !== undefined) {
                        const star1 = this.particles.children[child.userData.star1];
                        const star2 = this.particles.children[child.userData.star2];
                        
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
        
    
    
    /**
     * Show the item with optional transition effect
     */
    show(direction = null) {
        this.container.visible = true;
        this.isVisible = true;
        
        // Reset position and rotation
        this.container.position.copy(this.position);
        this.container.rotation.copy(this.rotation);

        this.rotationQuaternion = new THREE.Quaternion();
        this.rotationQuaternion.setFromEuler(this.container.rotation);
        this.targetRotationQuaternion = this.rotationQuaternion.clone();
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

        if (this.world && this.world.experience && 
            this.world.experience.ui && 
            this.world.experience.ui.showGestureHint) {
            setTimeout(() => {
                this.world.experience.ui.showGestureHint("Arrastra para rotar");
            }, 2000);
        }
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
            // Rotación automática - más lenta para un efecto más sutil
            this.container.rotation.y += this.rotationSpeed * 0.7;
        } 
        else if (this.targetRotationQuaternion) {
            // Factor de suavizado
            const smoothFactor = 0.1;
            
            // Crear quaternion temporal para SLERP (interpolación esférica)
            const tempQuaternion = new THREE.Quaternion();
            tempQuaternion.setFromEuler(this.container.rotation);
            
            // Interpolar suavemente hacia la rotación objetivo
            tempQuaternion.slerp(this.targetRotationQuaternion, smoothFactor);
            
            // Aplicar la rotación interpolada
            this.container.quaternion.copy(tempQuaternion);
        }
        // Interpolación suave hacia la rotación objetivo si existe
        else if (this.targetRotation) {
            // Factor de suavizado (valor bajo = más suave)
            const smoothFactor = 0.08;
            
            // Aplicar interpolación para movimiento suave
            this.container.rotation.x += (this.targetRotation.x - this.container.rotation.x) * smoothFactor;
            this.container.rotation.y += (this.targetRotation.y - this.container.rotation.y) * smoothFactor;
        }
        
        // Update particles
        /**
 * Método para actualizar las estrellas de cada obra
 * Reemplaza la sección de update() en ArtworkItem que maneja partículas
 */
// Update particles
        if (this.particles) {
            const time = Date.now() / 1000; // tiempo en segundos
            
            this.particles.children.forEach(child => {
                if (child.isMesh) {
                    // Efecto de brillo pulsante para las estrellas
                    const pulseValue = 0.5 + 0.5 * Math.sin(
                        time * child.userData.pulseSpeed + child.userData.pulsePhase
                    );
                    
                    // Aplicar opacidad variable
                    child.material.opacity = child.userData.originalOpacity * pulseValue;
                    
                    // Movimiento suave
                    if (child.userData.originalPosition) {
                        // Obtener coordenadas esféricas actuales
                        const position = new THREE.Vector3(
                            child.position.x,
                            child.position.y,
                            child.position.z
                        );
                        
                        const radius = position.length();
                        let theta = Math.atan2(position.y, position.x);
                        let phi = Math.acos(position.z / radius);
                        
                        // Actualizar coordenadas esféricas
                        theta += child.userData.movementSpeed.theta;
                        phi += child.userData.movementSpeed.phi;
                        const newRadius = radius + child.userData.movementSpeed.radius;
                        
                        // Convertir a coordenadas cartesianas
                        child.position.x = newRadius * Math.sin(phi) * Math.cos(theta);
                        child.position.y = newRadius * Math.sin(phi) * Math.sin(theta);
                        child.position.z = newRadius * Math.cos(phi);
                        
                        // Mantener las estrellas dentro de límites
                        const maxRadius = 2.5;
                        const minRadius = 1;
                        
                        if (newRadius > maxRadius || newRadius < minRadius) {
                            child.userData.movementSpeed.radius *= -1;
                        }
                    }
                    
                    // Pequeño efecto de escala pulsante
                    const scale = 0.8 + 0.4 * pulseValue;
                    child.scale.set(scale, scale, scale);
                }
                else if (child.isLine) {
                    // Actualizar opacidad de las líneas
                    const pulseValue = 0.5 + 0.5 * Math.sin(
                        time * child.userData.pulseSpeed + child.userData.pulsePhase
                    );
                    
                    child.material.opacity = child.userData.originalOpacity * pulseValue;
                    
                    // Actualizar posición de las líneas para seguir a las estrellas
                    if (child.userData.star1 !== undefined && child.userData.star2 !== undefined) {
                        const star1 = this.particles.children[child.userData.star1];
                        const star2 = this.particles.children[child.userData.star2];
                        
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
    
    /**
     * Handle manual rotation for the model
     * @param {Number} deltaX - Horizontal movement
     * @param {Number} deltaY - Vertical movement
     */
    handleManualRotation(deltaX, deltaY) {
        if (!this.isVisible) return;
        
        const rotYFactor = 0.005;
        const rotXFactor = 0.005;

        if (!this.targetRotation) {
            this.targetRotation = {
                x: this.container.rotation.x,
                y: this.container.rotation.y
            };
        }
        
        this.targetRotation.y += deltaX * rotYFactor;

        const newRotX = this.targetRotation.x + deltaY * rotXFactor;
        this.targetRotation.x = Math.max(-Math.PI/4, Math.min(Math.PI/4, newRotX));
        
        // Desactivar animación automática mientras el usuario interactúa
        this.isAnimating = false;
        
        // Reiniciar animación después de una pausa en la interacción
        clearTimeout(this.animationTimeout);
        this.animationTimeout = setTimeout(() => {
            this.isAnimating = true;
        }, 5000);
    }

    // Añadir un nuevo método para manejar la inercia después de la rotación
    /**
     * Apply inertia effect after manual rotation
     * @param {Number} momentumX - Horizontal momentum
     * @param {Number} momentumY - Vertical momentum
     */
    applyInertia(momentumX, momentumY) {
        if (!this.isVisible) return;
        
        // Inicializar inercia si no existe
        if (!this.inertia) {
            this.inertia = { x: 0, y: 0 };
        }
        
        // Aplicar momentum como inercia inicial
        this.inertia.x = momentumX * 0.2;
        this.inertia.y = momentumY * 0.2;
        
        // Detener cualquier animación de inercia previa
        if (this.inertiaInterval) {
            clearInterval(this.inertiaInterval);
        }
        
        // Actualizar targetRotation con inercia que se desvanece
        this.inertiaInterval = setInterval(() => {
            if (Math.abs(this.inertia.x) < 0.001 && Math.abs(this.inertia.y) < 0.001) {
                clearInterval(this.inertiaInterval);
                this.inertiaInterval = null;
                return;
            }
            
            if (this.targetRotationQuaternion) {
                // Crear eje para inercia (perpendicular al movimiento)
                const axis = new THREE.Vector3(this.inertia.y, this.inertia.x, 0).normalize();
                const inertiaQuaternion = new THREE.Quaternion();
                
                this.inertiaInterval = setInterval(() => {
                    if (Math.abs(this.inertia.x) < 0.001 && Math.abs(this.inertia.y) < 0.001) {
                        clearInterval(this.inertiaInterval);
                        this.inertiaInterval = null;
                        return;
                    }
                    
                    // Calcular ángulo para inercia
                    const angle = Math.sqrt(this.inertia.x * this.inertia.x + this.inertia.y * this.inertia.y) * 0.1;
                    
                    // Crear quaternion de inercia
                    inertiaQuaternion.setFromAxisAngle(axis, angle);
                    
                    // Aplicar al quaternion de rotación objetivo
                    if (this.targetRotationQuaternion) {
                        this.targetRotationQuaternion.premultiply(inertiaQuaternion);
                    }
                    
                    // Reducir inercia gradualmente - factor de amortiguación
                    this.inertia.x *= 0.93;
                    this.inertia.y *= 0.93;
                }, 16);
            }
            if (this.targetRotation) {
                this.targetRotation.y += this.inertia.x;
                
                const newRotX = this.targetRotation.x + this.inertia.y;
                this.targetRotation.x = Math.max(-Math.PI/4, Math.min(Math.PI/4, newRotX));
            }
            
            // Reducir inercia gradualmente - factor de amortiguación
            this.inertia.x *= 0.93; // Un valor más cercano a 1 = más deslizamiento
            this.inertia.y *= 0.93;
        }, 16); // Aproximadamente 60fps
    }

    /**
 * Handle trackball rotation from pointer movement
 * @param {THREE.Quaternion} quaternion - Quaternion representing rotation
 */
handleTrackballRotation(quaternion) {
    if (!this.isVisible) return;
    
    // Asegurarnos de que tengamos un quaternion de rotación
    if (!this.rotationQuaternion) {
        this.rotationQuaternion = new THREE.Quaternion();
        this.rotationQuaternion.setFromEuler(this.container.rotation);
    }
    
    // Calcular nueva rotación
    // Multiplicamos el quaternion actual por el nuevo para acumular rotaciones
    this.rotationQuaternion.premultiply(quaternion);
    
    // Configurar rotación como target para animación suave
    if (!this.targetRotationQuaternion) {
        this.targetRotationQuaternion = new THREE.Quaternion();
    }
    
    // Copiar al quaternion objetivo para animación suave
    this.targetRotationQuaternion.copy(this.rotationQuaternion);
    
    // Desactivar animación automática mientras el usuario interactúa
    this.isAnimating = false;
    
    // Reiniciar animación después de una pausa en la interacción
    clearTimeout(this.animationTimeout);
    this.animationTimeout = setTimeout(() => {
        this.isAnimating = true;
    }, 5000); // Tiempo antes de reanudar la animación automática
}

    
    /**
     * Clean up and destroy resources
     */
    destroy() {
        // Remove from scene
        if (this.container.parent) {
            this.container.parent.remove(this.container);
        }

        if (this.inertiaInterval) {
            clearInterval(this.inertiaInterval);
            this.inertiaInterval = null;
        }

        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = null;
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