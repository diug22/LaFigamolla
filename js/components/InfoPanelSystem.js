/**
 * InfoPanelSystem class
 * Handles the information panel for artwork items
 */

export class InfoPanelSystem {
    constructor(experience) {
        this.experience = experience;
        this.sizes = experience.sizes;
        
        // UI state
        this.infoPanelVisible = false;
        this.infoPanelTimer = null;
        
        // Create elements
        this.createInfoPanel();
        
        // Setup event listeners
        this.setupEventListeners();
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
        this.elements = {
            infoPanel: infoPanel,
            closeInfoBtn: infoPanel.querySelector('.close-btn'),
            infoTitle: infoPanel.querySelector('#info-title'),
            infoDescription: infoPanel.querySelector('#info-description'),
            infoDimensions: infoPanel.querySelector('#info-dimensions'),
            infoMaterial: infoPanel.querySelector('#info-material'),
            infoYear: infoPanel.querySelector('#info-year')
        };

        // Add styles
        this.addStyles();
    }

    /**
     * Add styles for the info panel
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
                background-color: rgba(43, 46, 31, 0.2);
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
                color: #e4e3d3;
            }

            .info-separator {
                width: 40px;
                height: 1px;
                background-color: #a6a995;
                margin-bottom: 15px;
            }

            .info-description {
                font-size: 14px;
                line-height: 1.5;
                margin-bottom: 20px;
                color: #c1c4b1;
            }

            .info-details {
                font-size: 12px;
                line-height: 1.6;
                margin-bottom: 10px;
                color: #a6a995;
            }

            .info-field {
                margin: 5px 0;
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

                .close-btn {
                    right: 20px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Setup event listeners for info panel
     */
    setupEventListeners() {
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
            
            // Notify UI to handle info button visibility
            if (this.experience && this.experience.ui) {
                this.experience.ui.onInfoPanelVisibilityChange(true);
            }
        }
        this.resetInfoPanelTimer();
    }
    
    /**
     * Reset info panel auto-close timer
     */
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
            
            // Notify UI to handle info button visibility
            if (this.experience && this.experience.ui) {
                this.experience.ui.onInfoPanelVisibilityChange(false);
            }
            
            // Clear auto-close timer
            if (this.infoPanelTimer) {
                clearTimeout(this.infoPanelTimer);
                this.infoPanelTimer = null;
            }
        }
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