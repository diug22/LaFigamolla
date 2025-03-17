/**
 * Resources class
 * Handles loading of all 3D model resources
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

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
        // Setup GLTF/GLB loader
        const gltfLoader = new GLTFLoader();
        
        // Setup DRACO decoder for compressed models
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
        gltfLoader.setDRACOLoader(dracoLoader);
        
        this.loaders = {
            gltfLoader: gltfLoader
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
            
            // Only handle GLB/GLTF files now
            if (resource.type === 'glb' || resource.type === 'gltf') {
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
            } else {
                console.warn(`Unsupported resource type: ${resource.type}`);
                this.itemError(resource, new Error(`Unsupported resource type: ${resource.type}`));
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
        
        // Process GLB models
        if (resource.type === 'gltf' || resource.type === 'glb') {
            // Process models for better quality and performance
            file.scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Improve material quality
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
        
        // Create fallback for GLB models
        this.createFallbackModel(resource);
        
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
     * Create a fallback model when loading fails
     */
    createFallbackModel(resource) {
        console.log(`Creating fallback model for ${resource.name}`);
        
        // Create a simple cube as fallback
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        
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