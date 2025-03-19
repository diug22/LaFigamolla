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
                <button class="card-close-button">&times;</button>
                 <h1 class="title">Laque<span class="highlight">no.</span></h1>
                <div class="card-separator"></div>
                <h3>CONTACTO</h3>
                
               <div class="contact-details">
                    <div class="contact-detail" onclick="navigator.clipboard.writeText('paulacacahuete@gmail.com');">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <div>
                            <strong>Email</strong>
                            <span>paulacacahuete@gmail.com</span>
                        </div>
                    </div>
                    
                    <div class="contact-detail" onclick="window.open('https://www.instagram.com/laaqueno', '_blank');">
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
                    
                    <div class="contact-detail" onclick="window.open('https://www.linkedin.com/in/paula-román/', '_blank');">
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
                background-color: rgba(43, 46, 31, 0.95);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                z-index: 1000;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.5s ease;
            }
            
            .contact-card.visible {
                opacity: 0.9;
                pointer-events: auto;
            }
            
            .contact-card-content {
                max-width: 500px;
                padding: 40px;
                position: relative;
                transform: translateY(20px);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                text-align: center;
            }
            
            .contact-card.visible .contact-card-content {
                transform: translateY(0);
                opacity: 1;
            }
            
            .card-close-button {
                position: absolute;
                top: 0;
                right: 0;
                background: none;
                border: none;
                color: #e4e3d3;
                font-size: 24px;
                cursor: pointer;
            }
            
            .contact-card-content h2 {
                font-size: 32px;
                font-weight: 300;
                letter-spacing: 2px;
                margin-bottom: 20px;
                color: #e4e3d3;
            }
            
            .contact-card-content h3 {
                font-size: 16px;
                font-weight: 300;
                letter-spacing: 3px;
                margin-bottom: 30px;
                color: #a6a995;
            }
            
            .card-separator {
                width: 40px;
                height: 1px;
                background-color: #a6a995;
                margin: 0 auto 30px;
            }
            
            .contact-details {
                display: flex;
                flex-direction: column;
                gap: 20px;
                margin-bottom: 40px;
                text-align: left;
            }
            
            .contact-detail {
                display: flex;
                align-items: flex-start;
                gap: 15px;
            }
            
            .contact-detail svg {
                opacity: 0.7;
                width: 20px;
                height: 20px;
                flex-shrink: 0;
                margin-top: 2px;
            }
            
            .contact-detail div {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .contact-detail strong {
                font-size: 14px;
                font-weight: 500;
                color: #a6a995;
                letter-spacing: 1px;
            }
            
            .contact-detail span {
                font-size: 18px;
                color: #e4e3d3;
            }
            
            .social-links {
                display: flex;
                justify-content: center;
                gap: 20px;
            }
            
            .social-link {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: rgba(228, 227, 211, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #e4e3d3;
                transition: all 0.3s ease;
            }
            
            .social-link:hover {
                background-color: rgba(228, 227, 211, 0.2);
                transform: translateY(-3px);
            }
            
            @media (max-width: 768px) {
                .contact-card-content {
                    padding: 30px 20px;
                    width: 90%;
                }
                
                .contact-detail span {
                    font-size: 16px;
                }
                
                .social-link {
                    width: 45px;
                    height: 45px;
                }
            }

            .clipboard-notification {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(43, 46, 31, 0.9);
                color: #e4e3d3;
                padding: 15px 30px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            .clipboard-notification.visible {
                opacity: 1;
                transform: translate(-50%, -20px);
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
        notification.textContent = message;
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
        const closeButton = this.contactCard.querySelector('.card-close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hideContactCard();
            });
        }

        const emailDetail = this.contactCard.querySelector('.contact-detail:first-child');
        if (emailDetail) {
            emailDetail.addEventListener('click', (e) => {
                const email = emailDetail.querySelector('span').textContent;
                this.copyToClipboard(email);
            });
        }

        // Instagram link
        const instagramDetail = this.contactCard.querySelector('.contact-detail:nth-child(2)');
        if (instagramDetail) {
            instagramDetail.addEventListener('click', () => {
                window.open('https://www.instagram.com/laaqueno', '_blank');
            });
        }

        // LinkedIn link
        const linkedinDetail = this.contactCard.querySelector('.contact-detail:last-child');
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
    }
    
    /**
     * Hide contact card
     */
    hideContactCard() {
        this.contactCard.classList.remove('visible');
    }
}