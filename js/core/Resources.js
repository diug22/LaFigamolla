/**
 * Resources class
 * Handles loading of all resources (textures, models, etc.)
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'; // Add DRACOLoader for compressed models

export class Resources {
    constructor(loadingCallback) {
        // Setup
        this.loadingCallback = loadingCallback || (() => {});
        this.items = {};
        this.queue = 0;
        this.loaded = 0;
        
        // Event emitter setup
        this.callbacks = {};
        
        // Setup loaders
        this.setupLoaders();
        
        console.log('Resources initialized');
    }
    
    /**
     * Setup resource loaders
     */
    setupLoaders() {
        // Basic loaders
        this.loaders = {
            textureLoader: new THREE.TextureLoader(),
            cubeTextureLoader: new THREE.CubeTextureLoader()
        };
        
        // Setup GLTF/GLB loader
        const gltfLoader = new GLTFLoader();
        
        // Optional: Setup DRACO decoder for compressed models
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/'); // Use CDN path
        gltfLoader.setDRACOLoader(dracoLoader);
        
        this.loaders.gltfLoader = gltfLoader;
    }
    
    /**
     * Load all resources
     * @param {Array} resources - Array of resource objects to load
     */
    load(resources = []) {
        // Save resources
        this.resources = resources;
        this.queue = resources.length;
        this.loaded = 0;
        
        console.log(`Starting to load ${this.queue} resources`);
        
        // If no resources, emit ready immediately
        if (this.queue === 0) {
            console.log('No resources to load, emitting ready');
            this.emit('ready');
            return;
        }
        
        // Load each resource
        for (const resource of resources) {
            console.log(`Loading resource: ${resource.name} (${resource.path})`);
            
            switch (resource.type) {
                case 'texture':
                    this.loaders.textureLoader.load(
                        resource.path,
                        (file) => this.itemLoaded(resource, file),
                        () => {},
                        (error) => this.itemError(resource, error)
                    );
                    break;
                    
                case 'cubeTexture':
                    this.loaders.cubeTextureLoader.load(
                        resource.path,
                        (file) => this.itemLoaded(resource, file),
                        () => {},
                        (error) => this.itemError(resource, error)
                    );
                    break;
                    
                case 'gltf':
                case 'glb':
                    this.loaders.gltfLoader.load(
                        resource.path,
                        (file) => this.itemLoaded(resource, file),
                        (xhr) => {
                            // Progress callback
                            const percentComplete = xhr.loaded / xhr.total;
                            console.log(`${resource.name} loading: ${Math.round(percentComplete * 100)}%`);
                        },
                        (error) => this.itemError(resource, error)
                    );
                    break;
                    
                default:
                    console.warn(`Unknown resource type: ${resource.type}`);
                    this.itemError(resource);
                    break;
            }
        }
    }
    
    /**
     * Called when a resource is loaded successfully
     */
    itemLoaded(resource, file) {
        // Save resource
        this.items[resource.name] = file;
        this.loaded++;
        
        console.log(`Resource loaded successfully: ${resource.name} (${this.loaded}/${this.queue})`);
        
        // Apply adjustments to GLB models if needed
        if (resource.type === 'gltf' || resource.type === 'glb') {
            // Optional processing for models
            file.scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Improve material quality if needed
                    if (child.material) {
                        child.material.roughness = 0.7;
                        child.material.metalness = 0.2;
                    }
                }
            });
            
            // Apply scale if provided in resource data
            if (resource.modelScale) {
                file.scene.scale.set(
                    resource.modelScale,
                    resource.modelScale,
                    resource.modelScale
                );
            }
        }
        
        // Update loading progress
        const progress = this.loaded / this.queue;
        this.loadingCallback(progress);
        
        // Check if all resources are loaded
        if (this.loaded === this.queue) {
            console.log('All resources loaded successfully, emitting ready');
            this.emit('ready');
        }
    }
    
    /**
     * Called when a resource fails to load
     */
    itemError(resource, error) {
        console.error(`Failed to load resource: ${resource.name} (${resource.path})`, error);
        
        // Create fallback based on resource type
        if (resource.type === 'texture') {
            this.createFallbackTexture(resource);
        } else if (resource.type === 'gltf' || resource.type === 'glb') {
            this.createFallbackModel(resource);
        }
        
        this.loaded++;
        
        console.log(`Resource error handled: ${resource.name} (${this.loaded}/${this.queue})`);
        
        // Update loading progress
        const progress = this.loaded / this.queue;
        this.loadingCallback(progress);
        
        // Check if all resources are loaded
        if (this.loaded === this.queue) {
            console.log('All resources processed (some with errors). Emitting ready event.');
            this.emit('ready');
        }
    }
    
    /**
     * Create a fallback texture
     */
    createFallbackTexture(resource) {
        console.log(`Creating fallback texture for ${resource.name}`);
        
        // Create a canvas for the texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Fill with a color based on the resource name to make them distinguishable
        let color;
        switch(resource.name) {
            case 'ceramic1':
                color = '#B87333'; // Copper/ceramic color
                break;
            case 'frame0':
                color = '#FFD700'; // Gold
                break;
            case 'frame5':
                color = '#C0C0C0'; // Silver
                break;
            case 'frame10':
                color = '#CD7F32'; // Bronze
                break;
            case 'frame15':
                color = '#E5E4E2'; // Platinum
                break;
            case 'frame20':
                color = '#702963'; // Purple
                break;
            case 'frame25':
                color = '#228B22'; // Forest Green
                break;
            case 'frame30':
                color = '#4169E1'; // Royal Blue
                break;
            default:
                color = '#FF5733'; // Default orange
        }
        
        // Fill background
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add texture name
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(resource.name, canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('FALLBACK', canvas.width / 2, canvas.height / 2 + 48);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Save as if it loaded normally
        this.items[resource.name] = texture;
    }
    
    /**
     * Create a fallback model
     */
    createFallbackModel(resource) {
        console.log(`Creating fallback model for ${resource.name}`);
        
        // Create a simple geometry to represent the missing model
        let geometry;
        
        // Choose geometry based on resource name if possible
        if (resource.name.includes('vase')) {
            // Create a simple vase-like shape
            const points = [];
            for (let i = 0; i < 10; i++) {
                const y = i / 10 * 2;
                const radius = 0.5 + Math.sin(i / 10 * Math.PI) * 0.3;
                points.push(new THREE.Vector2(radius, y));
            }
            geometry = new THREE.LatheGeometry(points, 16);
        } else if (resource.name.includes('bowl')) {
            // Create a simple bowl shape
            const points = [];
            for (let i = 0; i < 5; i++) {
                const y = i / 5;
                const radius = 1 - Math.pow(1 - i / 5, 2);
                points.push(new THREE.Vector2(radius, y));
            }
            geometry = new THREE.LatheGeometry(points, 16);
        } else {
            // Default to a cube
            geometry = new THREE.BoxGeometry(1, 1, 1);
        }
        
        // Create material
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xFF5533,
            wireframe: true,
            roughness: 0.7,
            metalness: 0.0
        });
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Create scene to match GLTF structure
        const scene = new THREE.Scene();
        scene.add(mesh);
        
        // Create object that mimics GLTF structure
        const fallbackModel = {
            scene: scene,
            animations: [],
            cameras: [],
            asset: { generator: 'Fallback Model Generator' }
        };
        
        // Save as if it loaded normally
        this.items[resource.name] = fallbackModel;
    }
    
    /**
     * Get a loaded resource by name
     */
    getItem(name) {
        if (!this.items[name]) {
            console.warn(`Resource not found: ${name}`);
            return null;
        }
        
        return this.items[name];
    }
    
    /**
     * Event emitter methods
     */
    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
        
        return this;
    }
    
    off(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
        }
        
        return this;
    }
    
    emit(event, ...args) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(...args));
        }
        
        return this;
    }
}