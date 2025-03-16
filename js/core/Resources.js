/**
 * Resources class
 * Handles loading of all resources (textures, models, etc.)
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Resources {
    constructor(loadingCallback) {
        // Setup
        this.loadingCallback = loadingCallback || (() => {});
        this.items = {};
        this.queue = 0;
        this.loaded = 0;
        
        // Event emitter setup
        this.callbacks = {};
        
        // Loaders
        this.loaders = {
            textureLoader: new THREE.TextureLoader(),
            gltfLoader: new GLTFLoader(),
            cubeTextureLoader: new THREE.CubeTextureLoader()
        };
        
        console.log('Resources initialized');
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
                        () => this.itemError(resource)
                    );
                    break;
                    
                case 'cubeTexture':
                    this.loaders.cubeTextureLoader.load(
                        resource.path,
                        (file) => this.itemLoaded(resource, file),
                        () => {},
                        () => this.itemError(resource)
                    );
                    break;
                    
                case 'gltf':
                    this.loaders.gltfLoader.load(
                        resource.path,
                        (file) => this.itemLoaded(resource, file),
                        () => {},
                        () => this.itemError(resource)
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
    itemError(resource) {
        console.error(`Failed to load resource: ${resource.name} (${resource.path})`);
        
        // Create fallback texture if it's a texture resource
        if (resource.type === 'texture') {
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
            
            // Create texture from canvas
            const texture = new THREE.CanvasTexture(canvas);
            
            // Save as if it loaded normally
            this.items[resource.name] = texture;
            
            console.log(`Fallback texture created for ${resource.name}`);
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