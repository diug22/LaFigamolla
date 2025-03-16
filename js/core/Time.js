/**
 * Time class
 * Handles the animation loop and time-related functionality
 */

export class Time {
    constructor() {
        // Setup
        this.start = Date.now();
        this.current = this.start;
        this.elapsed = 0;
        this.delta = 16; // Default to 60fps
        this.playing = true;
        
        // Event emitter setup
        this.callbacks = {};
        
        // Start the animation loop
        this.tick();
    }
    
    /**
     * Animation loop
     */
    tick() {
        if (!this.playing) return;
        
        // Calculate time
        const currentTime = Date.now();
        this.delta = currentTime - this.current;
        this.current = currentTime;
        this.elapsed = this.current - this.start;
        
        // Call tick event
        this.emit('tick');
        
        // Request next frame
        window.requestAnimationFrame(() => this.tick());
    }
    
    /**
     * Stop the animation loop
     */
    stop() {
        this.playing = false;
    }
    
    /**
     * Resume the animation loop
     */
    resume() {
        if (!this.playing) {
            this.playing = true;
            this.tick();
        }
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
