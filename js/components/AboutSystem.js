/**
 * About System - For Laqueno
 * Handles about section UI and interactions with background image
 */

export class AboutSystem {
    constructor(experience) {
        this.experience = experience;
        this.sizes = experience.sizes;
        
        // Create elements
        this.createAboutCard();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log("AboutSystem initialized with background image");
    }
    
    /**
     * Create about card with Laqueno style
     */
    createAboutCard() {
        // Remove existing card if present
        const existingCard = document.getElementById('about-card');
        if (existingCard) {
            existingCard.remove();
        }
        
        // Create card container
        const card = document.createElement('div');
        card.id = 'about-card';
        card.className = 'about-card';
        
        // Create card content with Laqueno styling
        card.innerHTML = `
            <div class="about-background-container">
                <div class="about-background-image"></div>
            </div>
            <div class="about-card-content">
                <button type="button" id="about-close-btn" class="card-close-button">&times;</button>
                <div class="about-background">
                    <div class="about-header">
                        <h1 class="about-title">Paula Roman</h1>
                    </div>
                    <div class="about-text">
                        <p>Lorem Ipsum dolor suit amebar lorum ameburti<br>
                        Lorem Ipsum dolor suit amebar lorum ameburti<br>
                        Lorem Ipsum dolor suit amebar lorum ameburti<br>
                        Lorem Ipsum dolor suit amebar lorum ameburti<br>
                        Lorem Ipsum dolor suit amebar lorum ameburti<br>
                        Lorem Ipsum dolor suiti</p>
                    </div>
                    <div class="about-footer">
                        <h2 class="about-subtitle">Joaquín Brotons</h2>
                        <p class="about-subtext">
                            Autor de esta increíble web<br>
                            y quien convirtió los que <span class="highlight-no">no</span> por porque <span class="highlight-si">sí</span>
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .about-card {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: rgba(225, 226, 202, 0.9);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
                z-index: 8; /* Lower z-index to keep header visible */
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.5s ease;
                padding-top: 0; /* Remove padding as header should be visible above */
                overflow: hidden; /* Ensure image doesn't cause scrollbars */
            }
            
            .about-background-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 120%; /* Más ancho que el contenedor padre */
                height: 120%; /* Más alto que el contenedor padre */
                overflow: hidden; /* Ocultar el desbordamiento */
                z-index: 1;
            }
            
            .about-background-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('public/images/about-background.png');
                background-size: cover;
                background-position: center center;
                opacity: 0.8;
                transform: translateY(17%) translateX(-15%); /* Se aplica al contenido, no al contenedor */
            }
            
            .about-card.visible {
                opacity: 1;
                pointer-events: auto;
            }
            
            .about-card-content {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                transform: translateY(20px);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                z-index: 10;
                padding-top: 80px; /* Add padding for the header */
                box-sizing: border-box;
            }
            
            .about-card.visible .about-card-content {
                transform: translateY(0);
                opacity: 1;
            }
            
            .card-close-button {
                position: fixed;
                top: 150px;
                right: 20px;
                background: none;
                border: none;
                color: #2b2e1f;
                font-size: 28px;
                cursor: pointer; /* Asegúrate de que el cursor cambie a pointer */
                z-index: 101;
                width: 50px;  /* Aumenta el área de clic */
                height: 50px; /* Aumenta el área de clic */
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                line-height: 1;
                font-weight: bold;
                -webkit-tap-highlight-color: transparent;
                user-select: none; /* Prevenir selección de texto */
                pointer-events: auto; /* Asegurar que los eventos del puntero estén activos */
                transition: transform 0.2s ease, opacity 0.2s ease;
            }
            
            .card-close-button:hover {
                transform: scale(1.2); /* Efecto de hover más pronunciado */
                opacity: 0.8;
            }

            .card-close-button:active {
                transform: scale(0.9); /* Efecto de clic */
            }
            
            .about-background {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px;
                position: relative;
                z-index: 15;
            }
            
            .about-header {
                text-align: center;
                position: relative;
                z-index: 16;
            }
            
            .about-title {
                color: #B9BAAC;
                font-family: Optima, 'Segoe UI', sans-serif;
                font-weight: 400;
                font-size: clamp(60px, 15vw, 130.00px);
                line-height: 100%;
                letter-spacing: 0%;
                text-align: center;
                margin: 0;
                width: 100%;
                display: block;
            }
            
            .about-text {
                max-width: 800px;
                text-align: center;
                position: relative;
                z-index: 16;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 40px;
            }
            
            .about-text p {
                font-family: 'Inter', sans-serif;
                font-weight: 400;
                font-size: 25px;
                line-height: 100%;
                letter-spacing: 0%;
                text-align: center;
                color: #EBECCB;
                margin: 0;
            }
            
            .about-footer {
                text-align: center;
                position: relative;
                z-index: 16;
                padding: 20px;
                border-radius: 10px;
            }
            
            .about-subtitle {
                font-size: 32px;
                font-weight: 400;
                color: #EBECCB;
                margin: 0 0 10px 0;
            }
            
            .about-subtext {
                font-size: 16px;
                line-height: 1.5;
                color: #EBECCB;
                font-weight: 300;
                margin: 0;
            }
            
            .highlight-no {
                font-style: italic;
            }
            
            .highlight-si {
                font-weight: bold;
            }
            
            /* Tablets and Small Laptops */
            @media (max-width: 1024px) {
                .about-title {
                    font-size: clamp(50px, 10vw, 120px);
                }
                
                .about-text {
                    max-width: 90%;
                    padding: 15px;
                }
                
                .about-background {
                    padding: 30px 20px;
                }
            }
            
             @media (max-width: 768px) {
                .about-card {
                    padding: 20px;
                    align-items: center;
                    overflow-y: auto;
                }
                
                .about-card-content {
                    padding: 10px;
                    height: auto;
                    min-height: auto;
                    justify-content: center;
                    padding-top: 20px;
                }
                
                .about-background {
                    padding: 10px;
                }
                
                .about-title {
                    font-size: 36px;
                    margin-bottom: 10px;
                }
                
                .about-text {
                    padding: 10px;
                    width: 100%;
                    margin-bottom: 20px;
                }
                
                .about-text p {
                    font-size: 18px;
                    line-height: 1.4;
                }
                
                .about-footer {
                    padding: 10px;
                    width: 100%;
                    margin-bottom: 20px;
                }
                
                .about-subtitle {
                    font-size: 24px;
                }
                
                .about-subtext {
                    font-size: 16px;
                }
                
                .card-close-button {
                    top: 15px;
                    right: 15px;
                    font-size: 24px;
                    width: 40px;
                    height: 40px;
                }
                
                /* Ajuste de imagen de fondo para evitar desbordamiento excesivo */
                .about-background-container {
                    width: 150%;
                    height: 150%;
                }
                
                .about-background-image {
                    transform:  translateY(6%) translateX(-30%);
                    opacity: 0.9;
                }
            }
            
            @media (max-width: 380px) {
                .about-title {
                    font-size: 28px;
                }
                
                .about-text p {
                    font-size: 16px;
                }
                
                .about-subtitle {
                    font-size: 20px;
                }
                
                .about-subtext {
                    font-size: 14px;
                }
            }
            
            /* Modo Landscape para móviles con poca altura */
            @media (max-height: 500px) and (orientation: landscape) {
                .about-card-content {
                    padding-top: 10px;
                    overflow-y: auto;
                }
                
                .about-title {
                    font-size: clamp(30px, 8vw, 45px);
                    margin-bottom: 10px;
                }
                
                .about-text {
                    margin-bottom: 15px;
                    padding: 10px;
                }
                
                .about-text p {
                    font-size: 14px;
                    line-height: 1.4;
                }
                
                .about-footer {
                    margin-bottom: 20px;
                    padding: 10px;
                }
                
                .card-close-button {
                    top: 10px;
                    right: 10px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(card);
        
        this.aboutCard = card;
    }
    
    /**
     * Setup event listeners for about card
     */
    setupEventListeners() {
        // Close button - using multiple approaches to ensure it works
        const closeButton = document.getElementById('about-close-btn');
        if (closeButton) {
            const handleClose = (e) => {
                e.preventDefault(); // Prevent any default behavior
                e.stopPropagation(); // Stop event from bubbling
                
                // Visual feedback
                closeButton.style.opacity = '0.7';
                setTimeout(() => {
                    closeButton.style.opacity = '1';
                }, 100);
                
                this.hideAboutCard();
            };
    
            // Universal close event
            closeButton.addEventListener('click', handleClose);
            closeButton.addEventListener('touchend', handleClose, { passive: false });
        }
        
        // Close when clicking outside the content
        this.aboutCard.addEventListener('click', (e) => {
            if (e.target === this.aboutCard) {
                this.hideAboutCard();
            }
        });
        
        // Handle touch events outside content for mobile
        this.aboutCard.addEventListener('touchend', (e) => {
            if (e.target === this.aboutCard) {
                this.hideAboutCard();
            }
        });
        
        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAboutCard();
            }
        });
        
        // Make sure the close button works after DOM is fully loaded
        window.addEventListener('load', () => {
            const reCheckCloseBtn = document.getElementById('about-close-btn');
            if (reCheckCloseBtn) {
                reCheckCloseBtn.onclick = () => this.hideAboutCard();
            }
        });
        
        // Handle orientation changes for mobile
        window.addEventListener('orientationchange', () => {
            // Small delay to allow the browser to complete the orientation change
            setTimeout(() => {
                // Re-center content if needed
                if (this.aboutCard.classList.contains('visible')) {
                    // For landscape, adjust scrolling
                    if (window.innerHeight < 500) {
                        this.aboutCard.style.overflowY = 'auto';
                    } else {
                        this.aboutCard.style.overflowY = '';
                    }
                }
            }, 300);
        });
    }
    
    /**
     * Toggle footer visibility
     */
    toggleFooterVisibility(show) {
        const footer = document.querySelector('.footer');
        if (footer) {
            footer.style.visibility = show ? 'visible' : 'hidden';
            footer.style.opacity = show ? '1' : '0';
        }
    }
    
    /**
     * Show about card
     */
    showAboutCard() {
        this.aboutCard.classList.add('visible');
        
        // Keep header visible
        const header = document.querySelector('.header');
        if (header) {
            header.style.zIndex = '5';
            header.style.position = 'relative';
        }
        
        // Hide the footer
        this.toggleFooterVisibility(false);
        
        // For mobile, adjust scrolling based on orientation
        if (window.innerWidth <= 768) {
            // Check if in landscape mode with low height
            if (window.innerHeight < 500) {
                this.aboutCard.style.overflowY = 'auto';
            }
        }
    }
    
    /**
     * Hide about card
     */
    hideAboutCard() {
        this.aboutCard.classList.remove('visible');
        
        // Restore footer visibility
        this.toggleFooterVisibility(true);
    }
    
    /**
     * Update method (empty, kept for compatibility)
     */
    update() {
        // No animations needed for static image
    }
    
    /**
     * Method to be called when resources are ready (kept for compatibility)
     */
    onResourcesReady() {
        // Nothing to do, we're using static decoration elements
    }
}