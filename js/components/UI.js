/**
 * UI class
 * Handles user interface elements and interactions
 */

export class UI {
    constructor(experience) {
        this.experience = experience;
        this.sizes = this.experience.sizes;
        this.controls = this.experience.controls;
        this.world = this.experience.world; // Añadida referencia a world para acceder a los items

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
            contactPanel: document.getElementById('contact-panel'),
            header: document.querySelector('.header'),
            footer: document.querySelector('.footer'),
            uiContainer: document.querySelector('.ui-container')
        };
        
        // Add info bubble element for swipe-up info display
        this.createInfoBubble();
        
        // UI State
        this.uiVisible = true;
        this.infoBubbleVisible = false;
        
        // Setup
        this.setupEventListeners();
        this.createUIToggleButton();
        this.createResetButton();
        this.repositionContactButton();
        
        // Auto-hide UI after a short delay when experience starts
        setTimeout(() => {
            this.hideUIElements();
        }, 1000);
    }
    
    /**
     * Create info bubble element for swipe-up interaction
     */
    createInfoBubble() {
        // Create info bubble container
        const infoBubble = document.createElement('div');
        infoBubble.id = 'info-bubble';
        infoBubble.className = 'info-bubble';
        infoBubble.style.position = 'fixed';
        infoBubble.style.bottom = '-200px'; // Start off-screen
        infoBubble.style.left = '0';
        infoBubble.style.width = '100%';
        infoBubble.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        infoBubble.style.color = 'white';
        infoBubble.style.padding = '20px';
        infoBubble.style.borderTopLeftRadius = '20px';
        infoBubble.style.borderTopRightRadius = '20px';
        infoBubble.style.transition = 'bottom 0.3s ease-out';
        infoBubble.style.zIndex = '90';
        infoBubble.style.backdropFilter = 'blur(10px)';
        infoBubble.style.boxShadow = '0 -4px 20px rgba(0, 0, 0, 0.2)';
        infoBubble.style.display = 'flex';
        infoBubble.style.flexDirection = 'column';
        infoBubble.style.gap = '10px';
        
        // Add content elements to the bubble
        const title = document.createElement('h3');
        title.id = 'bubble-title';
        title.style.margin = '0';
        title.style.fontSize = '20px';
        
        const description = document.createElement('p');
        description.id = 'bubble-description';
        description.style.margin = '5px 0';
        description.style.fontSize = '14px';
        
        const details = document.createElement('div');
        details.style.display = 'flex';
        details.style.flexWrap = 'wrap';
        details.style.gap = '10px';
        details.style.fontSize = '12px';
        details.style.opacity = '0.8';
        
        const dimensions = document.createElement('span');
        dimensions.id = 'bubble-dimensions';
        
        const material = document.createElement('span');
        material.id = 'bubble-material';
        
        const year = document.createElement('span');
        year.id = 'bubble-year';
        
        // Add swipe-up indicator
        const indicator = document.createElement('div');
        indicator.className = 'swipe-indicator';
        indicator.innerHTML = '↑ Swipe up for more details ↑';
        indicator.style.textAlign = 'center';
        indicator.style.marginBottom = '5px';
        indicator.style.fontSize = '12px';
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.color = 'white';
        closeButton.style.fontSize = '20px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', () => this.hideInfoBubble());
        
        // Add elements to bubble
        details.appendChild(dimensions);
        details.appendChild(material);
        details.appendChild(year);
        
        infoBubble.appendChild(closeButton);
        infoBubble.appendChild(indicator);
        infoBubble.appendChild(title);
        infoBubble.appendChild(description);
        infoBubble.appendChild(details);
        
        // Add bubble to document
        document.body.appendChild(infoBubble);
        
        // Store reference
        this.elements.infoBubble = infoBubble;
        this.elements.bubbleTitle = title;
        this.elements.bubbleDescription = description;
        this.elements.bubbleDimensions = dimensions;
        this.elements.bubbleMaterial = material;
        this.elements.bubbleYear = year;
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
        
        // Listen for control events
        if (this.controls) {
            // Item change event
            this.controls.on('itemChange', (index) => {
                this.updateInfoForItem(index);
                this.hideInfoBubble(); // Hide bubble when changing items
            });
            
            // Show/hide info events
            this.controls.on('showInfo', (index) => {
                //this.showInfoBubble(index);
            });
            
            this.controls.on('hideInfo', () => {
                this.hideInfoBubble();
            });
        }
    }
    
    /**
     * Create UI toggle button
     */
    createUIToggleButton() {
        // Create button to show/hide UI
        const toggleButton = document.createElement('button');
        toggleButton.classList.add('ui-toggle-button');
        toggleButton.innerHTML = '👁️';
        toggleButton.title = 'Show/Hide Interface';
        toggleButton.style.position = 'fixed';
        toggleButton.style.top = '20px';
        toggleButton.style.right = '20px';
        toggleButton.style.zIndex = '100';
        toggleButton.style.background = 'rgba(0,0,0,0.5)';
        toggleButton.style.color = 'white';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '50%';
        toggleButton.style.width = '40px';
        toggleButton.style.height = '40px';
        toggleButton.style.display = 'flex';
        toggleButton.style.alignItems = 'center';
        toggleButton.style.justifyContent = 'center';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.transition = 'background-color 0.3s ease';
        toggleButton.style.backdropFilter = 'blur(5px)';
        
        // Add click event
        toggleButton.addEventListener('click', () => {
            this.toggleUIElements();
        });
        
        // Add to document
        document.body.appendChild(toggleButton);
        this.toggleButton = toggleButton;
    }
    
    /**
     * Create reset view button
     */
    createResetButton() {
        // Create reset button
        const resetButton = document.createElement('button');
        resetButton.classList.add('reset-button');
        resetButton.innerHTML = '🔄';
        resetButton.title = 'Reset View';
        resetButton.style.position = 'fixed';
        resetButton.style.bottom = '20px';
        resetButton.style.left = '20px';
        resetButton.style.zIndex = '100';
        resetButton.style.background = 'rgba(0,0,0,0.5)';
        resetButton.style.color = 'white';
        resetButton.style.border = 'none';
        resetButton.style.borderRadius = '50%';
        resetButton.style.width = '40px';
        resetButton.style.height = '40px';
        resetButton.style.display = 'flex';
        resetButton.style.alignItems = 'center';
        resetButton.style.justifyContent = 'center';
        resetButton.style.cursor = 'pointer';
        resetButton.style.transition = 'background-color 0.3s ease';
        resetButton.style.backdropFilter = 'blur(5px)';
        
        // Add click event
        resetButton.addEventListener('click', () => {
            if (this.controls) {
                this.controls.resetCameraView();
            }
        });
        
        // Add to document
        document.body.appendChild(resetButton);
        this.resetButton = resetButton;
    }
    
    /**
     * Reposition contact button to always be on the right
     */
    repositionContactButton() {
        if (this.elements.contactButton) {
            // Reposition contact button to the right
            this.elements.contactButton.style.position = 'fixed';
            this.elements.contactButton.style.bottom = '20px';
            this.elements.contactButton.style.right = '20px';
            this.elements.contactButton.style.left = 'auto'; // Remove left positioning if it exists
            this.elements.contactButton.style.zIndex = '100';
            this.elements.contactButton.style.width = '40px';
            this.elements.contactButton.style.height = '40px';
            this.elements.contactButton.style.borderRadius = '50%';
            this.elements.contactButton.style.display = 'flex';
            this.elements.contactButton.style.alignItems = 'center';
            this.elements.contactButton.style.justifyContent = 'center';
            this.elements.contactButton.style.backdropFilter = 'blur(5px)';
        }
    }
    
    /**
     * Show UI elements (header and footer)
     */
    showUIElements() {
        if (this.elements.header) {
            this.elements.header.style.opacity = '1';
        }
        
        if (this.elements.footer) {
            this.elements.footer.style.opacity = '1';
        }
        
        this.uiVisible = true;
        
        // Update button icon
        if (this.toggleButton) {
            this.toggleButton.innerHTML = '👁️';
        }
    }
    
    /**
     * Hide UI elements (header and footer)
     */
    hideUIElements() {
        if (this.elements.header) {
            this.elements.header.style.opacity = '0';
        }
        
        if (this.elements.footer) {
            this.elements.footer.style.opacity = '0';
        }
        
        this.uiVisible = false;
        
        // Update button icon
        if (this.toggleButton) {
            this.toggleButton.innerHTML = '👁️‍🗨️';
        }
    }
    
    /**
     * Toggle UI elements visibility
     */
    toggleUIElements() {
        if (this.uiVisible) {
            this.hideUIElements();
        } else {
            this.showUIElements();
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
            this.elements.loadingText.textContent = `Loading experience... ${percent}%`;
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
            
            // Clear any previous timeout
            if (this.gestureHintTimeout) {
                clearTimeout(this.gestureHintTimeout);
            }
            
            // Make hint more visible on mobile
            this.elements.gestureHint.style.fontSize = this.sizes.isMobile ? '18px' : '16px';
            this.elements.gestureHint.style.padding = this.sizes.isMobile ? '12px 20px' : '10px 16px';
            this.elements.gestureHint.style.backgroundColor = 'rgba(0,0,0,0.7)';
            
            // Hide after 2 seconds
            this.gestureHintTimeout = setTimeout(() => {
                this.elements.gestureHint.classList.remove('visible');
            }, 2000);
        }
    }
    
    /**
     * Show info bubble for swipe-up gesture
     * @param {Number} index - Item index
     */
    showInfoBubble(index) {
        if (!this.elements.infoBubble) return;
        
        // Update bubble content with item data
        const items = [
            {
                title: 'Autumn Vase',
                description: 'Handcrafted ceramic with earth and ochre glazes, inspired by organic forms of nature.',
                dimensions: '25cm x 18cm x 10cm',
                material: 'Handcrafted ceramic, non-toxic glazes',
                year: '2025'
            },
            {
                title: 'Textural Bowl',
                description: 'Ceramic piece with tactile reliefs evoking tree bark in autumn.',
                dimensions: '15cm x 15cm x 8cm',
                material: 'Stoneware, artisanal glazes',
                year: '2024'
            },
            {
                title: 'Organic Form',
                description: 'Sculpture in high-temperature fired refractory clay, inspired by fluid forms of nature.',
                dimensions: '35cm x 20cm x 15cm',
                material: 'Refractory clay, glazes and natural elements',
                year: '2025'
            },
            {
                title: 'Autumn Watercolor',
                description: 'Mixed technique on paper, capturing the essence of autumn forests with warm tones and textures.',
                dimensions: '40cm x 30cm (framed)',
                material: 'Handcrafted paper 300g, natural pigments',
                year: '2024'
            },
            {
                title: 'Rustic Tea Set',
                description: 'Set of cups and teapot in stoneware with natural finish and glossy glaze details.',
                dimensions: 'Various pieces',
                material: 'Stoneware, artisanal glazes',
                year: '2025'
            }
        ];
        
        // Get item data
        const item = items[index] || items[0];
        
        // Update bubble content
        this.elements.bubbleTitle.textContent = item.title;
        this.elements.bubbleDescription.textContent = item.description;
        this.elements.bubbleDimensions.textContent = `Dimensions: ${item.dimensions}`;
        this.elements.bubbleMaterial.textContent = `Material: ${item.material}`;
        this.elements.bubbleYear.textContent = `Year: ${item.year}`;
        
        // Show bubble with animation
        this.elements.infoBubble.style.bottom = '0';
        this.infoBubbleVisible = true;
    }
    
    /**
     * Hide info bubble
     */
    hideInfoBubble() {
        if (!this.elements.infoBubble) return;
        
        // Hide bubble with animation
        this.elements.infoBubble.style.bottom = '-200px';
        this.infoBubbleVisible = false;
    }
    
    /**
     * Show info panel with artwork details
     * @param {Object} item - Artwork item data
     */
    showInfoPanel(item) {
        if (!this.elements.infoPanel) return;
        
        // Update info panel content
        if (this.elements.infoTitle) {
            this.elements.infoTitle.textContent = item.title || 'Untitled';
        }
        
        if (this.elements.infoDescription) {
            this.elements.infoDescription.textContent = item.description || 'No description';
        }
        
        if (this.elements.infoDimensions) {
            this.elements.infoDimensions.textContent = `Dimensions: ${item.dimensions || 'Not specified'}`;
        }
        
        if (this.elements.infoMaterial) {
            this.elements.infoMaterial.textContent = `Material: ${item.material || 'Not specified'}`;
        }
        
        if (this.elements.infoYear) {
            this.elements.infoYear.textContent = `Year: ${item.year || '2025'}`;
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
        // Obtener el item directamente del World
        if (!this.world || !this.world.items || index >= this.world.items.length) {
            console.warn('No se puede acceder a la información del item:', index);
            return;
        }
        
        // Obtener el item de la colección de world
        const worldItem = this.world.items[index];
        
        // Extraer solo los datos necesarios (título y descripción)
        const item = {
            title: worldItem.title,
            description: worldItem.description
        };
        
        // Actualizar panel de información con datos simplificados
        if (this.elements.infoPanel) {
            if (this.elements.infoTitle) {
                this.elements.infoTitle.textContent = item.title || 'Sin título';
            }
            
            if (this.elements.infoDescription) {
                this.elements.infoDescription.textContent = item.description || 'Sin descripción';
            }
            
            // Ocultar elementos innecesarios
            if (this.elements.infoDimensions) {
                this.elements.infoDimensions.style.display = 'none';
            }
            
            if (this.elements.infoMaterial) {
                this.elements.infoMaterial.style.display = 'none';
            }
            
            if (this.elements.infoYear) {
                this.elements.infoYear.style.display = 'none';
            }
            
            // Mostrar panel
            this.elements.infoPanel.classList.add('active');
        }
    }
    
    /**
     * Update info bubble content without showing it
     * @param {Object} item - Artwork item data
     */
    updateInfoBubbleContent(item) {
        if (!this.elements.infoBubble) return;
        
        this.elements.bubbleTitle.textContent = item.title;
        this.elements.bubbleDescription.textContent = item.description;
        this.elements.bubbleDimensions.textContent = `Dimensions: ${item.dimensions}`;
        this.elements.bubbleMaterial.textContent = `Material: ${item.material}`;
        this.elements.bubbleYear.textContent = `Year: ${item.year}`;
    }
    
    /**
     * Update UI on resize
     */
    resize() {
        // Adjust UI elements for mobile/desktop
        if (this.sizes.isMobile) {
            // Mobile-specific UI adjustments
            if (this.elements.infoBubble) {
                this.elements.infoBubble.style.padding = '15px';
                this.elements.bubbleTitle.style.fontSize = '18px';
                this.elements.bubbleDescription.style.fontSize = '14px';
            }
        } else {
            // Desktop-specific UI adjustments
            if (this.elements.infoBubble) {
                this.elements.infoBubble.style.padding = '20px';
                this.elements.bubbleTitle.style.fontSize = '20px';
                this.elements.bubbleDescription.style.fontSize = '16px';
            }
        }
    }
    
    /**
     * Update UI on each frame
     */
    update() {
        // Any animations or updates needed for UI elements
    }
}