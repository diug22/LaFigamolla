/**
 * InfoPanelMobileSystem class
 * Versión móvil del panel de información para obras de arte
 * Mantiene la funcionalidad anterior para dispositivos móviles
 */

export class InfoPanelMobileSystem {
    constructor(experience) {
        this.experience = experience;
        this.sizes = experience.sizes;
        
        // UI state
        this.infoPanelVisible = false;
        
        // Create elements
        this.createInfoPanel();
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    /**
     * Create info panel with Laqueno design - Versión móvil
     */
    createInfoPanel() {
        // Remove existing panel if present
        const existingPanel = document.getElementById('info-panel-mobile');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // Create new info panel
        const infoPanel = document.createElement('div');
        infoPanel.id = 'info-panel-mobile';
        infoPanel.className = 'info-panel-mobile';
        
        infoPanel.innerHTML = `
            <div class="info-panel-content">
                <h2 class="info-title-mobile" id="info-title-mobile">Nombre de la pieza</h2>
                <div class="info-separator-mobile"></div>
                <p class="info-description-mobile" id="info-description-mobile">Descripción detallada de la obra...</p>
                <div class="info-details-mobile">
                    <p id="info-dimensions-mobile" class="info-field-mobile">Dimensiones: 30cm x 20cm x 15cm</p>
                    <p id="info-material-mobile" class="info-field-mobile">Material: Cerámica artesanal</p>
                    <p id="info-year-mobile" class="info-field-mobile">Año: 2025</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(infoPanel);
        
        // Store references to panel elements
        this.elements = {
            infoPanel: infoPanel,
            infoTitle: infoPanel.querySelector('#info-title-mobile'),
            infoDescription: infoPanel.querySelector('#info-description-mobile'),
            infoDimensions: infoPanel.querySelector('#info-dimensions-mobile'),
            infoMaterial: infoPanel.querySelector('#info-material-mobile'),
            infoYear: infoPanel.querySelector('#info-year-mobile')
        };

        // Add styles
        this.addStyles();
    }

    /**
     * Add styles for the mobile info panel
     */
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .info-panel-mobile {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                background-color: rgba(43, 46, 31, 0.95);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                padding: 20px;
                transform: translateY(100%);
                transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                z-index: 20;
                max-height: 80vh;
                overflow-y: auto;
                border-top-left-radius: 15px;
                border-top-right-radius: 15px;
            }
            
            .info-panel-mobile.active {
                transform: translateY(0);
            }
            
            .info-panel-content {
                padding: 0 10px;
            }
            
            .info-title-mobile {
                font-size: 20px;
                color: #e4e3d3;
                margin-bottom: 12px;
                font-weight: 300;
                letter-spacing: 1px;
            }
            
            .info-separator-mobile {
                width: 40px;
                height: 1px;
                background-color: #a6a995;
                margin-bottom: 15px;
            }
            
            .info-description-mobile {
                font-size: 14px;
                line-height: 1.5;
                margin-bottom: 20px;
                color: #c1c4b1;
            }
            
            .info-details-mobile {
                font-size: 13px;
                line-height: 1.6;
                margin-bottom: 10px;
                color: #a6a995;
            }
            
            .info-field-mobile {
                margin: 5px 0;
            }
            
            @media (min-width: 769px) {
                .info-panel-mobile {
                    display: none; /* Hide on desktop */
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Setup event listeners for info panel
     */
    setupEventListeners() {
        // Tap outside to close
        this.elements.infoPanel.addEventListener('click', (event) => {
            // Close only if clicking directly on the panel background, not its content
            if (event.target === this.elements.infoPanel) {
                this.hideInfoPanel();
            }
        });
        
        // Swipe down to close
        let touchStartY = 0;
        let touchEndY = 0;
        
        this.elements.infoPanel.addEventListener('touchstart', (event) => {
            touchStartY = event.touches[0].clientY;
        }, { passive: true });
        
        this.elements.infoPanel.addEventListener('touchmove', (event) => {
            touchEndY = event.touches[0].clientY;
            
            // If swiping down and panel is visible
            if (touchEndY - touchStartY > 50 && this.infoPanelVisible) {
                this.hideInfoPanel();
            }
        }, { passive: true });
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
        if (this.elements.infoPanel && this.isMobileDevice()) {
            this.elements.infoPanel.classList.add('active');
            this.infoPanelVisible = true;
            
            // Notify UI to handle info button visibility
            if (this.experience && this.experience.ui) {
                this.experience.ui.onInfoPanelVisibilityChange(true);
            }
        }
    }
    
    /**
     * Hide info panel
     */
    hideInfoPanel() {
        if (this.elements.infoPanel) {
            this.elements.infoPanel.classList.remove('active');
            this.infoPanelVisible = false;
            
            // Notify UI to handle info button visibility
            if (this.experience && this.experience.ui) {
                this.experience.ui.onInfoPanelVisibilityChange(false);
            }
        }
    }
    
    /**
     * Check if the current device is mobile
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
     * Update info panel content for current item
     */
    updateForItem(index) {
        if (!this.experience.world || !this.experience.world.items || index >= this.experience.world.items.length) return;
        
        const item = this.experience.world.items[index];
        
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
}