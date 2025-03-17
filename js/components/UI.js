/**
 * UI class
 * Handles user interface elements and interactions
 */
import { ContactSystem } from './ContactSystem.js';


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
            navDots: document.getElementById('nav-dots'),
            gestureHint: document.getElementById('gesture-hint'),
            infoPanel: document.getElementById('info-panel'),
            infoTitle: document.getElementById('info-title'),
            infoDescription: document.getElementById('info-description'),
            infoDimensions: document.getElementById('info-dimensions'),
            infoMaterial: document.getElementById('info-material'),
            infoYear: document.getElementById('info-year'),
            header: document.querySelector('.header'),
            footer: document.querySelector('.footer'),
            uiContainer: document.querySelector('.ui-container')
        };
        
        // Add info bubble element for swipe-up info display
        this.createInfoBubble();
        this.createZoomUI();

        
        // UI State
        this.uiVisible = false;
        this.infoBubbleVisible = false;
        this.contactSystem = new ContactSystem(this.experience);

        // Setup
        this.setupEventListeners();
        this.createUIToggleButton();
        this.createResetButton();
        
        // Auto-hide UI after a short delay when experience starts
    }

    createRotationIndicator() {
        // Verificar si ya existe
        if (document.getElementById('rotation-indicator')) return;
        
        // Crear contenedor principal
        const indicator = document.createElement('div');
        indicator.id = 'rotation-indicator';
        indicator.className = 'rotation-indicator';
        
        // Estilos base
        indicator.style.position = 'fixed';
        indicator.style.left = '50%';
        indicator.style.top = '50%';
        indicator.style.transform = 'translate(-50%, -50%)';
        indicator.style.width = '150px';
        indicator.style.height = '150px';
        indicator.style.pointerEvents = 'none';
        indicator.style.zIndex = '500';
        indicator.style.opacity = '0';
        indicator.style.transition = 'opacity 0.5s ease';
        
        // Crear círculo principal
        const circle = document.createElement('div');
        circle.className = 'rotation-circle';
        circle.style.position = 'absolute';
        circle.style.width = '100%';
        circle.style.height = '100%';
        circle.style.borderRadius = '50%';
        circle.style.border = '2px dashed rgba(255, 255, 255, 0.3)';
        circle.style.boxSizing = 'border-box';
        
        // Añadir puntos de arrastre
        const createDragPoint = (angle, size = 10) => {
            const point = document.createElement('div');
            point.className = 'drag-point';
            const rad = angle * Math.PI / 180;
            const radius = 75 - size/2; // Ajustar según tamaño del contenedor
            
            point.style.position = 'absolute';
            point.style.width = `${size}px`;
            point.style.height = `${size}px`;
            point.style.borderRadius = '50%';
            point.style.backgroundColor = 'white';
            point.style.left = `${radius * Math.cos(rad) + 75 - size/2}px`;
            point.style.top = `${radius * Math.sin(rad) + 75 - size/2}px`;
            point.style.opacity = '0.8';
            
            return point;
        };
        
        // Añadir 4 puntos en diferentes posiciones
        [0, 90, 180, 270].forEach(angle => {
            circle.appendChild(createDragPoint(angle));
        });
        
        // Crear elemento para cursor
        const cursor = document.createElement('div');
        cursor.className = 'drag-cursor';
        cursor.style.position = 'absolute';
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursor.style.borderRadius = '50%';
        cursor.style.border = '2px solid white';
        cursor.style.boxSizing = 'border-box';
        cursor.style.left = '65px'; // Centro del círculo
        cursor.style.top = '65px';
        
        // Crear la animación del cursor
        const cursorPath = document.createElement('div');
        cursorPath.className = 'cursor-path';
        cursorPath.style.position = 'absolute';
        cursorPath.style.width = '100%';
        cursorPath.style.height = '100%';
        cursorPath.style.borderRadius = '50%';
        cursorPath.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        cursorPath.style.boxSizing = 'border-box';
        
        // Añadir animación de recorrido del cursor
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rotateCursor {
                0% { transform: translate(-50%, -50%) rotate(0deg) translate(50px) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg) translate(50px) rotate(-360deg); }
            }
            
            @keyframes handDrag {
                0%, 100% { transform: translate(0, 0); }
                50% { transform: translate(8px, 8px); }
            }
            
            .drag-cursor {
                animation: rotateCursor 4s infinite linear;
                transform-origin: center;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .rotation-circle {
                animation: pulse 3s infinite ease-in-out;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.05); opacity: 1; }
            }
            
            .drag-point {
                animation: blink 2s infinite alternate;
            }
            
            @keyframes blink {
                0% { opacity: 0.4; }
                100% { opacity: 0.9; }
            }
        `;
        
        // Añadir icono de mano
        const hand = document.createElement('div');
        hand.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M9,11.24V7.5C9,6.12 10.12,5 11.5,5S14,6.12 14,7.5v3.74c1.21,-0.81 2,-2.18 2,-3.74C16,5.01 13.99,3 11.5,3S7,5.01 7,7.5C7,9.06 7.79,10.43 9,11.24zM18.84,15.87l-4.54,-2.26c-0.17,-0.07 -0.35,-0.11 -0.54,-0.11H13v-6C13,6.67 12.33,6 11.5,6S10,6.67 10,7.5v10.74c-0.61,0.55 -2.33,2.01 -4.12,2.01c-0.53,0 -1.01,-0.21 -1.37,-0.56c-0.35,-0.36 -0.55,-0.84 -0.55,-1.36c0,-0.37 0.1,-0.77 0.3,-1.2c0.2,-0.43 0.47,-0.82 0.7,-1.08c0.25,-0.27 0.25,-0.68 0,-0.94c-0.25,-0.26 -0.65,-0.26 -0.9,0C3.82,15.34 3,16.42 3,17.34c0,0.84 0.32,1.64 0.92,2.23c0.59,0.59 1.39,0.91 2.23,0.91c2.19,0 3.87,-1.3 4.35,-1.67c0,0 0,0.08 0,0.08c0,0.97 0.79,1.76 1.76,1.76c0.44,0 0.85,-0.17 1.16,-0.47c0.31,0.3 0.72,0.47 1.16,0.47c0.97,0 1.76,-0.79 1.76,-1.76c0,-0.19 -0.04,-0.37 -0.1,-0.54c0.61,-0.33 1.03,-0.97 1.03,-1.71c0,-0.44 -0.14,-0.84 -0.39,-1.16C18.11,15.88 18.47,15.64 18.84,15.87z"/>
            </svg>
        `;
        hand.style.position = 'absolute';
        hand.style.animation = 'handDrag 1s infinite ease-in-out';
        
        // Añadir los elementos al DOM
        cursor.appendChild(hand);
        indicator.appendChild(cursorPath);
        indicator.appendChild(circle);
        indicator.appendChild(cursor);
        document.head.appendChild(style);
        document.body.appendChild(indicator);
        
        // Guardar referencia
        this.elements.rotationIndicator = indicator;
        
        return indicator;
    }


    
    /**
     * Mostrar el indicador de rotación
     */
    showRotationIndicator() {
        // No mostrar si ya se ha visto antes
        if (localStorage.getItem('rotationIndicatorSeen')) return;
        
        // Crear si no existe
        if (!this.elements.rotationIndicator) {
            this.createRotationIndicator();
        }
        
        // Mostrar con animación
        this.elements.rotationIndicator.style.opacity = '1';
        
        // Ocultar después de 4 segundos
        setTimeout(() => {
            this.hideRotationIndicator();
            // Marcar como visto
            localStorage.setItem('rotationIndicatorSeen', 'true');
        }, 4000);
    }

    /**
     * Ocultar el indicador de rotación
     */
    hideRotationIndicator() {
        if (this.elements.rotationIndicator) {
            this.elements.rotationIndicator.style.opacity = '0';
        }
    }
    
    /**
     * Create info bubble element for swipe-up interaction
     */
    createInfoBubble() {
        // Create info bubble container
        const infoBubble = document.createElement('div');
        infoBubble.id = 'info-bubble';
        infoBubble.className = 'info-bubble';
        infoBubble.style.position = 'fixed';
        infoBubble.style.bottom = '-200px'; // Start off-screen
        infoBubble.style.left = '0';
        infoBubble.style.width = '100%';
        infoBubble.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        infoBubble.style.color = 'white';
        infoBubble.style.padding = '20px';
        infoBubble.style.borderTopLeftRadius = '20px';
        infoBubble.style.borderTopRightRadius = '20px';
        infoBubble.style.transition = 'bottom 0.3s ease-out';
        infoBubble.style.zIndex = '90';
        infoBubble.style.backdropFilter = 'blur(10px)';
        infoBubble.style.boxShadow = '0 -4px 20px rgba(0, 0, 0, 0.2)';
        infoBubble.style.display = 'flex';
        infoBubble.style.flexDirection = 'column';
        infoBubble.style.gap = '10px';
        
        // Add content elements to the bubble
        const title = document.createElement('h3');
        title.id = 'bubble-title';
        title.style.margin = '0';
        title.style.fontSize = '20px';
        
        const description = document.createElement('p');
        description.id = 'bubble-description';
        description.style.margin = '5px 0';
        description.style.fontSize = '14px';
        
        const details = document.createElement('div');
        details.style.display = 'flex';
        details.style.flexWrap = 'wrap';
        details.style.gap = '10px';
        details.style.fontSize = '12px';
        details.style.opacity = '0.8';
        
        const dimensions = document.createElement('span');
        dimensions.id = 'bubble-dimensions';
        
        const material = document.createElement('span');
        material.id = 'bubble-material';
        
        const year = document.createElement('span');
        year.id = 'bubble-year';
        
        // Add swipe-up indicator
        const indicator = document.createElement('div');
        indicator.className = 'swipe-indicator';
        indicator.innerHTML = '↑ Swipe up for more details ↑';
        indicator.style.textAlign = 'center';
        indicator.style.marginBottom = '5px';
        indicator.style.fontSize = '12px';
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.color = 'white';
        closeButton.style.fontSize = '20px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', () => this.hideInfoBubble());
        
        // Add elements to bubble
        details.appendChild(dimensions);
        details.appendChild(material);
        details.appendChild(year);
        
        infoBubble.appendChild(closeButton);
        infoBubble.appendChild(indicator);
        infoBubble.appendChild(title);
        infoBubble.appendChild(description);
        infoBubble.appendChild(details);
        
        // Add bubble to document
        document.body.appendChild(infoBubble);
        
        // Store reference
        this.elements.infoBubble = infoBubble;
        this.elements.bubbleTitle = title;
        this.elements.bubbleDescription = description;
        this.elements.bubbleDimensions = dimensions;
        this.elements.bubbleMaterial = material;
        this.elements.bubbleYear = year;
    }
    createZoomUI() {
        // Crear contenedor para indicador de zoom
        const zoomIndicator = document.createElement('div');
        zoomIndicator.id = 'zoom-indicator';
        zoomIndicator.className = 'zoom-indicator';
        zoomIndicator.style.position = 'fixed';
        zoomIndicator.style.bottom = '60px';
        zoomIndicator.style.right = '20px';
        zoomIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        zoomIndicator.style.color = 'white';
        zoomIndicator.style.padding = '8px 12px';
        zoomIndicator.style.borderRadius = '20px';
        zoomIndicator.style.fontSize = '14px';
        zoomIndicator.style.opacity = '0';
        zoomIndicator.style.transition = 'opacity 0.3s ease';
        zoomIndicator.style.zIndex = '100';
        zoomIndicator.style.display = 'flex';
        zoomIndicator.style.alignItems = 'center';
        zoomIndicator.style.justifyContent = 'center';
        zoomIndicator.style.backdropFilter = 'blur(4px)';
        zoomIndicator.style.fontFamily = 'Arial, sans-serif';
        zoomIndicator.style.userSelect = 'none';
        zoomIndicator.style.pointerEvents = 'none'; // No intercepta eventos
        
        // Añadir icono de zoom
        const zoomIcon = document.createElement('span');
        zoomIcon.innerHTML = '🔍';
        zoomIcon.style.marginRight = '5px';
        zoomIcon.style.fontSize = '16px';
        
        // Añadir texto para el nivel de zoom
        const zoomText = document.createElement('span');
        zoomText.id = 'zoom-level-text';
        zoomText.textContent = '100%';
        
        // Estructura del indicador
        zoomIndicator.appendChild(zoomIcon);
        zoomIndicator.appendChild(zoomText);
        
        // Añadir al DOM
        document.body.appendChild(zoomIndicator);
        
        // Guardar referencia
        this.elements.zoomIndicator = zoomIndicator;
        this.elements.zoomText = zoomText;
        
        // Crear tutorial visual para el zoom (aparece solo la primera vez)
        this.createZoomTutorial();
    }
    
    // Crear tutorial visual para el zoom
    createZoomTutorial() {
        // Crear contenedor del tutorial
        const tutorial = document.createElement('div');
        tutorial.id = 'zoom-tutorial';
        tutorial.className = 'zoom-tutorial';
        tutorial.style.position = 'fixed';
        tutorial.style.top = '0';
        tutorial.style.left = '0';
        tutorial.style.width = '100%';
        tutorial.style.height = '100%';
        tutorial.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        tutorial.style.color = 'white';
        tutorial.style.display = 'flex';
        tutorial.style.flexDirection = 'column';
        tutorial.style.alignItems = 'center';
        tutorial.style.justifyContent = 'center';
        tutorial.style.zIndex = '1000';
        tutorial.style.opacity = '0';
        tutorial.style.pointerEvents = 'none'; // No intercepta eventos inicialmente
        tutorial.style.transition = 'opacity 0.5s ease';
        
        // Crear contenido específico dependiendo de si es móvil o escritorio
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isMobile) {
            // Tutorial para móvil
            tutorial.innerHTML = `
                <div style="text-align: center; max-width: 80%;">
                    <h2 style="margin-bottom: 20px;">Gestos de zoom</h2>
                    <div style="display: flex; justify-content: center; margin-bottom: 20px;">
                        <div style="text-align: center; margin: 10px;">
                            <div style="font-size: 40px; margin-bottom: 10px;">👆👆</div>
                            <p>Doble tap para<br>hacer zoom</p>
                        </div>
                        <div style="text-align: center; margin: 10px;">
                            <div style="font-size: 40px; margin-bottom: 10px;">👌</div>
                            <p>Pellizca para<br>ampliar o reducir</p>
                        </div>
                    </div>
                    <p>Prueba ahora estos gestos para interactuar con los modelos 3D</p>
                    <button id="tutorial-close" style="margin-top: 20px; padding: 10px 20px; border: none; background: #fff; color: #000; border-radius: 20px; cursor: pointer;">Entendido</button>
                </div>
            `;
        } else {
            // Tutorial para escritorio
            tutorial.innerHTML = `
                <div style="text-align: center; max-width: 80%;">
                    <h2 style="margin-bottom: 20px;">Controles de zoom</h2>
                    <div style="display: flex; justify-content: center; margin-bottom: 20px;">
                        <div style="text-align: center; margin: 10px;">
                            <div style="font-size: 40px; margin-bottom: 10px;">🖱️</div>
                            <p>Usa la rueda del ratón<br>para hacer zoom</p>
                        </div>
                        <div style="text-align: center; margin: 10px;">
                            <div style="font-size: 40px; margin-bottom: 10px;">👆👆</div>
                            <p>Doble click para<br>ampliar un objeto</p>
                        </div>
                    </div>
                    <p>Prueba ahora estos controles para interactuar con los modelos 3D</p>
                    <button id="tutorial-close" style="margin-top: 20px; padding: 10px 20px; border: none; background: #fff; color: #000; border-radius: 20px; cursor: pointer;">Entendido</button>
                </div>
            `;
        }
        
        // Añadir al DOM
        document.body.appendChild(tutorial);
        
        // Guardar referencia
        this.elements.zoomTutorial = tutorial;
        
        // Configurar botón de cierre
        setTimeout(() => {
            const closeButton = document.getElementById('tutorial-close');
            if (closeButton) {
                tutorial.style.pointerEvents = 'auto'; // Habilitar eventos
                tutorial.style.opacity = '1'; // Mostrar tutorial
                
                closeButton.addEventListener('click', () => {
                    tutorial.style.opacity = '0';
                    setTimeout(() => {
                        tutorial.style.display = 'none';
                    }, 500);
                    
                    // Guardar en localStorage que ya vio el tutorial
                    localStorage.setItem('zoomTutorialSeen', 'true');
                });
            }
        }, 1500); // Mostrar el tutorial después de que se cargue la experiencia
        
        // No mostrar si ya lo ha visto antes
        if (localStorage.getItem('zoomTutorialSeen')) {
            tutorial.style.display = 'none';
        }
    }
    
    // Actualizar indicador de nivel de zoom
    updateZoomIndicator(zoomLevel) {
        if (!this.elements.zoomIndicator || !this.elements.zoomText) return;
        
        // Calcular porcentaje de zoom
        const zoomPercent = Math.round(zoomLevel * 100);
        
        // Actualizar texto
        this.elements.zoomText.textContent = `${zoomPercent}%`;
        
        // Mostrar el indicador
        this.elements.zoomIndicator.style.opacity = '1';
        
        // Ocultar después de un tiempo
        clearTimeout(this.zoomIndicatorTimeout);
        this.zoomIndicatorTimeout = setTimeout(() => {
            this.elements.zoomIndicator.style.opacity = '0';
        }, 1500);
    }
    // Mostrar hint de zoom específico (para rueda de ratón o gestos táctiles)
    showZoomHint() {
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isMobile) {
            this.showGestureHint("Pellizca para hacer zoom");
        } else {
            this.showGestureHint("Usa la rueda del ratón para hacer zoom");
        }
    }

    
    /**
     * Setup event listeners for UI elements
     */
    setupEventListeners() {
        // Close info panel
        const closeInfoBtn = document.getElementById('close-info');
        if (closeInfoBtn) {
            closeInfoBtn.addEventListener('click', () => {
                this.hideInfoPanel();
            });
        }
        
    
        
        // Start experience button
        const startBtn = document.getElementById('start-experience');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.hideInstructions();
            });
        }
        
        // Listen for control events
        if (this.controls) {
            // Item change event
            this.controls.on('itemChange', (index) => {
                this.updateInfoForItem(index);
                this.hideInfoBubble(); // Hide bubble when changing items
            });
            
            // Show/hide info events
            this.controls.on('showInfo', (index) => {
                this.showInfoBubble(index);
            });
            
            this.controls.on('hideInfo', () => {
                this.hideInfoBubble();
            });
            this.controls.on('zoomChange', (zoomLevel) => {
                this.updateZoomIndicator(zoomLevel);
            });
        }
    }
    
    /**
     * Create UI toggle button
     */
    createUIToggleButton() {
        // Create button to show/hide UI
        const toggleButton = document.createElement('button');
        toggleButton.classList.add('ui-toggle-button');
        toggleButton.innerHTML = '👁️';
        toggleButton.title = 'Show/Hide Interface';
        toggleButton.style.position = 'fixed';
        toggleButton.style.top = '20px';
        toggleButton.style.right = '20px';
        toggleButton.style.zIndex = '100';
        toggleButton.style.background = 'rgba(0,0,0,0.5)';
        toggleButton.style.color = 'white';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '50%';
        toggleButton.style.width = '40px';
        toggleButton.style.height = '40px';
        toggleButton.style.display = 'flex';
        toggleButton.style.alignItems = 'center';
        toggleButton.style.justifyContent = 'center';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.transition = 'background-color 0.3s ease';
        toggleButton.style.backdropFilter = 'blur(5px)';
        
        // Add click event
        toggleButton.addEventListener('click', () => {
            this.toggleUIElements();
        });
        
        // Add to document
        document.body.appendChild(toggleButton);
        this.toggleButton = toggleButton;
    }
    
    /**
     * Create reset view button
     */
    createResetButton() {
        // Create reset button
        const resetButton = document.createElement('button');
        resetButton.classList.add('reset-button');
        resetButton.title = 'Reset View';
        resetButton.style.position = 'fixed';
        resetButton.style.bottom = '20px';
        resetButton.style.left = '20px';
        resetButton.style.zIndex = '100';
        resetButton.style.background = 'rgba(0,0,0,0.5)';
        resetButton.style.color = 'white';
        resetButton.style.border = 'none';
        resetButton.style.borderRadius = '50%';
        resetButton.style.width = '40px';
        resetButton.style.height = '40px';
        resetButton.style.display = 'flex';
        resetButton.style.alignItems = 'center';
        resetButton.style.justifyContent = 'center';
        resetButton.style.cursor = 'pointer';
        resetButton.style.transition = 'background-color 0.3s ease';
        resetButton.style.backdropFilter = 'blur(5px)';
        
        // Add click event
        resetButton.addEventListener('click', () => {
            if (this.controls) {
                this.controls.resetCameraView();
            }
        });
        
        // Add to document
        document.body.appendChild(resetButton);
        this.resetButton = resetButton;
    }
    

    
    /**
     * Show UI elements (header and footer)
     */
    showUIElements() {
        if (this.elements.header) {
            this.elements.header.style.opacity = '1';
        }
        
        if (this.elements.footer) {
            this.elements.footer.style.opacity = '1';
        }
        
        this.uiVisible = true;
        
        // Update button icon
        if (this.toggleButton) {
            this.toggleButton.innerHTML = '👁️';
        }
    }
    
    /**
     * Hide UI elements (header and footer)
     */
    hideUIElements() {
        if (this.elements.header) {
            this.elements.header.style.opacity = '0';
        }
        
        if (this.elements.footer) {
            this.elements.footer.style.opacity = '0';
        }
        
        this.uiVisible = false;
        
        // Update button icon
        if (this.toggleButton) {
            this.toggleButton.innerHTML = '👁️‍🗨️';
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
     * Show loading progress
     * @param {Number} progress - Progress value between 0 and 1
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
     * Show gesture hint
     * @param {String} text - Optional text to display
     */
    showGestureHint(text) {
        if (this.elements.gestureHint) {
            if (text) {
                this.elements.gestureHint.textContent = text;
            }
            
            this.elements.gestureHint.classList.add('visible');
            
            // Clear any previous timeout
            if (this.gestureHintTimeout) {
                clearTimeout(this.gestureHintTimeout);
            }
            
            // Make hint more visible on mobile
            this.elements.gestureHint.style.fontSize = this.sizes.isMobile ? '18px' : '16px';
            this.elements.gestureHint.style.padding = this.sizes.isMobile ? '12px 20px' : '10px 16px';
            this.elements.gestureHint.style.backgroundColor = 'rgba(0,0,0,0.7)';
            
            // Hide after 2 seconds
            this.gestureHintTimeout = setTimeout(() => {
                this.elements.gestureHint.classList.remove('visible');
            }, 2000);
        }
    }
    
    /**
     * Show info bubble for swipe-up gesture
     * @param {Number} index - Item index
     */
    showInfoBubble(index) {
        if (!this.elements.infoBubble || !this.world || !this.world.items) return;
        
        // Get current item data instead of using hardcoded items
        const currentItem = this.world.items[index];
        if (!currentItem) return;
        
        // Define item info (can be expanded with additional data if needed)
        const item = {
            title: currentItem.title || 'Sin título',
            description: currentItem.description || 'Sin descripción',
            dimensions: 'Modelo 3D',
            material: 'Modelo GLB',
            year: '2025'
        };
        
        // Update bubble content
        this.elements.bubbleTitle.textContent = item.title;
        this.elements.bubbleDescription.textContent = item.description;
        this.elements.bubbleDimensions.textContent = `Dimensiones: ${item.dimensions}`;
        this.elements.bubbleMaterial.textContent = `Material: ${item.material}`;
        this.elements.bubbleYear.textContent = `Año: ${item.year}`;
        
        // Show bubble with animation
        this.elements.infoBubble.style.bottom = '0';
        this.infoBubbleVisible = true;
    }
    
    /**
     * Hide info bubble
     */
    hideInfoBubble() {
        if (!this.elements.infoBubble) return;
        
        // Hide bubble with animation
        this.elements.infoBubble.style.bottom = '-200px';
        this.infoBubbleVisible = false;
    }
    
    /**
     * Show info panel with artwork details
     * @param {Object} item - Artwork item data
     */
    showInfoPanel(item) {
        if (!this.elements.infoPanel) return;
        
        // Update info panel content
        if (this.elements.infoTitle) {
            this.elements.infoTitle.textContent = item.title || 'Sin título';
        }
        
        if (this.elements.infoDescription) {
            this.elements.infoDescription.textContent = item.description || 'Sin descripción';
        }
        
        // Update optional fields if they exist
        if (this.elements.infoDimensions) {
            this.elements.infoDimensions.textContent = `Dimensiones: ${item.dimensions || 'Modelo 3D'}`;
        }
        
        if (this.elements.infoMaterial) {
            this.elements.infoMaterial.textContent = `Material: ${item.material || 'Modelo GLB'}`;
        }
        
        if (this.elements.infoYear) {
            this.elements.infoYear.textContent = `Año: ${item.year || '2025'}`;
        }
        
        // Show panel
        this.elements.infoPanel.classList.add('active');
    }
    
    /**
     * Hide info panel
     */
    hideInfoPanel() {
        if (this.elements.infoPanel) {
            this.elements.infoPanel.classList.remove('active');
        }
    }
    
    /**
     * Show contact panel
     */
    showContactPanel() {
        if (this.contactSystem) {
            this.contactSystem.showContactCard();
        }
    }
    
    /**
     * Hide contact panel
     */
    hideContactPanel() {
        if (this.contactSystem) {
            this.contactSystem.hideContactCard();
        }
    }
    
    /**
     * Update info panel for the current item
     * @param {Number} index - Item index
     */
    updateInfoForItem(index) {
        // Get the item directly from the World
        if (!this.world || !this.world.items || index >= this.world.items.length) {
            console.warn('No se puede acceder a la información del item:', index);
            return;
        }
        
        // Get the item from the world collection
        const worldItem = this.world.items[index];
        
        // Extract only the needed data (title and description)
        const item = {
            title: worldItem.title,
            description: worldItem.description
        };
        
        // Update info panel with simplified data
        if (this.elements.infoPanel) {
            if (this.elements.infoTitle) {
                this.elements.infoTitle.textContent = item.title || 'Sin título';
            }
            
            if (this.elements.infoDescription) {
                this.elements.infoDescription.textContent = item.description || 'Sin descripción';
            }
            
            // Hide unnecessary elements or show with default values
            if (this.elements.infoDimensions) {
                this.elements.infoDimensions.textContent = 'Dimensiones: Modelo 3D';
            }
            
            if (this.elements.infoMaterial) {
                this.elements.infoMaterial.textContent = 'Material: Modelo GLB';
            }
            
            if (this.elements.infoYear) {
                this.elements.infoYear.textContent = 'Año: 2025';
            }
            
            // Show panel
            this.elements.infoPanel.classList.add('active');
        }
    }
    
    /**
     * Update UI on resize
     */
    resize() {
        // Adjust UI elements for mobile/desktop
        if (this.sizes.isMobile) {
            // Mobile-specific UI adjustments
            if (this.elements.infoBubble) {
                this.elements.infoBubble.style.padding = '15px';
                this.elements.bubbleTitle.style.fontSize = '18px';
                this.elements.bubbleDescription.style.fontSize = '14px';
            }
        } else {
            // Desktop-specific UI adjustments
            if (this.elements.infoBubble) {
                this.elements.infoBubble.style.padding = '20px';
                this.elements.bubbleTitle.style.fontSize = '20px';
                this.elements.bubbleDescription.style.fontSize = '16px';
            }
        }
    }
    
    /**
     * Update UI on each frame
     */
    update() {
        // Any animations or updates needed for UI elements
    }
}