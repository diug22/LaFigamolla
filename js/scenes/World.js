/**
 * World class - Updated for Laqueno
 * Manages the 3D world and all artwork objects
 */

import * as THREE from 'three';
import { ArtworkItem } from './ArtworkItem.js';
import { AmbienceParticles } from '../components/AmbienceParticles.js';

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
                    if (this.ambienceParticles) {
                        this.ambienceParticles.animateParticlesForHorizontalNavigation(direction);
                    }
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
        
        // Inicializar el sistema de partículas ambientales
        this.ambienceParticles = new AmbienceParticles(this.scene, this.experience, {
            // Aquí puedes configurar las opciones personalizadas
            minConstellations: this.experience.sizes.isMobile ? 50 : 50,
            maxConstellations: this.experience.sizes.isMobile ? 50 : 50,
            globalZPosition: -80,
            positionX: { min: -60, max: 60 },
            positionY: { min: -40, max: 40 },
            positionZ: { min: -20, max: -10 },
            backgroundPlane: {
                enabled: true,
                width: 120,
                height: 80,
                color: 0x1a1a1a,
                opacity: 0.5,
                zPosition: -45
            }
        });
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
        if (this.ambienceParticles) {
            this.ambienceParticles.animateParticlesForHorizontalNavigation(direction);
        }
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
        
        // Update ambience particles
        if (this.ambienceParticles) {
            this.ambienceParticles.update();
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
        
        // Destroy ambience particles
        if (this.ambienceParticles) {
            this.ambienceParticles.destroy();
            this.ambienceParticles = null;
        }
        
        // Clear arrays
        this.items = [];
    }
}