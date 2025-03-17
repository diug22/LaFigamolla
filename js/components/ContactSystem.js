/**
 * Contact System
 * Sistema de contacto unificado para PC y móvil
 * 
 * Este sistema implementa:
 * 1. Un botón de contacto atractivo 
 * 2. Una tarjeta de contacto elegante con el mismo aspecto en PC y móvil
 * 3. Animaciones suaves y estilo profesional
 */

export class ContactSystem {
    constructor(experience) {
        this.experience = experience;
        this.sizes = experience.sizes;
        
        // Crear elementos
        this.createContactButton();
        this.createContactCard();
        
        // Configurar event listeners
        this.setupEventListeners();
    }
    
    /**
     * Crear un botón de contacto atractivo con icono
     */
    createContactButton() {
        // Eliminar botón existente si está presente
        const existingButton = document.getElementById('contact-button');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Crear nuevo botón
        const button = document.createElement('button');
        button.id = 'contact-button';
        button.className = 'contact-button';
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
        `;
        
        // Añadir estilos
        const style = document.createElement('style');
        style.textContent = `
            .contact-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 56px;
                height: 56px;
                border-radius: 28px;
                background-color: #1a1a1a;
                color: white;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                transition: all 0.3s ease;
                outline: none;
            }
            
            .contact-button:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
                background-color: #333;
            }
            
            .contact-button svg {
                width: 24px;
                height: 24px;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(button);
        
        this.contactButton = button;
    }
    
    /**
     * Crear la tarjeta de contacto con un diseño elegante, unificado para móvil y PC
     */
    createContactCard() {
        // Eliminar tarjeta existente si está presente
        const existingCard = document.getElementById('contact-card');
        if (existingCard) {
            existingCard.remove();
        }
        
        // Crear contenedor de la tarjeta
        const card = document.createElement('div');
        card.id = 'contact-card';
        card.className = 'contact-card';
        
        // Crear contenido de la tarjeta
        card.innerHTML = `
            <div class="contact-card-content">
                <button class="card-close-button">×</button>
                <h2>LA FIGAMOLLA</h2>
                <div class="card-separator"></div>
                <h3>CONTACTO</h3>
                
                <div class="contact-info">
                    <p>¿Interesado en alguna de nuestras piezas o en encargar algo personalizado?</p>
                    
                    <div class="contact-details">
                        <div class="contact-detail">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <div>
                                <strong>Email</strong>
                                <span>info@lafigamolla.com</span>
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
                                <span>@lafigamolla</span>
                            </div>
                        </div>
                        
                        <div class="contact-detail">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <div>
                                <strong>Taller</strong>
                                <span>Calle Cerámica, 23 - Barcelona</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="social-links">
                    <a href="https://instagram.com/lafigamolla" class="social-link" aria-label="Instagram">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                    <a href="mailto:info@lafigamolla.com" class="social-link" aria-label="Email">
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
        
        // Añadir estilos
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
                background-color: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                z-index: 1000;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }
            
            .contact-card.visible {
                opacity: 1;
                pointer-events: auto;
            }
            
            .contact-card-content {
                width: 90%;
                max-width: 400px;
                background-color: #1a1a1a;
                color: white;
                border-radius: 8px;
                padding: 30px;
                position: relative;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                transform: translateY(20px);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            
            .contact-card.visible .contact-card-content {
                transform: translateY(0);
                opacity: 1;
            }
            
            .card-close-button {
                position: absolute;
                top: 15px;
                right: 15px;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: none;
                background-color: rgba(255, 255, 255, 0.1);
                color: white;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .card-close-button:hover {
                background-color: rgba(255, 255, 255, 0.2);
            }
            
            .contact-card-content h2 {
                font-size: 24px;
                margin: 0;
                letter-spacing: 1px;
                text-align: center;
            }
            
            .contact-card-content h3 {
                font-size: 18px;
                font-weight: normal;
                margin: 0 0 20px 0;
                letter-spacing: 1px;
                text-align: center;
            }
            
            .card-separator {
                width: 50px;
                height: 2px;
                background-color: rgba(255, 255, 255, 0.3);
                margin: 15px auto;
            }
            
            .contact-info {
                margin-bottom: 25px;
            }
            
            .contact-info p {
                text-align: center;
                margin-bottom: 20px;
                font-size: 14px;
                line-height: 1.5;
                color: rgba(255, 255, 255, 0.8);
            }
            
            .contact-details {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .contact-detail {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .contact-detail svg {
                opacity: 0.7;
                flex-shrink: 0;
            }
            
            .contact-detail div {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .contact-detail strong {
                font-size: 14px;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .contact-detail span {
                font-size: 16px;
            }
            
            .social-links {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 25px;
            }
            
            .social-link {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0.1);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
                transition: all 0.2s ease;
            }
            
            .social-link:hover {
                background-color: rgba(255, 255, 255, 0.2);
                transform: translateY(-3px);
            }
            
            @media (max-width: 767px) {
                .contact-card-content {
                    padding: 25px 20px;
                }
                
                .contact-detail strong {
                    font-size: 13px;
                }
                
                .contact-detail span {
                    font-size: 15px;
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
     * Configurar todos los event listeners
     */
    setupEventListeners() {
        // Botón de contacto
        this.contactButton.addEventListener('click', () => {
            this.showContactCard();
        });
        
        // Botón de cerrar
        const closeButton = this.contactCard.querySelector('.card-close-button');
        closeButton.addEventListener('click', () => {
            this.hideContactCard();
        });
        
        // Cerrar al hacer clic fuera
        this.contactCard.addEventListener('click', (e) => {
            if (e.target === this.contactCard) {
                this.hideContactCard();
            }
        });
        
        // Manejar tecla escape para cerrar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideContactCard();
            }
        });
    }
    
    /**
     * Mostrar tarjeta de contacto
     */
    showContactCard() {
        this.contactCard.classList.add('visible');
    }
    
    /**
     * Ocultar tarjeta de contacto
     */
    hideContactCard() {
        this.contactCard.classList.remove('visible');
    }
}