/**
 * UI class
 * Handles user interface elements and interactions
 */

export class UI {
    constructor(experience) {
        this.experience = experience;
        this.sizes = this.experience.sizes;
        this.controls = this.experience.controls;
        
        // UI elements
        this.elements = {
            loadingOverlay: document.getElementById('loading-overlay'),
            loadingBar: document.getElementById('loading-bar'),
            loadingText: document.getElementById('loading-text'),
            instructions: document.getElementById('instructions'),
            navDots: document.getElementById('nav-dots'),
            gestureHint: document.getElementById('gesture-hint'),
            infoPanel: document.getElementById('info-panel'),
            infoTitle: document.getElementById('info-title'),
            infoDescription: document.getElementById('info-description'),
            infoDimensions: document.getElementById('info-dimensions'),
            infoMaterial: document.getElementById('info-material'),
            infoYear: document.getElementById('info-year'),
            contactButton: document.getElementById('contact-button'),
            contactPanel: document.getElementById('contact-panel')
        };
        
        // Setup
        this.setupEventListeners();
    }
    
    /**
     * Setup event listeners for UI elements
     */
    setupEventListeners() {
        // Close info panel
        const closeInfoBtn = document.getElementById('close-info');
        if (closeInfoBtn) {
            closeInfoBtn.addEventListener('click', () => {
                this.hideInfoPanel();
            });
        }
        
        // Contact button
        if (this.elements.contactButton) {
            this.elements.contactButton.addEventListener('click', () => {
                this.showContactPanel();
            });
        }
        
        // Close contact panel
        const closeContactBtn = document.getElementById('close-contact');
        if (closeContactBtn) {
            closeContactBtn.addEventListener('click', () => {
                this.hideContactPanel();
            });
        }
        
        // Start experience button
        const startBtn = document.getElementById('start-experience');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.hideInstructions();
            });
        }
        
        // Listen for item change events from controls
        if (this.controls) {
            this.controls.on('itemChange', (index) => {
                this.updateInfoForItem(index);
            });
        }
    }
    
    /**
     * Show loading progress
     * @param {Number} progress - Progress value between 0 and 1
     */
    updateLoading(progress) {
        if (this.elements.loadingBar) {
            const percent = Math.floor(progress * 100);
            this.elements.loadingBar.style.width = `${percent}%`;
        }
        
        if (this.elements.loadingText) {
            const percent = Math.floor(progress * 100);
            this.elements.loadingText.textContent = `Cargando experiencia... ${percent}%`;
        }
    }
    
    /**
     * Hide loading overlay
     */
    hideLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                this.elements.loadingOverlay.style.display = 'none';
            }, 800);
        }
    }
    
    /**
     * Hide instructions
     */
    hideInstructions() {
        if (this.elements.instructions) {
            this.elements.instructions.style.opacity = '0';
            setTimeout(() => {
                this.elements.instructions.style.display = 'none';
            }, 500);
        }
    }
    
    /**
     * Show gesture hint
     * @param {String} text - Optional text to display
     */
    showGestureHint(text) {
        if (this.elements.gestureHint) {
            if (text) {
                this.elements.gestureHint.textContent = text;
            }
            
            this.elements.gestureHint.classList.add('visible');
            
            // Hide after 2 seconds
            setTimeout(() => {
                this.elements.gestureHint.classList.remove('visible');
            }, 2000);
        }
    }
    
    /**
     * Show info panel with artwork details
     * @param {Object} item - Artwork item data
     */
    showInfoPanel(item) {
        if (!this.elements.infoPanel) return;
        
        // Update info panel content
        if (this.elements.infoTitle) {
            this.elements.infoTitle.textContent = item.title || 'Sin título';
        }
        
        if (this.elements.infoDescription) {
            this.elements.infoDescription.textContent = item.description || 'Sin descripción';
        }
        
        if (this.elements.infoDimensions) {
            this.elements.infoDimensions.textContent = `Dimensiones: ${item.dimensions || 'No especificadas'}`;
        }
        
        if (this.elements.infoMaterial) {
            this.elements.infoMaterial.textContent = `Material: ${item.material || 'No especificado'}`;
        }
        
        if (this.elements.infoYear) {
            this.elements.infoYear.textContent = `Año: ${item.year || '2025'}`;
        }
        
        // Show panel
        this.elements.infoPanel.classList.add('active');
    }
    
    /**
     * Hide info panel
     */
    hideInfoPanel() {
        if (this.elements.infoPanel) {
            this.elements.infoPanel.classList.remove('active');
        }
    }
    
    /**
     * Show contact panel
     */
    showContactPanel() {
        if (this.elements.contactPanel) {
            this.elements.contactPanel.classList.add('active');
        }
    }
    
    /**
     * Hide contact panel
     */
    hideContactPanel() {
        if (this.elements.contactPanel) {
            this.elements.contactPanel.classList.remove('active');
        }
    }
    
    /**
     * Update info panel for the current item
     * @param {Number} index - Item index
     */
    updateInfoForItem(index) {
        // This would be populated with actual artwork data from the World class
        const items = [
            {
                title: 'Vasija Otoñal',
                description: 'Cerámica artesanal con esmaltes en tonos tierra y ocre, inspirada en las formas orgánicas de la naturaleza.',
                dimensions: '25cm x 18cm x 10cm',
                material: 'Cerámica artesanal, esmaltes no tóxicos',
                year: '2025'
            },
            {
                title: 'Cuenco Textural',
                description: 'Pieza de cerámica con relieves táctiles que evocan la corteza de los árboles en otoño.',
                dimensions: '15cm x 15cm x 8cm',
                material: 'Gres, esmaltes artesanales',
                year: '2024'
            },
            {
                title: 'Forma Orgánica',
                description: 'Escultura en arcilla refractaria cocida a alta temperatura, inspirada en las formas fluidas de la naturaleza.',
                dimensions: '35cm x 20cm x 15cm',
                material: 'Arcilla refractaria, esmaltes y elementos naturales',
                year: '2025'
            },
            {
                title: 'Acuarela Otoñal',
                description: 'Técnica mixta sobre papel, capturando la esencia de los bosques en otoño con tonos cálidos y texturas.',
                dimensions: '40cm x 30cm (enmarcado)',
                material: 'Papel artesanal 300g, pigmentos naturales',
                year: '2024'
            },
            {
                title: 'Set de Té Rústico',
                description: 'Conjunto de tazas y tetera en gres con acabado natural y detalles en esmalte brillante.',
                dimensions: 'Varias piezas',
                material: 'Gres, esmaltes artesanales',
                year: '2025'
            }
        ];
        
        // Get item data
        const item = items[index] || items[0];
        
        // Update info panel
        this.showInfoPanel(item);
    }
    
    /**
     * Update UI on resize
     */
    resize() {
        // Adjust UI elements for mobile/desktop
        if (this.sizes.isMobile) {
            // Mobile-specific UI adjustments
        } else {
            // Desktop-specific UI adjustments
        }
    }
    
    /**
     * Update UI on each frame
     */
    update() {
        // Any animations or updates needed for UI elements
    }
}
