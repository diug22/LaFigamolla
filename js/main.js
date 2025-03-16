/**
 * Main entry point for La Figamolla portfolio
 * This file initializes the experience and handles the loading process
 */

import { Experience } from './core/Experience.js';

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', () => {
    // Create loading manager
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingBar = document.getElementById('loading-bar');
    const loadingText = document.getElementById('loading-text');
    const instructions = document.getElementById('instructions');
    
    // Update loading progress
    const updateLoading = (progress) => {
        const percent = Math.floor(progress * 100);
        loadingBar.style.width = `${percent}%`;
        loadingText.textContent = `Cargando experiencia... ${percent}%`;
        
        // For debugging - log progress
        console.log(`Loading progress: ${percent}%`);
        
        // If loading is complete, show instructions
        if (percent >= 100) {
            setTimeout(() => {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    setTimeout(() => {
                        instructions.style.opacity = '1';
                    }, 100);
                }, 800);
            }, 500);
        }
    };
    
    // Initialize experience when start button is clicked
    document.getElementById('start-experience').addEventListener('click', () => {
        // Hide instructions
        instructions.style.opacity = '0';
        instructions.style.display = 'none';
        setTimeout(() => {
            instructions.style.display = 'none';
            
            // Initialize the experience
            const canvas = document.getElementById('experience-canvas');
            window.experience = new Experience(canvas, updateLoading);
            
            // Show loading overlay while experience initializes
            loadingOverlay.style.display = 'flex';
            loadingOverlay.style.opacity = '1';
            loadingBar.style.width = '0%';
            loadingText.textContent = 'Cargando experiencia... 0%';
            
            // Hide loading overlay when experience is ready
            window.experience.on('ready', () => {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 800);
                
                // Show gesture hint
                setTimeout(() => {
                    document.getElementById('gesture-hint').classList.add('visible');
                    setTimeout(() => {
                        document.getElementById('gesture-hint').classList.remove('visible');
                    }, 3000);
                }, 2000);
            });
        }, 500);
    });
    
    // Setup contact button
    document.getElementById('contact-button').addEventListener('click', () => {
        document.getElementById('contact-panel').classList.add('active');
    });
    
    // Setup close contact button
    document.getElementById('close-contact').addEventListener('click', () => {
        document.getElementById('contact-panel').classList.remove('active');
    });
    
    // Initial setup - show instructions after a short delay
    setTimeout(() => {
        // Simulate initial loading complete
        updateLoading(1);
    }, 1000);
});
