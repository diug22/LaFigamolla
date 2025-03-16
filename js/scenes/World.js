/**
 * World class
 * Manages the 3D world and all artwork objects
 */

import * as THREE from 'three';
import { ArtworkItem } from './ArtworkItem.js';

export class World {
    constructor(experience) {
        this.experience = experience;
        
        // Use the scene from Experience instead of creating a new one
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
                this.controls.setTotalItems(this.items.length);
                
                // Listen for item change events
                this.controls.on('itemChange', (index) => {
                    this.showItem(index);
                });
            }
        });
    }
    
    /**
     * Setup environment (background, fog, etc.)
     */
    setupEnvironment() {
        // Set background color (autumn-themed)
        this.scene.background = new THREE.Color('#1a1a1a');
        
        // Add subtle fog
        this.scene.fog = new THREE.FogExp2('#1a1a1a', 0.035);
        
        // Create environment group
        this.environment = new THREE.Group();
        this.scene.add(this.environment);
        
        // Add ambient particles
        this.addAmbientParticles();
    }
    
    /**
     * Add ambient particles to the environment
     */
    addAmbientParticles() {
        // Autumn colors
        const colors = [
            new THREE.Color('#FFB178'), // Soft orange
            new THREE.Color('#E78F8E'), // Soft red
            new THREE.Color('#FEEAA7'), // Pale yellow
            new THREE.Color('#D4A373'), // Soft brown
            new THREE.Color('#A8DADC')  // Pastel green
        ];
        
        // Create particles
        const particleCount = this.experience.sizes.isMobile ? 50 : 100;
        const particles = new THREE.Group();
        
        // Create different particle geometries
        const geometries = [
            new THREE.TetrahedronGeometry(0.2),
            new THREE.IcosahedronGeometry(0.2, 0),
            new THREE.ConeGeometry(0.1, 0.3, 4),
            new THREE.TorusGeometry(0.2, 0.05, 8, 12),
            new THREE.DodecahedronGeometry(0.2)
        ];
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            // Random geometry
            const geometryIndex = Math.floor(Math.random() * geometries.length);
            const geometry = geometries[geometryIndex];
            
            // Random color
            const colorIndex = Math.floor(Math.random() * colors.length);
            const color = colors[colorIndex];
            
            // Create material
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.4 + Math.random() * 0.3,
                wireframe: Math.random() > 0.8
            });
            
            // Create mesh
            const mesh = new THREE.Mesh(geometry, material);
            
            // Random position
            const radius = 10 + Math.random() * 15;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
            mesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
            mesh.position.z = radius * Math.cos(phi);
            
            // Random rotation
            mesh.rotation.x = Math.random() * Math.PI * 2;
            mesh.rotation.y = Math.random() * Math.PI * 2;
            mesh.rotation.z = Math.random() * Math.PI * 2;
            
            // Random scale
            const scale = 0.5 + Math.random() * 1.5;
            mesh.scale.set(scale, scale, scale);
            
            // Add animation properties
            mesh.userData.rotationSpeed = {
                x: (Math.random() - 0.5) * 0.003,
                y: (Math.random() - 0.5) * 0.003,
                z: (Math.random() - 0.5) * 0.003
            };
            
            mesh.userData.movementSpeed = {
                theta: (Math.random() - 0.5) * 0.0005,
                phi: (Math.random() - 0.5) * 0.0005,
                radius: (Math.random() - 0.5) * 0.005
            };
            
            // Add to particles group
            particles.add(mesh);
        }
        
        // Add particles to environment
        this.environment.add(particles);
        this.particles = particles;
    }
    
    /**
     * Setup artwork items
     */
    setupArtworks() {
        // Define artwork items
        const artworkData = [
            {
                name: 'ceramic1',
                title: 'Vasija Otoñal',
                description: 'Cerámica artesanal con esmaltes en tonos tierra y ocre, inspirada en las formas orgánicas de la naturaleza.',
                texture: this.resources.getItem('ceramic1'),
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 1),
                geometry: 'vase'
            },
            {
                name: 'ceramic2',
                title: 'Cuenco Textural',
                description: 'Pieza de cerámica con relieves táctiles que evocan la corteza de los árboles en otoño.',
                texture: this.resources.getItem('frame10'),
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 1),
                geometry: 'bowl'
            },
            {
                name: 'sculpture',
                title: 'Forma Orgánica',
                description: 'Escultura en arcilla refractaria cocida a alta temperatura, inspirada en las formas fluidas de la naturaleza.',
                texture: this.resources.getItem('frame15'),
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 1),
                geometry: 'sculpture'
            },
            {
                name: 'print',
                title: 'Acuarela Otoñal',
                description: 'Técnica mixta sobre papel, capturando la esencia de los bosques en otoño con tonos cálidos y texturas.',
                texture: this.resources.getItem('frame5'),
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 1),
                geometry: 'plane'
            },
            {
                name: 'teaSet',
                title: 'Set de Té Rústico',
                description: 'Conjunto de tazas y tetera en gres con acabado natural y detalles en esmalte brillante.',
                texture: this.resources.getItem('frame20'),
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 1),
                geometry: 'teaSet'
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
     * @param {Number} index - Item index
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
            const item = this.items[index];
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
            for (const particle of this.particles.children) {
                // Rotate particle
                particle.rotation.x += particle.userData.rotationSpeed.x;
                particle.rotation.y += particle.userData.rotationSpeed.y;
                particle.rotation.z += particle.userData.rotationSpeed.z;
                
                // Move particle in spherical coordinates
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
                const maxRadius = 25;
                const minRadius = 5;
                
                if (newRadius > maxRadius || newRadius < minRadius) {
                    particle.userData.movementSpeed.radius *= -1;
                }
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
