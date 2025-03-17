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
        
        console.log('Renderer initializing with:', {
            hasCanvas: !!this.canvas,
            hasScene: !!this.scene,
            hasCamera: !!this.camera
        });
        
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

        //this.instance.setClearColor('#000000');
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));

        // Añadir esta línea para corregir problemas de transparencia
        this.instance.sortObjects = true;

        // Opcional: ajustar la exposición para mejorar la visualización
        this.instance.toneMappingExposure = 1.2;
        
        // Set clear color
        //this.instance.setClearColor('#000000');
        
        console.log('Renderer instance created successfully');
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
            // Add some debugging for the first few frames
            if (!this.renderCount) {
                this.renderCount = 0;
            }
            
            if (this.renderCount < 5) {
                console.log(`Rendering frame ${this.renderCount}`);
                console.log(`Scene has ${this.scene.children.length} children`);
                
                if (this.camera.instance) {
                    console.log(`Camera position:`, 
                        this.camera.instance.position.x.toFixed(2),
                        this.camera.instance.position.y.toFixed(2),
                        this.camera.instance.position.z.toFixed(2)
                    );
                }
                
                // Check if any objects are visible
                let visibleObjects = 0;
                this.scene.traverse((obj) => {
                    if (obj.visible) {
                        visibleObjects++;
                    }
                });
                console.log(`Visible objects: ${visibleObjects}`);
                
                this.renderCount++;
            }
            
            this.instance.render(this.scene, this.camera.instance);
        } else {
            console.error('Cannot render: Missing components');
            console.error({
                hasScene: !!this.scene,
                hasCamera: !!this.camera,
                hasCameraInstance: this.camera && !!this.camera.instance
            });
        }
    }
    
    /**
     * Clean up and destroy renderer
     */
    destroy() {
        this.instance.dispose();
    }
}