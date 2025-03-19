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
        
        // Styles for clipboard notification
        this.addClipboardStyles();
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
                <div class="contact-background">
                    <div class="contact-header">
                        <h3>CONTACTO</h3>
                    </div>
                    
                    <div class="contact-details">
                            <!-- New wrapper div with black transparent background -->
                            <div class="contact-details-wrapper">
                                <div class="contact-detail" id="email-detail">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B9BAAC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                    <div>
                                        <strong>Email</strong>
                                        <span>paulacacahuete@gmail.com</span>
                                    </div>
                                </div>
                                
                                <div class="contact-detail" id="instagram-detail">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B9BAAC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B9BAAC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                background-color: rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
                z-index: 0;
                opacity: 0.3;
                pointer-events: none;
                transition: opacity 0.5s ease;
                padding-top: 0;
                overflow: hidden;
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
                color: #B9BAAC;
                font-size: 28px;
                cursor: pointer;
                z-index: 101;
                width: 50px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                line-height: 1;
                font-weight: bold;
                -webkit-tap-highlight-color: transparent;
                user-select: none;
                pointer-events: auto;
                transition: transform 0.2s ease, opacity 0.2s ease;
            }
            
            .contact-card-close-button:hover {
                transform: scale(1.2);
                opacity: 0.8;
            }

            .contact-card-close-button:active {
                transform: scale(0.9);
            }
            
            .contact-background {
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
            
            .contact-header {
                text-align: center;
                position: relative;
                z-index: 16;
                margin-bottom: 40px;
                
            }
            
            .contact-header h3 {
                font-size: 32px;
                font-weight: 300;
                letter-spacing: 3px;
                color: #B9BAAC;
                font-weight: bold;
            }
            
             .contact-detail {
                display: flex;
                align-items: flex-start;
                gap: 15px;
                cursor: pointer;
                transition: transform 0.3s ease;
                padding: 10px;
                border-radius: 8px;
            }
            
            .contact-detail:hover {
                transform: translateY(-3px);
                background-color: rgba(255, 255, 255, 0.2);
            }
            
            .contact-detail svg {
                opacity: 0.7;
                width: 20px;
                height: 20px;
                flex-shrink: 0;
                margin-top: 2px;
                color: #B9BAAC;
            }
            
            .contact-detail div {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .contact-detail strong {
                font-size: 14px;
                font-weight: 500;
                color: #B9BAAC;
                letter-spacing: 1px;
            }
            
            .contact-detail span {
                font-size: 18px;
                color: #B9BAAC;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .contact-background {
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
     * Add styles for clipboard notification
     */
    addClipboardStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .clipboard-notification {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(100%);
                background-color: rgba(43, 46, 31, 0.9);
                color: #e4e3d3;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease;
                z-index: 1000;
            }
            
            .clipboard-notification.visible {
                transform: translateX(-50%) translateY(0);
            }
            
            .clipboard-icon {
                color: #a6a995;
            }
            
            .clipboard-notification span {
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
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
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);

        // Remove notification after 2 seconds
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }

    /**
     * Copy text to clipboard with custom notification
     * @param {string} text - Text to copy
     */
    copyToClipboard(text) {
        try {
            // Use modern clipboard API if available
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text)
                    .then(() => this.createClipboardNotification('Email copiado al portapapeles'))
                    .catch(err => {
                        console.error('Failed to copy using Clipboard API:', err);
                        this.fallbackCopyToClipboard(text);
                    });
            } else {
                this.fallbackCopyToClipboard(text);
            }
        } catch (err) {
            console.error('Failed to copy text:', err);
            this.createClipboardNotification('Error al copiar email');
        }
    }
    
    /**
     * Fallback method to copy text to clipboard
     * @param {string} text - Text to copy
     */
    fallbackCopyToClipboard(text) {
        try {
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = text;
            tempTextArea.style.position = 'fixed';
            tempTextArea.style.opacity = '0';
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextArea);
            this.createClipboardNotification('Email copiado al portapapeles');
        } catch (err) {
            console.error('Fallback copy failed:', err);
            this.createClipboardNotification('Error al copiar email');
        }
    }
    
    /**
     * Setup event listeners for contact card
     */
    setupEventListeners() {
        // Use a more robust method to ensure close button works
        this.attachCloseButtonListener();
        
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
            if (e.key === 'Escape' && this.contactCard.classList.contains('visible')) {
                this.hideContactCard();
            }
        });
    }
    
    /**
     * Attach event listener to close button with retry
     */
    attachCloseButtonListener() {
        const attachListener = () => {
            const closeButton = document.getElementById('contact-close-btn');
            if (closeButton) {
                // Remove any existing listeners to prevent duplicates
                const newButton = closeButton.cloneNode(true);
                closeButton.parentNode.replaceChild(newButton, closeButton);
                
                // Add click event
                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.hideContactCard();
                });
                
                // Add touch event for mobile
                newButton.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.hideContactCard();
                }, { passive: false });
                
                return true;
            }
            return false;
        };
        
        // Try to attach immediately
        if (!attachListener()) {
            // If it fails, retry after DOM is fully loaded
            window.addEventListener('load', attachListener);
            
            // Also retry after a short delay
            setTimeout(attachListener, 500);
        }
    }
    
    /**
     * Show contact card
     */
    showContactCard() {
        // Make sure AboutSystem is hidden first (if it exists)
        const aboutCard = document.getElementById('about-card');
        if (aboutCard && aboutCard.classList.contains('visible')) {
            if (this.experience && this.experience.ui && this.experience.ui.aboutSystem) {
                this.experience.ui.aboutSystem.hideAboutCard();
            } else {
                // Otherwise remove the visible class
                aboutCard.classList.remove('visible');
                aboutCard.style.zIndex = '0';
            }
        }
        
        this.contactCard.classList.add('visible');
        this.contactCard.style.zIndex = '2';

        
        // Ensure close button is working after display
        setTimeout(() => this.attachCloseButtonListener(), 100);
        
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
        this.contactCard.classList.remove('visible');
        this.contactCard.style.zIndex = '0';

        
        // Restore footer visibility
        this.toggleFooterVisibility(true);
    }
}