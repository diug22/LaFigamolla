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
        
        // If no resources, emit ready immediately
        if (this.queue === 0) {
            this.emit('ready');
            return;
        }
        
        // Load each resource
        for (const resource of resources) {
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
        
        // Update loading progress
        const progress = this.loaded / this.queue;
        this.loadingCallback(progress);
        
        // Check if all resources are loaded
        if (this.loaded === this.queue) {
            this.emit('ready');
        }
    }
    
    /**
     * Called when a resource fails to load
     */
    itemError(resource) {
        console.error(`Failed to load resource: ${resource.name} (${resource.path})`);
        this.loaded++;
        
        // Update loading progress
        const progress = this.loaded / this.queue;
        this.loadingCallback(progress);
        
        // Check if all resources are loaded
        if (this.loaded === this.queue) {
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
