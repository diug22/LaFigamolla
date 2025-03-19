/**
 * Contact System - Updated for Laqueno
 * Handles contact card UI and interactions
 */

export class ContactSystem {
    constructor(experience) {
        this.experience = experience;
        this.sizes = experience.sizes;
        
        // Create elements
        this.createContactCard();
        
        // Setup event listeners
        this.setupEventListeners();
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
     * Create contact card with Laqueno style
     */
    createContactCard() {
        // Remove existing card if present
        const existingCard = document.getElementById('contact-card');
        if (existingCard) {
            existingCard.remove();
        }
        
        // Create card container
        const card = document.createElement('div');
        card.id = 'contact-card';
        card.className = 'contact-card';
        
        // Create card content with Laqueno styling
        card.innerHTML = `
            <div class="contact-card-content">
                <button type="button" id="contact-close-btn" class="contact-card-close-button">&times;</button>
                <div class="about-background">
                    <div class="about-header">
                        <h3>CONTACTO</h3>
                    </div>
                    
                    <div class="contact-details">
                        <div class="contact-detail" id="email-detail">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <div>
                                <strong>Email</strong>
                                <span>paulacacahuete@gmail.com</span>
                            </div>
                        </div>
                        
                        <div class="contact-detail" id="instagram-detail">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                            <div>
                                <strong>Instagram</strong>
                                <span>@laaqueno</span>
                            </div>
                        </div>
                        
                        <div class="contact-detail" id="linkedin-detail">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                <rect x="2" y="9" width="4" height="12"></rect>
                                <circle cx="4" cy="4" r="2"></circle>
                            </svg>
                            <div>
                                <strong>LinkedIn</strong>
                                <span>Paula Román</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .contact-card {
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
                z-index: 8;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.5s ease;
                padding-top: 0;
                overflow: hidden;
            }
            
            .about-background-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 120%;
                height: 120%;
                overflow: hidden;
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
                transform: translateY(17%) translateX(-15%);
            }
            
            .contact-card.visible {
                opacity: 1;
                pointer-events: auto;
            }
            
            .contact-card-content {
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
                padding-top: 80px;
                box-sizing: border-box;
            }
            
            .contact-card.visible .contact-card-content {
                transform: translateY(0);
                opacity: 1;
            }
            
            .contact-card-close-button {
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
            
            .contact-card-close-button:hover {
                transform: scale(1.2); /* Efecto de hover más pronunciado */
                opacity: 0.8;
            }

            .contact-card-close-button:active {
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
                margin-bottom: 40px;
            }
            
            .about-header h3 {
                font-size: 32px;
                font-weight: 300;
                letter-spacing: 3px;
                color: #2b2e1f;
                margin-bottom: 40px;
            }
            
            .contact-details {
                display: flex;
                flex-direction: column;
                gap: 20px;
                margin-bottom: 40px;
                text-align: left;
                max-width: 400px;
                width: 100%;
            }
            
            .contact-detail {
                display: flex;
                align-items: flex-start;
                gap: 15px;
                cursor: pointer;
                transition: transform 0.3s ease;
            }
            
            .contact-detail:hover {
                transform: translateY(-3px);
            }
            
            .contact-detail svg {
                opacity: 0.7;
                width: 20px;
                height: 20px;
                flex-shrink: 0;
                margin-top: 2px;
                color: #2b2e1f;
            }
            
            .contact-detail div {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .contact-detail strong {
                font-size: 14px;
                font-weight: 500;
                color: #5e634d;
                letter-spacing: 1px;
            }
            
            .contact-detail span {
                font-size: 18px;
                color: #2b2e1f;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .contact-card-close-button {
                    padding: 10px;
                    height: auto;
                    min-height: auto;
                    justify-content: center;
                    padding-top: 20px;
                }
                
                .contact-card-close-button {
                    top: 80px;
                    right: 15px;
                    font-size: 24px;
                    width: 40px;
                    height: 40px;
                }
                
                .about-background-container {
                    width: 150%;
                    height: 150%;
                }
                
                .about-background-image {
                    transform: translateY(6%) translateX(-30%);
                    opacity: 0.9;
                }
                
                .contact-details {
                    padding: 0 20px;
                }
                
                .contact-detail span {
                    font-size: 16px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(card);
        
        this.contactCard = card;
    }

    /**
     * Create notification for clipboard
     * @param {string} message - Message to display
     */
    createClipboardNotification(message) {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.clipboard-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'clipboard-notification';
        notification.innerHTML = `
            <div class="clipboard-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
            </div>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        // Trigger visibility
        requestAnimationFrame(() => {
            notification.classList.add('visible');
        });

        // Remove notification after 2 seconds
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    /**
     * Copy text to clipboard with custom notification
     * @param {string} text - Text to copy
     */
    copyToClipboard(text) {
        try {
            // Create a temporary textarea element to copy text
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = text;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextArea);

            // Show success notification
            this.createClipboardNotification('Email copiado al portapapeles');
        } catch (err) {
            // Show error notification if copying fails
            this.createClipboardNotification('Error al copiar email');
            console.error('Failed to copy text:', err);
        }
    }
    
    /**
     * Setup event listeners for contact card
     */
    setupEventListeners() {
        // Close button
        console.log('YOPOOO223243222')
        const closeButton = document.getElementById('contact-close-btn');
        if (closeButton) {
            console.log('YOPOOO222')
            const handleClose = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideContactCard();
            };
    
            // Universal close event
            closeButton.addEventListener('click', handleClose);
            closeButton.addEventListener('touchend', handleClose);
        }
        // Email detail
        const emailDetail = document.getElementById('email-detail');
        if (emailDetail) {
            emailDetail.addEventListener('click', () => {
                const email = emailDetail.querySelector('span').textContent;
                this.copyToClipboard(email);
            });
        }

        // Instagram link
        const instagramDetail = document.getElementById('instagram-detail');
        if (instagramDetail) {
            instagramDetail.addEventListener('click', () => {
                window.open('https://www.instagram.com/laaqueno', '_blank');
            });
        }

        // LinkedIn link
        const linkedinDetail = document.getElementById('linkedin-detail');
        if (linkedinDetail) {
            linkedinDetail.addEventListener('click', () => {
                window.open('https://www.linkedin.com/in/paula-román/', '_blank');
            });
        }
        
        // Close when clicking outside the content
        this.contactCard.addEventListener('click', (e) => {
            if (e.target === this.contactCard) {
                this.hideContactCard();
            }
        });
        
        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideContactCard();
            }
        });
    }
    
    /**
     * Show contact card
     */
    showContactCard() {
        this.contactCard.classList.add('visible');
        
        // Keep header visible
        const header = document.querySelector('.header');
        if (header) {
            header.style.zIndex = '5';
            header.style.position = 'relative';
        }
        
        // Hide footer
        this.toggleFooterVisibility(false);
    }
    
    /**
     * Hide contact card
     */
    hideContactCard() {
        console.log('ÉNTROOOO')
        this.contactCard.classList.remove('visible');
        
        // Restore footer visibility
        this.toggleFooterVisibility(true);
    }
}