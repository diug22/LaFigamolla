/**
 * Main Experience class
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
        
        // Initialize components
        this.sizes = new Sizes();
        this.time = new Time();
        this.resources = new Resources(this.loadingCallback);
        this.camera = new Camera(this);
        this.renderer = new Renderer(this);
        this.world = new World(this);
        this.ui = new UI(this);
        this.controls = new Controls(this);
        
        // Handle resize event
        this.sizes.on('resize', () => {
            this.resize();
        });
        
        // Handle tick event
        this.time.on('tick', () => {
            this.update();
        });
        
        // Load resources
        this.resources.on('ready', () => {
            console.log('Resources loaded, emitting ready');
            this.emit('ready');
        });
        
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
     * Load all required resources
     */
    loadResources() {
        // Define resources to load
        const resources = [
            // Textures
            { name: 'ceramic1', type: 'texture', path: './images/img.jpeg' },
            
            // Video frames (for animation)
            { name: 'frame0', type: 'texture', path: './frames/frame_00000.jpg' },
            { name: 'frame5', type: 'texture', path: './frames/frame_00005.jpg' },
            { name: 'frame10', type: 'texture', path: './frames/frame_00010.jpg' },
            { name: 'frame15', type: 'texture', path: './frames/frame_00015.jpg' },
            { name: 'frame20', type: 'texture', path: './frames/frame_00020.jpg' },
            { name: 'frame25', type: 'texture', path: './frames/frame_00025.jpg' },
            { name: 'frame30', type: 'texture', path: './frames/frame_00030.jpg' },
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
    }
    
    /**
     * Update on each frame
     */
    update() {
        this.camera.update();
        this.world.update();
        this.renderer.update();
        this.controls.update();
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