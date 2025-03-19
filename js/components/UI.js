/**
 * UI class - Updated version with Laqueno design
 * Handles user interface elements and interactions
 */
import { ContactSystem } from './ContactSystem.js';
import { AboutSystem } from './AboutSystem.js';


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
            gestureHint: document.getElementById('gesture-hint')
        };
        
        // UI state
        this.uiVisible = true;
        this.infoPanelVisible = false;
        
        // Create main UI elements with Laqueno design
        this.createMainUI();
        this.createInfoPanel();
        this.createZoomUI();
        
        // Initialize contact system
        this.contactSystem = new ContactSystem(this.experience);
        this.aboutSystem = new AboutSystem(this.experience);


        // Setup event listeners
        this.setupEventListeners();
    }
    
    /**
     * Create main UI elements with Laqueno design
     */
    createMainUI() {
        // Remove existing UI container if present
        const existingUI = document.querySelector('.ui-container');
        if (existingUI) {
            existingUI.remove();
        }
        
        // Create UI container
        const uiContainer = document.createElement('div');
        uiContainer.className = 'ui-container';
        
        // Structure with navigation in corners and logo in center
        uiContainer.innerHTML = `
            <div class="header">
                <a href="#" class="nav-link contact-link">Contact</a>
                <div class="logo-container">
                    <h1 class="title">Laque<span class="highlight">no</span>.</h1>
                    <p class="subtitle">Constelaciones de Objetos</p>
                </div>
                <a href="#" class="nav-link about-link">About</a>
            </div>
            
            <div class="footer">
                <button class="info-button">Info pieza</button>
                <div class="nav-dots" id="nav-dots"></div>
            </div>
        `;
        
        document.body.appendChild(uiContainer);
        
        // Store references to new elements
        this.elements.uiContainer = uiContainer;
        this.elements.infoButton = uiContainer.querySelector('.info-button');
        this.elements.contactLink = uiContainer.querySelector('.contact-link');
        this.elements.aboutLink = uiContainer.querySelector('.about-link');
        this.elements.navDots = uiContainer.querySelector('#nav-dots');
        
        // Add Laqueno styles
        this.addStyles();
    }
    
    /**
     * Create info panel with Laqueno design
     */
    createInfoPanel() {
        // Remove existing panel if present
        const existingPanel = document.getElementById('info-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // Create new info panel
        const infoPanel = document.createElement('div');
        infoPanel.id = 'info-panel';
        infoPanel.className = 'info-panel';
        
        infoPanel.innerHTML = `
            <button class="close-btn" id="close-info">&times;</button>
            <h2 class="info-title" id="info-title">Nombre de la pieza</h2>
            <div class="info-separator"></div>
            <p class="info-description" id="info-description">Descripción detallada de la obra...</p>
            <div class="info-details">
                <p id="info-dimensions" class="info-field">Dimensiones: 30cm x 20cm x 15cm</p>
                <p id="info-material" class="info-field">Material: Cerámica artesanal</p>
                <p id="info-year" class="info-field">Año: 2025</p>
            </div>
        `;
        
        document.body.appendChild(infoPanel);
        
        // Store references to panel elements
        this.elements.infoPanel = infoPanel;
        this.elements.closeInfoBtn = infoPanel.querySelector('.close-btn');
        this.elements.infoTitle = infoPanel.querySelector('#info-title');
        this.elements.infoDescription = infoPanel.querySelector('#info-description');
        this.elements.infoDimensions = infoPanel.querySelector('#info-dimensions');
        this.elements.infoMaterial = infoPanel.querySelector('#info-material');
        this.elements.infoYear = infoPanel.querySelector('#info-year');

        // Auto-close timer reference
        this.infoPanelTimer = null;
    }
    
    /**
     * Add Laqueno styles to the document
     */
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `

        .info-panel {
    position: fixed;
    bottom: 80px; /* Posicionado por encima del botón del carrusel */
    left: 50%;
    transform: translateX(-50%) translateY(100%); /* Centrado horizontal y fuera de pantalla inicialmente */
    width: 90%;
    max-width: 500px; /* Ancho máximo reducido */
    background-color: rgba(43, 46, 31, 0.9);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 25px 30px;
    border-radius: 8px; /* Bordes redondeados */
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); /* Sombra sutil */
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 20;
    max-height: 50vh; /* Altura máxima reducida */
    overflow-y: auto;
}

.info-panel.active {
    transform: translateX(-50%) translateY(0); /* Solo mueve hacia arriba, mantiene centrado */
}

/* Ajustes para el contenido más compacto */
.info-title {
    font-size: 22px;
    margin-bottom: 12px;
}

.info-separator {
    margin-bottom: 15px;
}

.info-description {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 20px;
}

.info-details {
    font-size: 12px;
    line-height: 1.6;
    margin-bottom: 10px;
}

.info-field {
    margin: 5px 0;
}

/* Ajustes para móviles */
@media (max-width: 768px) {
    .info-panel {
        width: 85%;
        padding: 20px;
        bottom: 70px; /* Ligeramente más arriba en móviles */
        max-height: 40vh; /* Altura máxima más reducida en móviles */
    }
    
    .info-title {
        font-size: 18px;
    }
    
    .info-description {
        font-size: 13px;
        margin-bottom: 15px;
    }
}
            /* Laqueno UI styles */
            body {
                background-color: #2b2e1f;
                font-family: 'Segoe UI', sans-serif;
                color: #e4e3d3;
            }
            
            .ui-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10;
                pointer-events: none;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                transition: opacity 0.5s ease;
            }
            
            .header {
                padding: 20px 40px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
            }
            
            .nav-link {
                color: #e4e3d3;
                text-decoration: none;
                font-size: 18px;
                letter-spacing: 1px;
                pointer-events: auto;
                cursor: pointer;
                transition: color 0.3s ease;
            }
            
            .nav-link:hover {
                color: #ffffff;
            }
            
            .logo-container {
                text-align: center;
            }
            
            .title {
                font-size: 48px;
                font-weight: 300;
                letter-spacing: 2px;
                margin-bottom: 5px;
                color: #e4e3d3;
            }
            
            .highlight {
                color: #c1c4b1;
            }
            
            .subtitle {
                font-size: 16px;
                font-weight: 300;
                letter-spacing: 3px;
                color: #a6a995;
            }
            
            .footer {
                padding: 20px 40px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
            }
            
            .info-button {
                background: none;
                border: none;
                color: #e4e3d3;
                font-size: 16px;
                cursor: pointer;
                pointer-events: auto;
                letter-spacing: 1px;
                transition: color 0.3s ease;
                text-transform: lowercase;
            }
            
            .info-button:hover {
                color: #ffffff;
            }
            
            /* Navigation dots */
            .nav-dots {
                display: flex;
                gap: 8px;
                pointer-events: auto;
            }
            
            .nav-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: rgba(228, 227, 211, 0.3);
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            
            .nav-dot.active {
                background-color: #e4e3d3;
            }
            
            /* Info panel */
            .info-panel {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                background-color: rgba(43, 46, 31, 0.9);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                padding: 30px 40px;
                transform: translateY(100%);
                transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                z-index: 20;
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .info-panel.active {
                transform: translateY(0);
            }
            
            .close-btn {
                position: absolute;
                top: 20px;
                right: 40px;
                background: none;
                border: none;
                color: #e4e3d3;
                font-size: 24px;
                cursor: pointer;
            }
            
            .info-title {
                font-size: 24px;
                font-weight: 300;
                letter-spacing: 1px;
                margin-bottom: 15px;
            }
            
            .info-separator {
                width: 40px;
                height: 1px;
                background-color: #a6a995;
                margin-bottom: 15px;
            }
            
            .info-description {
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 30px;
                max-width: 800px;
                color: #c1c4b1;
            }
            
            .info-details {
                font-size: 14px;
                color: #a6a995;
                line-height: 1.8;
            }
            
            /* Zoom indicator */
            .zoom-indicator {
                position: fixed;
                bottom: 20px;
                right: 40px;
                background-color: rgba(43, 46, 31, 0.7);
                color: #e4e3d3;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 14px;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 15;
            }
            
            /* Gesture hint */
            .gesture-hint {
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(43, 46, 31, 0.7);
                color: #e4e3d3;
                padding: 10px 16px;
                border-radius: 4px;
                font-size: 14px;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 15;
            }
            
            .gesture-hint.visible {
                opacity: 1;
            }
            
            /* Mobile adjustments */
            @media (max-width: 768px) {
                .header {
                    padding: 15px 20px;
                }
                
                .title {
                    font-size: 32px;
                }
                
                .subtitle {
                    font-size: 12px;
                    letter-spacing: 2px;
                }
                
                .nav-link {
                    font-size: 16px;
                }
                
                .footer {
                    padding: 15px 20px;
                }
                
                .info-panel {
                    padding: 20px;
                }
                
                .close-btn {
                    right: 20px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Create zoom UI
     */
    createZoomUI() {
        // Create zoom indicator
        const zoomIndicator = document.createElement('div');
        zoomIndicator.className = 'zoom-indicator';
        zoomIndicator.id = 'zoom-indicator';
        document.body.appendChild(zoomIndicator);
        
        this.elements.zoomIndicator = zoomIndicator;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Info button - show/hide info panel
        if (this.elements.infoButton) {
            this.elements.infoButton.addEventListener('click', () => {
                this.toggleInfoPanel();
            });
        }
        
        // Close info panel button
        if (this.elements.closeInfoBtn) {
            this.elements.closeInfoBtn.addEventListener('click', () => {
                this.hideInfoPanel();
            });
        }

        // Reset auto-close timer when interacting with info panel
        if (this.elements.infoPanel) {
            this.elements.infoPanel.addEventListener('mousemove', () => {
                if (this.infoPanelVisible) {
                    this.resetInfoPanelTimer();
                }
            });
            
            this.elements.infoPanel.addEventListener('touchstart', () => {
                if (this.infoPanelVisible) {
                    this.resetInfoPanelTimer();
                }
            });
        }
        
        // Contact link
        if (this.elements.contactLink) {
            this.elements.contactLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.contactSystem.showContactCard();
            });
        }
        
        // About link - now functions as UI toggle (eye icon functionality)
        if (this.elements.aboutLink) {
            this.elements.aboutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.aboutSystem.showAboutCard();
            });
        }
        
        // Listen for control events
        if (this.controls) {
            // Item change event
            this.controls.on('itemChange', (index) => {
                this.updateInfoForItem(index);
                this.updateNavDots();
                
                // Hide info panel when changing items
                this.hideInfoPanel();
            });
            
            // Zoom change event
            this.controls.on('zoomChange', (zoomLevel) => {
                this.updateZoomIndicator(zoomLevel);
            });
        }

        
        
    }
    
    /**
     * Toggle info panel visibility
     */
    toggleInfoPanel() {
        if (this.infoPanelVisible) {
            this.hideInfoPanel();
        } else {
            this.showInfoPanel();
        }
    }
    
    /**
     * Show info panel
     */
    showInfoPanel() {
        if (this.elements.infoPanel) {
            this.elements.infoPanel.classList.add('active');
            this.infoPanelVisible = true;
            
            // Ensure "Info pieza" button is hidden when panel is showing
            if (this.elements.infoButton) {
                this.elements.infoButton.style.opacity = '0';
                this.elements.infoButton.style.pointerEvents = 'none';
            }
        }
        this.resetInfoPanelTimer();
    }
    
    resetInfoPanelTimer() {
        // Clear any existing timer
        if (this.infoPanelTimer) {
            clearTimeout(this.infoPanelTimer);
        }
        
        // Set new timer for 10 seconds
        this.infoPanelTimer = setTimeout(() => {
            this.hideInfoPanel();
        }, 10000);
    }
    /**
     * Hide info panel
     */
    hideInfoPanel() {
        if (this.elements.infoPanel) {
            this.elements.infoPanel.classList.remove('active');
            this.infoPanelVisible = false;
            
            // Make "Info pieza" button visible again
            if (this.elements.infoButton) {
                this.elements.infoButton.style.opacity = '1';
                this.elements.infoButton.style.pointerEvents = 'auto';
            }
            
            // Clear auto-close timer
            if (this.infoPanelTimer) {
                clearTimeout(this.infoPanelTimer);
                this.infoPanelTimer = null;
            }
        }
    }
    
    /**
     * Toggle UI elements visibility (triggered by About/eye icon)
     */
    toggleUIElements() {
        if (this.uiVisible) {
            this.hideUIElements();
        } else {
            this.showUIElements();
        }
    }
    
    /**
     * Show UI elements
     */
    showUIElements() {
        if (this.elements.uiContainer) {
            this.elements.uiContainer.style.opacity = '1';
        }
        this.uiVisible = true;
    }
    
    /**
     * Hide UI elements
     */
    hideUIElements() {
        if (this.elements.uiContainer) {
            this.elements.uiContainer.style.opacity = '0';
        }
        this.uiVisible = false;
    }
    
    /**
     * Update zoom indicator
     */
    updateZoomIndicator(zoomLevel) {
        if (!this.elements.zoomIndicator) return;
        
        const zoomPercent = Math.round(zoomLevel * 100);
        this.elements.zoomIndicator.textContent = `Zoom: ${zoomPercent}%`;
        this.elements.zoomIndicator.style.opacity = '1';
        
        clearTimeout(this.zoomTimeout);
        this.zoomTimeout = setTimeout(() => {
            this.elements.zoomIndicator.style.opacity = '0';
        }, 1500);
    }
    
    /**
     * Show gesture hint
     */
    showGestureHint(text) {
        if (!this.elements.gestureHint) return;
        
        this.elements.gestureHint.textContent = text;
        this.elements.gestureHint.classList.add('visible');
        
        clearTimeout(this.gestureTimeout);
        this.gestureTimeout = setTimeout(() => {
            this.elements.gestureHint.classList.remove('visible');
        }, 2000);
    }
    
    /**
     * Update navigation dots
     */
    updateNavDots() {
        if (!this.elements.navDots || !this.controls) return;
        
        const totalItems = this.controls.totalItems;
        const currentIndex = this.controls.currentIndex;
        
        this.elements.navDots.innerHTML = '';
        
        for (let i = 0; i < totalItems; i++) {
            const dot = document.createElement('div');
            dot.className = 'nav-dot';
            if (i === currentIndex) {
                dot.classList.add('active');
            }
            
            dot.addEventListener('click', () => {
                if (this.controls) {
                    this.controls.currentIndex = i;
                    this.controls.emit('itemChange', i);
                    this.controls.resetCameraView();
                    this.updateNavDots();
                }
            });
            
            this.elements.navDots.appendChild(dot);
        }
    }
    
    /**
     * Update info panel content for current item
     */
    updateInfoForItem(index) {
        if (!this.world || !this.world.items || index >= this.world.items.length) return;
        
        const item = this.world.items[index];
        
        // Set basic fields that should always be present
        if (this.elements.infoTitle) {
            this.elements.infoTitle.textContent = item.title || 'Sin título';
        }
        
        if (this.elements.infoDescription) {
            this.elements.infoDescription.textContent = item.description || 'Sin descripción';
        }
        
        // Set optional fields and hide them if not available
        if (this.elements.infoDimensions) {
            if (item.dimensions) {
                this.elements.infoDimensions.textContent = `Dimensiones: ${item.dimensions}`;
                this.elements.infoDimensions.style.display = 'block';
            } else {
                this.elements.infoDimensions.style.display = 'none';
            }
        }
        
        if (this.elements.infoMaterial) {
            if (item.material) {
                this.elements.infoMaterial.textContent = `Material: ${item.material}`;
                this.elements.infoMaterial.style.display = 'block';
            } else {
                this.elements.infoMaterial.style.display = 'none';
            }
        }
        
        if (this.elements.infoYear) {
            if (item.year) {
                this.elements.infoYear.textContent = `Año: ${item.year}`;
                this.elements.infoYear.style.display = 'block';
            } else {
                this.elements.infoYear.style.display = 'none';
            }
        }
    }
    
    /**
     * Update loading progress
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
     * Resize handler
     */
    resize() {
        // Adjust UI elements for different screen sizes
        if (this.sizes.isMobile) {
            document.body.classList.add('mobile');
        } else {
            document.body.classList.remove('mobile');
        }
    }
    
    /**
     * Update on each frame
     */
    update() {
        if (this.aboutSystem && typeof this.aboutSystem.update === 'function') {
            this.aboutSystem.update();
        }
    }
}