/**
 * UI class
 * Handles user interface elements and interactions
 */

export class UI {
    constructor(experience) {
        this.experience = experience;
        this.sizes = this.experience.sizes;
        this.controls = this.experience.controls;
        this.world = this.experience.world;

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
        this.createZoomUI();

        
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
    createZoomUI() {
        // Crear contenedor para indicador de zoom
        const zoomIndicator = document.createElement('div');
        zoomIndicator.id = 'zoom-indicator';
        zoomIndicator.className = 'zoom-indicator';
        zoomIndicator.style.position = 'fixed';
        zoomIndicator.style.bottom = '60px';
        zoomIndicator.style.right = '20px';
        zoomIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        zoomIndicator.style.color = 'white';
        zoomIndicator.style.padding = '8px 12px';
        zoomIndicator.style.borderRadius = '20px';
        zoomIndicator.style.fontSize = '14px';
        zoomIndicator.style.opacity = '0';
        zoomIndicator.style.transition = 'opacity 0.3s ease';
        zoomIndicator.style.zIndex = '100';
        zoomIndicator.style.display = 'flex';
        zoomIndicator.style.alignItems = 'center';
        zoomIndicator.style.justifyContent = 'center';
        zoomIndicator.style.backdropFilter = 'blur(4px)';
        zoomIndicator.style.fontFamily = 'Arial, sans-serif';
        zoomIndicator.style.userSelect = 'none';
        zoomIndicator.style.pointerEvents = 'none'; // No intercepta eventos
        
        // Añadir icono de zoom
        const zoomIcon = document.createElement('span');
        zoomIcon.innerHTML = '🔍';
        zoomIcon.style.marginRight = '5px';
        zoomIcon.style.fontSize = '16px';
        
        // Añadir texto para el nivel de zoom
        const zoomText = document.createElement('span');
        zoomText.id = 'zoom-level-text';
        zoomText.textContent = '100%';
        
        // Estructura del indicador
        zoomIndicator.appendChild(zoomIcon);
        zoomIndicator.appendChild(zoomText);
        
        // Añadir al DOM
        document.body.appendChild(zoomIndicator);
        
        // Guardar referencia
        this.elements.zoomIndicator = zoomIndicator;
        this.elements.zoomText = zoomText;
        
        // Crear tutorial visual para el zoom (aparece solo la primera vez)
        this.createZoomTutorial();
    }
    
    // Crear tutorial visual para el zoom
    createZoomTutorial() {
        // Crear contenedor del tutorial
        const tutorial = document.createElement('div');
        tutorial.id = 'zoom-tutorial';
        tutorial.className = 'zoom-tutorial';
        tutorial.style.position = 'fixed';
        tutorial.style.top = '0';
        tutorial.style.left = '0';
        tutorial.style.width = '100%';
        tutorial.style.height = '100%';
        tutorial.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        tutorial.style.color = 'white';
        tutorial.style.display = 'flex';
        tutorial.style.flexDirection = 'column';
        tutorial.style.alignItems = 'center';
        tutorial.style.justifyContent = 'center';
        tutorial.style.zIndex = '1000';
        tutorial.style.opacity = '0';
        tutorial.style.pointerEvents = 'none'; // No intercepta eventos inicialmente
        tutorial.style.transition = 'opacity 0.5s ease';
        
        // Crear contenido específico dependiendo de si es móvil o escritorio
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isMobile) {
            // Tutorial para móvil
            tutorial.innerHTML = `
                <div style="text-align: center; max-width: 80%;">
                    <h2 style="margin-bottom: 20px;">Gestos de zoom</h2>
                    <div style="display: flex; justify-content: center; margin-bottom: 20px;">
                        <div style="text-align: center; margin: 10px;">
                            <div style="font-size: 40px; margin-bottom: 10px;">👆👆</div>
                            <p>Doble tap para<br>hacer zoom</p>
                        </div>
                        <div style="text-align: center; margin: 10px;">
                            <div style="font-size: 40px; margin-bottom: 10px;">👌</div>
                            <p>Pellizca para<br>ampliar o reducir</p>
                        </div>
                    </div>
                    <p>Prueba ahora estos gestos para interactuar con los modelos 3D</p>
                    <button id="tutorial-close" style="margin-top: 20px; padding: 10px 20px; border: none; background: #fff; color: #000; border-radius: 20px; cursor: pointer;">Entendido</button>
                </div>
            `;
        } else {
            // Tutorial para escritorio
            tutorial.innerHTML = `
                <div style="text-align: center; max-width: 80%;">
                    <h2 style="margin-bottom: 20px;">Controles de zoom</h2>
                    <div style="display: flex; justify-content: center; margin-bottom: 20px;">
                        <div style="text-align: center; margin: 10px;">
                            <div style="font-size: 40px; margin-bottom: 10px;">🖱️</div>
                            <p>Usa la rueda del ratón<br>para hacer zoom</p>
                        </div>
                        <div style="text-align: center; margin: 10px;">
                            <div style="font-size: 40px; margin-bottom: 10px;">👆👆</div>
                            <p>Doble click para<br>ampliar un objeto</p>
                        </div>
                    </div>
                    <p>Prueba ahora estos controles para interactuar con los modelos 3D</p>
                    <button id="tutorial-close" style="margin-top: 20px; padding: 10px 20px; border: none; background: #fff; color: #000; border-radius: 20px; cursor: pointer;">Entendido</button>
                </div>
            `;
        }
        
        // Añadir al DOM
        document.body.appendChild(tutorial);
        
        // Guardar referencia
        this.elements.zoomTutorial = tutorial;
        
        // Configurar botón de cierre
        setTimeout(() => {
            const closeButton = document.getElementById('tutorial-close');
            if (closeButton) {
                tutorial.style.pointerEvents = 'auto'; // Habilitar eventos
                tutorial.style.opacity = '1'; // Mostrar tutorial
                
                closeButton.addEventListener('click', () => {
                    tutorial.style.opacity = '0';
                    setTimeout(() => {
                        tutorial.style.display = 'none';
                    }, 500);
                    
                    // Guardar en localStorage que ya vio el tutorial
                    localStorage.setItem('zoomTutorialSeen', 'true');
                });
            }
        }, 1500); // Mostrar el tutorial después de que se cargue la experiencia
        
        // No mostrar si ya lo ha visto antes
        if (localStorage.getItem('zoomTutorialSeen')) {
            tutorial.style.display = 'none';
        }
    }
    
    // Actualizar indicador de nivel de zoom
    updateZoomIndicator(zoomLevel) {
        if (!this.elements.zoomIndicator || !this.elements.zoomText) return;
        
        // Calcular porcentaje de zoom
        const zoomPercent = Math.round(zoomLevel * 100);
        
        // Actualizar texto
        this.elements.zoomText.textContent = `${zoomPercent}%`;
        
        // Mostrar el indicador
        this.elements.zoomIndicator.style.opacity = '1';
        
        // Ocultar después de un tiempo
        clearTimeout(this.zoomIndicatorTimeout);
        this.zoomIndicatorTimeout = setTimeout(() => {
            this.elements.zoomIndicator.style.opacity = '0';
        }, 1500);
    }
    // Mostrar hint de zoom específico (para rueda de ratón o gestos táctiles)
    showZoomHint() {
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isMobile) {
            this.showGestureHint("Pellizca para hacer zoom");
        } else {
            this.showGestureHint("Usa la rueda del ratón para hacer zoom");
        }
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
                this.showInfoBubble(index);
            });
            
            this.controls.on('hideInfo', () => {
                this.hideInfoBubble();
            });
            this.controls.on('zoomChange', (zoomLevel) => {
                this.updateZoomIndicator(zoomLevel);
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
        if (!this.elements.infoBubble || !this.world || !this.world.items) return;
        
        // Get current item data instead of using hardcoded items
        const currentItem = this.world.items[index];
        if (!currentItem) return;
        
        // Define item info (can be expanded with additional data if needed)
        const item = {
            title: currentItem.title || 'Sin título',
            description: currentItem.description || 'Sin descripción',
            dimensions: 'Modelo 3D',
            material: 'Modelo GLB',
            year: '2025'
        };
        
        // Update bubble content
        this.elements.bubbleTitle.textContent = item.title;
        this.elements.bubbleDescription.textContent = item.description;
        this.elements.bubbleDimensions.textContent = `Dimensiones: ${item.dimensions}`;
        this.elements.bubbleMaterial.textContent = `Material: ${item.material}`;
        this.elements.bubbleYear.textContent = `Año: ${item.year}`;
        
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
            this.elements.infoTitle.textContent = item.title || 'Sin título';
        }
        
        if (this.elements.infoDescription) {
            this.elements.infoDescription.textContent = item.description || 'Sin descripción';
        }
        
        // Update optional fields if they exist
        if (this.elements.infoDimensions) {
            this.elements.infoDimensions.textContent = `Dimensiones: ${item.dimensions || 'Modelo 3D'}`;
        }
        
        if (this.elements.infoMaterial) {
            this.elements.infoMaterial.textContent = `Material: ${item.material || 'Modelo GLB'}`;
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
        // Get the item directly from the World
        if (!this.world || !this.world.items || index >= this.world.items.length) {
            console.warn('No se puede acceder a la información del item:', index);
            return;
        }
        
        // Get the item from the world collection
        const worldItem = this.world.items[index];
        
        // Extract only the needed data (title and description)
        const item = {
            title: worldItem.title,
            description: worldItem.description
        };
        
        // Update info panel with simplified data
        if (this.elements.infoPanel) {
            if (this.elements.infoTitle) {
                this.elements.infoTitle.textContent = item.title || 'Sin título';
            }
            
            if (this.elements.infoDescription) {
                this.elements.infoDescription.textContent = item.description || 'Sin descripción';
            }
            
            // Hide unnecessary elements or show with default values
            if (this.elements.infoDimensions) {
                this.elements.infoDimensions.textContent = 'Dimensiones: Modelo 3D';
            }
            
            if (this.elements.infoMaterial) {
                this.elements.infoMaterial.textContent = 'Material: Modelo GLB';
            }
            
            if (this.elements.infoYear) {
                this.elements.infoYear.textContent = 'Año: 2025';
            }
            
            // Show panel
            this.elements.infoPanel.classList.add('active');
        }
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