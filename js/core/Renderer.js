/**
 * Renderer class
 * Handles Three.js renderer setup and rendering
 */

import * as THREE from 'three';

export class Renderer {
    constructor(experience) {
        this.experience = experience;
        this.canvas = this.experience.canvas;
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.camera = this.experience.camera;
        
        // Setup
        this.setInstance();
    }
    
    /**
     * Create the renderer instance
     */
    setInstance() {
        // Create renderer
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        
        // Configure renderer
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
        this.instance.outputColorSpace = THREE.SRGBColorSpace;
        this.instance.useLegacyLights = false;
        this.instance.toneMapping = THREE.ACESFilmicToneMapping;
        this.instance.toneMappingExposure = 1;
        this.instance.shadowMap.enabled = true;
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Set clear color
        this.instance.setClearColor('#000000');
    }
    
    /**
     * Handle window resize
     */
    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
    }
    
    /**
     * Update renderer on each frame
     */
    update() {
        if (this.scene && this.camera && this.camera.instance) {
            this.instance.render(this.scene, this.camera.instance);
        }
    }
    
    /**
     * Clean up and destroy renderer
     */
    destroy() {
        this.instance.dispose();
    }
}
