/**
 * UI class - Updated version with Laqueno design
 * Handles user interface elements and interactions
 */
import { ContactSystem } from './ContactSystem.js';
import { AboutSystem } from './AboutSystem.js';
import { InfoPanelSystem } from './InfoPanelSystem.js';
import { InfoPanelMobileSystem } from './InfoPanelMobileSystem.js';

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
        
        // Create main UI elements with Laqueno design
        this.createMainUI();
        this.createZoomUI();
        
        // Initialize component systems
        this.contactSystem = new ContactSystem(this.experience);
        this.aboutSystem = new AboutSystem(this.experience);
        
        // Initialize the appropriate info panel system based on device
        if (this.isMobileDevice()) {
            this.infoPanelSystem = new InfoPanelMobileSystem(this.experience);
        } else {
            this.infoPanelSystem = new InfoPanelSystem(this.experience);
        }

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
                    <img src="public/images/logo.png" alt="Planta">
                    <p class="subtitle">Constelaciones de Objetos</p>
                </div>
                <a href="#" class="nav-link about-link">About</a>
            </div>
            
            <div class="footer">
                <a href="#" class="nav-link info-link">Info piezas</a>
                <div class="nav-dots" id="nav-dots"></div>
            </div>
        `;

        document.body.appendChild(uiContainer);
        
        // Store references to new elements
        this.elements.uiContainer = uiContainer;
        this.elements.infoButton = uiContainer.querySelector('.info-link');
        this.elements.contactLink = uiContainer.querySelector('.contact-link');
        this.elements.aboutLink = uiContainer.querySelector('.about-link');
        this.elements.navDots = uiContainer.querySelector('#nav-dots');
        
        // Add Laqueno styles
        this.addStyles();
    }
    
    /**
     * Add Laqueno styles to the document
     */
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
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
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            
            /* Estilo para la imagen del logo */
            .logo-container img {
                height: auto;
                width: 200px; /* Ajusta este valor según el tamaño que necesites */
                margin-bottom: 5px;
                object-fit: contain;
            }

            /* Responsive para dispositivos móviles */
            @media (max-width: 768px) {
                .logo-container img {
                    width: 150px; /* Tamaño reducido para móviles */
                }
                
                .subtitle {
                    font-size: 12px;
                }
            }

            /* Para pantallas muy pequeñas */
            @media (max-width: 380px) {
                .logo-container img {
                    width: 120px;
                }
            }
            
            .title {
                font-family: 'Optima';
                font-weight: 400;
                font-size: 74.28px;
                line-height: 100%;
                letter-spacing: 0%;
                text-align: center;
                color: #EBECCB;
            }
            
            .highlight {
                color: #c1c4b1;
                font-style: italic;
                font-weight: 700;
            }
            
            .subtitle {
                font-size: 26px;
                font-weight: 300;
                color: #a6a995;
            }
            
            .footer {
                padding: 20px 40px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
            }
            
            .nav-dots {
                display: flex;
                gap: 8px;
                pointer-events: auto;
                position: relative;
                transition: transform 0.3s ease;
            }

            .nav-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: rgba(228, 227, 211, 0.3);
                cursor: pointer;
                transition: background-color 0.3s ease, transform 0.3s ease;
                transform: scale(0.6);
            }

            .nav-dot.active {
                background-color: #e4e3d3;
                transform: scale(1.2);
                transform: scale(0.8);
            }

            /* Dot animation for direction changes */
            .nav-dots.slide-right {
                animation: slideRight 0.4s ease-out;
            }

            .nav-dots.slide-left {
                animation: slideLeft 0.4s ease-out;
            }

            @keyframes slideRight {
                0% { transform: translateX(15px); opacity: 0.7; }
                100% { transform: translateX(0); opacity: 1; }
            }

            @keyframes slideLeft {
                0% { transform: translateX(-15px); opacity: 0.7; }
                100% { transform: translateX(0); opacity: 1; }
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
                }
                
                .nav-link {
                    font-size: 16px;
                }
                
                .footer {
                    padding: 15px 20px;
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
                this.infoPanelSystem.toggleInfoPanel();
            });
        }
        
        // Contact link
        if (this.elements.contactLink) {
            this.elements.contactLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.contactSystem.showContactCard();
            });
        }
        
        // About link
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
                this.infoPanelSystem.updateForItem(index);
                this.updateNavDots();
                
                // Hide info panel when changing items
                this.infoPanelSystem.hideInfoPanel();
            });
            
            // Zoom change event
            this.controls.on('zoomChange', (zoomLevel) => {
                this.updateZoomIndicator(zoomLevel);
            });
        }
    }
    
    /**
     * Event handler for info panel visibility changes
     */
    onInfoPanelVisibilityChange(isVisible) {
        // Update info button visibility based on info panel state
        if (this.elements.infoButton) {
            this.elements.infoButton.style.opacity = isVisible ? '0' : '1';
            this.elements.infoButton.style.pointerEvents = isVisible ? 'none' : 'auto';
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
        if (!this.elements.gestureHint) {
            // If gesture hint doesn't exist yet, create it
            const hintElement = document.createElement('div');
            hintElement.className = 'gesture-hint';
            hintElement.id = 'gesture-hint';
            document.body.appendChild(hintElement);
            this.elements.gestureHint = hintElement;
        }
        
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
    updateNavDots(direction) {
        if (!this.elements.navDots || !this.controls) return;
        
        const totalItems = this.controls.totalItems;
        const currentIndex = this.controls.currentIndex;
        
        // Clear existing dots
        this.elements.navDots.innerHTML = '';
        
        // Apply transition class based on direction if provided
        if (direction) {
            this.elements.navDots.classList.remove('slide-left', 'slide-right');
            void this.elements.navDots.offsetWidth; // Force reflow
            this.elements.navDots.classList.add(`slide-${direction}`);
        }
        
        // Always create exactly 3 dots
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'nav-dot';
            
            // The middle dot (i=1) is always active, representing the current item
            if (i === 1) {
                dot.classList.add('active');
            }
            
            // Calculate which item this dot represents
            // For a 3-dot system: [prev, current, next]
            let itemIndex;
            if (i === 0) { // Previous item
                itemIndex = (currentIndex - 1 + totalItems) % totalItems;
            } else if (i === 1) { // Current item
                itemIndex = currentIndex;
            } else { // Next item
                itemIndex = (currentIndex + 1) % totalItems;
            }
            
            // Store item index as data attribute
            dot.dataset.index = itemIndex;
            
            // Add click event
            dot.addEventListener('click', () => {
                if (this.controls) {
                    const clickedIndex = parseInt(dot.dataset.index);
                    
                    // Determine direction based on clicked dot
                    const direction = (i === 0) ? 'left' : 
                                     (i === 2) ? 'right' : null;
                    
                    // Only navigate if clicked dot is not the current one
                    if (clickedIndex !== currentIndex) {
                        this.controls.currentIndex = clickedIndex;
                        this.controls.emit('itemChange', clickedIndex);
                        this.controls.resetCameraView();
                        this.updateNavDots(direction);
                    }
                }
            });
            
            this.elements.navDots.appendChild(dot);
        }
    }
    
    /**
     * Update info panel content for current item (adapter method)
     */
    updateInfoForItem(index) {
        if (this.infoPanelSystem) {
            this.infoPanelSystem.updateForItem(index);
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
     * Detect if the current device is mobile
     */
    isMobileDevice() {
        return (
            window.innerWidth <= 768 || 
            'ontouchstart' in window || 
            navigator.maxTouchPoints > 0 ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        );
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