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
                <h2>LAQUENO</h2>
                <div class="card-separator"></div>
                <h3>CONTACTO</h3>
                
                <div class="contact-details">
                    <div class="contact-detail">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <div>
                            <strong>Email</strong>
                            <span>info@laqueno.com</span>
                        </div>
                    </div>
                    
                    <div class="contact-detail">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                        <div>
                            <strong>Instagram</strong>
                            <span>@laqueno.studio</span>
                        </div>
                    </div>
                    
                    <div class="contact-detail">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <div>
                            <strong>Estudio</strong>
                            <span>Calle Cerámica, 23 - Barcelona</span>
                        </div>
                    </div>
                </div>
                
                <div class="social-links">
                    <a href="https://instagram.com/laqueno.studio" class="social-link" aria-label="Instagram">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                    <a href="mailto:info@laqueno.com" class="social-link" aria-label="Email">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                    </a>
                    <a href="https://wa.me/34600000000" class="social-link" aria-label="WhatsApp">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                    </a>
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
                opacity: 1;
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
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(card);
        
        this.contactCard = card;
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