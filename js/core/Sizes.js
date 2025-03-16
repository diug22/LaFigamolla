/**
 * Sizes class
 * Handles window dimensions and resize events
 */

export class Sizes {
    constructor() {
        // Setup
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);
        this.aspectRatio = this.width / this.height;
        this.isMobile = this.width < 768;
        this.isPortrait = this.width < this.height;
        
        // Event emitter setup
        this.callbacks = {};
        
        // Resize event
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.pixelRatio = Math.min(window.devicePixelRatio, 2);
            this.aspectRatio = this.width / this.height;
            this.isMobile = this.width < 768;
            this.isPortrait = this.width < this.height;
            
            this.emit('resize');
        });
        
        // Orientation change event for mobile
        window.addEventListener('orientationchange', () => {
            // Small delay to ensure dimensions are updated
            setTimeout(() => {
                this.width = window.innerWidth;
                this.height = window.innerHeight;
                this.aspectRatio = this.width / this.height;
                this.isPortrait = this.width < this.height;
                
                this.emit('resize');
            }, 100);
        });
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
