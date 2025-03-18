/**
 * Main entry point for Laqueno portfolio
 * This file initializes the 3D experience and handles the loading process
 */

import { Experience } from './core/Experience.js';

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', () => {
    // Get UI elements
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingBar = document.getElementById('loading-bar');
    const loadingText = document.getElementById('loading-text');
    
    // Remove instructions element if it exists
    const instructions = document.getElementById('instructions');
    if (instructions) {
        instructions.style.display = 'none';
    }
    
    // Update loading progress
    const updateLoading = (progress) => {
        const percent = Math.floor(progress * 100);
        loadingBar.style.width = `${percent}%`;
        loadingText.textContent = `Cargando experiencia... ${percent}%`;
        
        // For debugging - log progress
        console.log(`Loading progress: ${percent}%`);
        
        // If loading is complete, start the experience after minimum display time
        if (percent >= 100) {
            if (Date.now() - startTime >= minDisplayTime) {
                startExperience();
            } else {
                // If minimum time hasn't elapsed, wait for the remainder
                const remainingTime = minDisplayTime - (Date.now() - startTime);
                setTimeout(startExperience, remainingTime);
            }
        }
    };
    
    // Function to start the experience
    const startExperience = () => {
        // Fade out loading overlay
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            
            // Show gesture hint after a delay
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                
                // Show instructions popup
                const instructionsPopup = document.getElementById('instructions-popup');
                if (instructionsPopup) {
                    instructionsPopup.classList.add('visible');
                    
                    // Setup event listeners for instructions popup
                    const startButton = document.getElementById('start-button');
                    const closeButton = document.getElementById('close-instructions');
                    
                    const hideInstructions = () => {
                        instructionsPopup.classList.remove('visible');
                        
                        // Show gesture hint after instructions are closed
                        setTimeout(() => {
                            const gestureHint = document.getElementById('gesture-hint');
                            if (gestureHint) {
                                gestureHint.classList.add('visible');
                                setTimeout(() => {
                                    gestureHint.classList.remove('visible');
                                }, 3000);
                            }
                        }, 500);
                    };
                    
                    if (startButton) {
                        startButton.addEventListener('click', hideInstructions);
                    }
                    
                    if (closeButton) {
                        closeButton.addEventListener('click', hideInstructions);
                    }
                }
            }, 300);
        }, 300);
    };
    
    // Track when we started loading
    const startTime = Date.now();
    // Minimum time to display loading screen (1.5 seconds in milliseconds)
    const minDisplayTime = 1500;
    
    // Initialize the experience immediately
    const canvas = document.getElementById('experience-canvas');
    // Initialize the 3D experience
    window.experience = new Experience(canvas, updateLoading);
    
    // Show loading overlay
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.opacity = '1';
    loadingBar.style.width = '0%';
    loadingText.textContent = 'Cargando experiencia... 0%';
});