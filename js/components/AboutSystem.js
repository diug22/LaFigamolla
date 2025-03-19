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
            <div class="about-background-image"></div>
            <div class="about-card-content">
                <button class="card-close-button">&times;</button>
                <div class="about-background">
                    <div class="about-header">
                        <h1 class="about-title">Paula Román</h1>
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
                background-color: rgba(225, 226, 202, 0.7);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
                z-index: 5; /* Lower z-index to keep header visible */
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.5s ease;
                padding-top: 100px; /* Add padding for the header */
                overflow: hidden; /* Ensure image doesn't cause scrollbars */
            }
            
            .about-background-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('public/images/about-background.png'); /* Update this path to your image */
                background-size: cover;
                background-position: center;
                opacity: 0.4;
                z-index: 1;
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
            }
            
            .about-card.visible .about-card-content {
                transform: translateY(0);
                opacity: 1;
            }
            
            .card-close-button {
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                color: #2b2e1f;
                font-size: 24px;
                cursor: pointer;
                z-index: 20;
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
                margin-bottom: 40px;
                text-align: center;
                position: relative;
                z-index: 16;
            }
            
            .about-title {
                font-size: 80px;
                font-weight: 300;
                letter-spacing: 2px;
                color: #2b2e1f;
                opacity: 0.7;
                text-transform: none;
                text-shadow: 0px 0px 10px rgba(225, 226, 202, 0.8);
            }
            
            .about-text {
                max-width: 800px;
                text-align: center;
                margin-bottom: 60px;
                position: relative;
                z-index: 16;
                background-color: rgba(225, 226, 202, 0.5);
                padding: 20px;
                border-radius: 10px;
            }
            
            .about-text p {
                font-size: 18px;
                line-height: 1.6;
                color: #2b2e1f;
                font-weight: 500;
            }
            
            .about-footer {
                text-align: center;
                position: relative;
                z-index: 16;
                background-color: rgba(225, 226, 202, 0.5);
                padding: 20px;
                border-radius: 10px;
            }
            
            .about-subtitle {
                font-size: 32px;
                font-weight: 400;
                color: #2b2e1f;
                margin-bottom: 10px;
            }
            
            .about-subtext {
                font-size: 16px;
                line-height: 1.5;
                color: #2b2e1f;
                font-weight: 300;
            }
            
            .highlight-no {
                font-style: italic;
            }
            
            .highlight-si {
                font-weight: bold;
            }
            
            @media (max-width: 768px) {
                .about-card-content {
                    padding: 20px;
                }
                
                .about-title {
                    font-size: 50px;
                }
                
                .about-text p {
                    font-size: 16px;
                }
                
                .about-subtitle {
                    font-size: 24px;
                }
                
                .about-subtext {
                    font-size: 14px;
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
        // Close button
        const closeButton = this.aboutCard.querySelector('.card-close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hideAboutCard();
            });
        }
        
        // Close when clicking outside the content (optional)
        this.aboutCard.addEventListener('click', (e) => {
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
    }
    
    /**
     * Show about card
     */
    showAboutCard() {
        console.log("Showing about card");
        this.aboutCard.classList.add('visible');
    }
    
    /**
     * Hide about card
     */
    hideAboutCard() {
        console.log("Hiding about card");
        this.aboutCard.classList.remove('visible');
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
        // Nothing to do, we're using a static image
        console.log("Resources ready, but we're using a static image in AboutSystem");
    }
}