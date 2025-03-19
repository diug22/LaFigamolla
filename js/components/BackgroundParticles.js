/**
 * BackgroundParticles class
 * Maneja partículas de fondo tipo "espuma" distribuidas por toda la pantalla
 */

import * as THREE from 'three';

export class BackgroundParticles {
    constructor(scene, experience, options = {}) {
        this.scene = scene;
        this.experience = experience;
        this.time = experience.time;
        
        // Configuración por defecto
        this.config = {
            // Cantidad de partículas
            particleCount: this.experience.sizes.isMobile ? 30 : 50,
            
            // Posiciones - límites (toda la pantalla)
            positionX: { min: -80, max: 80 },
            positionY: { min: -60, max: 60 },
            positionZ: { min: -20, max: -10 },
            
            // Tamaños
            particleSize: { min: 0.02, max: 0.08 },
            
            // Apariencia
            opacity: { min: 0.3, max: 0.6 },
            
            // Animación 
            pulseSpeed: { min: 0.1, max: 0.3 },
            movementSpeed: { min: 0.0002, max: 0.001 },
            
            // Profundidad Z
            globalZPosition: -50
        };
        
        // Sobrescribir configuración con opciones proporcionadas
        if (options) {
            this.config = {...this.config, ...options};
        }
        
        // Inicializar
        this.init();
    }
    
    /**
     * Inicializar el sistema de partículas
     */
    init() {
        // Crear grupo para contener todas las partículas
        this.particlesGroup = new THREE.Group();
        this.particlesGroup.position.z = this.config.globalZPosition;
        this.scene.add(this.particlesGroup);
        
        // Crear partículas individuales de espuma
        this.createParticles();
    }
    
    /**
     * Crear partículas distribuidas por toda la pantalla
     */
    createParticles() {
        // Material común para todas las partículas
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5
        });
        
        // Geometrías para diferentes tamaños
        const geometries = [
            new THREE.SphereGeometry(this.config.particleSize.min, 4, 4),
            new THREE.SphereGeometry(
                (this.config.particleSize.min + this.config.particleSize.max) / 2, 
                4, 4
            ),
            new THREE.SphereGeometry(this.config.particleSize.max, 4, 4)
        ];
        
        // Crear partículas
        for (let i = 0; i < this.config.particleCount; i++) {
            // Posición aleatoria en toda la pantalla
            const position = new THREE.Vector3(
                this.getRandomInRange(this.config.positionX.min, this.config.positionX.max),
                this.getRandomInRange(this.config.positionY.min, this.config.positionY.max),
                this.getRandomInRange(this.config.positionZ.min, this.config.positionZ.max)
            );
            
            // Geometría aleatoria
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            
            // Material con opacidad aleatoria
            const material = particleMaterial.clone();
            material.opacity = this.getRandomInRange(
                this.config.opacity.min, 
                this.config.opacity.max
            );
            
            // Crear partícula
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            
            // Propiedades de animación
            particle.userData.originalOpacity = material.opacity;
            particle.userData.pulseSpeed = this.getRandomInRange(
                this.config.pulseSpeed.min,
                this.config.pulseSpeed.max
            );
            particle.userData.pulsePhase = Math.random() * Math.PI * 2;
            particle.userData.movementSpeed = {
                x: this.getRandomInRange(-this.config.movementSpeed.max, this.config.movementSpeed.max),
                y: this.getRandomInRange(-this.config.movementSpeed.max, this.config.movementSpeed.max),
                z: 0
            };
            
            // Añadir al grupo
            this.particlesGroup.add(particle);
        }
    }
    
    /**
     * Obtener valor aleatorio en un rango
     */
    getRandomInRange(min, max) {
        return min + Math.random() * (max - min);
    }
    
    /**
     * Actualizar partículas en cada frame
     */
    update() {
        if (!this.particlesGroup) return;
        
        const time = this.time.elapsed / 1000;
        
        // Actualizar cada partícula
        this.particlesGroup.children.forEach(particle => {
            // Efecto de pulsación
            const pulseValue = 0.7 + 0.3 * Math.sin(
                time * particle.userData.pulseSpeed + particle.userData.pulsePhase
            );
            
            // Aplicar opacidad pulsante
            particle.material.opacity = particle.userData.originalOpacity * pulseValue;
            
            // Movimiento sutil
            particle.position.x += particle.userData.movementSpeed.x;
            particle.position.y += particle.userData.movementSpeed.y;
            
            // Mantener partículas dentro de límites
            const limit = {
                x: this.config.positionX.max,
                y: this.config.positionY.max
            };
            
            if (Math.abs(particle.position.x) > limit.x) {
                particle.position.x *= -0.9;
                particle.userData.movementSpeed.x *= -1;
            }
            
            if (Math.abs(particle.position.y) > limit.y) {
                particle.position.y *= -0.9;
                particle.userData.movementSpeed.y *= -1;
            }
        });
    }
    
    /**
     * Limpiar recursos
     */
    destroy() {
        if (this.particlesGroup && this.particlesGroup.parent) {
            this.particlesGroup.parent.remove(this.particlesGroup);
        }
        
        if (this.particlesGroup) {
            this.particlesGroup.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
    }
}