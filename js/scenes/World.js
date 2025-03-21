
/**
 * World class - Updated for Laqueno
 * Manages the 3D world and all artwork objects
 */

import * as THREE from 'three';
import { ArtworkItem } from './ArtworkItem.js';
import { BackgroundParticles } from '../components/BackgroundParticles.js';
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
        this.scene.background = new THREE.Color('#1a1b12'); // Laqueno theme color
        
        // Add subtle fog
        
        // Create environment group
        this.environment = new THREE.Group();
        this.scene.add(this.environment);
        
        // Inicializar el sistema de partículas ambientales
        this.backgroundParticles = new BackgroundParticles(this.scene, this.experience, {
            particleCount: this.experience.sizes.isMobile ? 30 : 50,
            particleSize: { min: 0.02, max: 0.08 },
            opacity: { min: 0.3, max: 0.6 },
            globalZPosition: 0
        });
        
        // Inicializar el sistema de partículas ambientales (círculos alrededor de obras)
        this.ambienceParticles = new AmbienceParticles(this.scene, this.experience, {
            // Aquí puedes configurar las opciones personalizadas
            minConstellations: this.experience.sizes.isMobile ? 4 : 8,
            maxConstellations: this.experience.sizes.isMobile ? 8 : 12,
            globalZPosition: -2,
            positionX: { min: -10, max: 10 },
            positionY: { min: -5, max: 5 },
            positionZ: { min: -10, max: -5 },
            backgroundPlane: {
                enabled: false,
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
                title: 'Yo',
                description: 'No somos perfectos, lo importante es aceptarnos.',
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
                model: this.resources.getItem('obj5'),
                particleColors: [
                    '#c1c4b1', // Laqueno light
                    '#a6a995', // Laqueno medium
                    '#e4e3d3', // Laqueno cream
                    '#5e634d', // Laqueno dark
                    '#2b2e1f'  // Laqueno background
                ]
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
                model: this.resources.getItem('obj3'),
                particleColors: [
                    '#c1c4b1', // Laqueno light
                    '#a6a995', // Laqueno medium
                    '#e4e3d3', // Laqueno cream
                    '#5e634d', // Laqueno dark
                    '#2b2e1f'  // Laqueno background
                ]
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
                model: this.resources.getItem('obj4'),
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
                model: this.resources.getItem('obj2'),
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
                model: this.resources.getItem('lamina2'),
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
        // Ambient light - softer and slightly warmer
        const ambientLight = new THREE.AmbientLight(0xe4e3d3, 0.7); // Using Laqueno cream color for warmth
        this.scene.add(ambientLight);
        
        // Main directional light - more intense and detailed
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5); // Increased intensity
        mainLight.position.set(5, 7, 5); // Slightly higher position for better coverage
        mainLight.castShadow = true;
        
        // Enhanced shadow configuration
        mainLight.shadow.mapSize.width = 2048; // Increased resolution
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -15; // Wider shadow area
        mainLight.shadow.camera.right = 15;
        mainLight.shadow.camera.top = 15;
        mainLight.shadow.camera.bottom = -15;
        mainLight.shadow.bias = -0.001; // Reduce shadow acne
        
        this.scene.add(mainLight);
        
        // Fill light - softer and more nuanced
        const fillLight = new THREE.DirectionalLight(0xc1c4b1, 0.9); // Laqueno light color, increased intensity
        fillLight.position.set(-5, 4, -3); // Adjusted position for better coverage
        this.scene.add(fillLight);
        
        // Rim light - more subtle and precise
        const rimLight = new THREE.DirectionalLight(0xb2bb5c, 0.6); // Slightly different Laqueno palette color
        rimLight.position.set(0, -6, -4);
        this.scene.add(rimLight);
        
        // Additional soft backlight for depth and detail
        const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
        backLight.position.set(-3, 2, -5);
        this.scene.add(backLight);
        
        // Point light for extra highlight detail
        const highlightLight = new THREE.PointLight(0xffffff, 0.5, 10);
        highlightLight.position.set(3, 5, 3);
        this.scene.add(highlightLight);
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