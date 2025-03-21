/**
 * Main Experience class - Updated version for Laqueno
 * Manages the entire 3D experience including renderer, camera, scenes, and UI
 */

import * as THREE from 'three';
import { Renderer } from './Renderer.js';
import { Camera } from './Camera.js';
import { Sizes } from './Sizes.js';
import { Time } from './Time.js';
import { Resources } from './Resources.js';
import { World } from '../scenes/World.js';
import { UI } from '../components/UI.js';
import { Controls } from './Controls.js';

export class Experience {
    constructor(canvas, loadingCallback) {
        // Singleton pattern
        if (Experience.instance) {
            return Experience.instance;
        }
        Experience.instance = this;
        
        // Setup
        this.canvas = canvas;
        this.loadingCallback = loadingCallback || (() => {});
        this.debug = window.location.hash === '#debug';
        
        // Event emitter setup
        this.callbacks = {};
        
        // Create the scene FIRST - before any components that depend on it
        this.scene = new THREE.Scene();
        console.log('Scene created');
        
        // Set the scene background color to match Laqueno theme
        this.scene.background = new THREE.Color('#1a1b12');
        
        // Initialize components
        this.sizes = new Sizes();
        this.time = new Time();
        this.resources = new Resources(this.loadingCallback);
        this.camera = new Camera(this);
        this.renderer = new Renderer(this);
        this.controls = new Controls(this);
        this.world = new World(this);
        this.ui = new UI(this);
        
        // Handle resize event
        this.sizes.on('resize', () => {
            this.resize();
        });
        
        // Handle tick event
        this.time.on('tick', () => {
            this.update();
        });
        
        // Setup world/UI connections
        this.setupEventHandlers();
        
        // Load resources
        this.loadResources();
        
        console.log('Experience initialized with:', {
            hasScene: !!this.scene,
            hasCamera: !!this.camera,
            hasCameraInstance: this.camera && !!this.camera.instance,
            hasRenderer: !!this.renderer,
            hasWorld: !!this.world
        });
    }
    
    /**
     * Setup event handlers between components
     */
    setupEventHandlers() {
        // Resources ready event
        this.resources.on('ready', () => {
            console.log('Resources loaded, emitting ready');
            this.emit('ready');
        });

        // World ready event - set controls
        this.on('worldReady', () => {
            console.log('World ready, configuring controls...');
            if (this.controls && this.world) {
                // Configure controls with total number of artworks
                this.controls.setTotalItems(this.world.items.length);
                console.log(`Controls configured with ${this.world.items.length} items`);
            }
        });
    }
    
    /**
     * Load all required resources
     */
    loadResources() {
        // Define resources to load (only GLB models now)
        const resources = [
            { name: 'obj', type: 'glb', path: 'public/models/obra.glb' },
            { name: 'obj2', type: 'glb', path: 'public/models/obra2.glb' },
            { name: 'lamina1', type: 'glb', path: 'public/models/lamina1.glb' },
            { name: 'about-model', type: 'glb', path: 'public/models/about.glb' }

        ];
        
        // Start loading
        this.resources.load(resources);
    }
    
    /**
     * Handle window resize
     */
    resize() {
        this.camera.resize();
        this.renderer.resize();
        this.world.resize();
        this.ui.resize();
    }
    
    /**
     * Update on each frame
     */
    update() {
        this.camera.update();
        this.world.update();
        this.renderer.update();
        this.controls.update();
        this.ui.update();
    }
    
    /**
     * Clean up and destroy experience
     */
    destroy() {
        // Stop animation loop
        this.time.stop();
        
        // Dispose of Three.js objects
        this.world.destroy();
        this.renderer.destroy();
        
        // Remove event listeners
        this.sizes.off('resize');
        this.time.off('tick');
        
        // Remove canvas
        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        // Clear singleton instance
        Experience.instance = null;
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