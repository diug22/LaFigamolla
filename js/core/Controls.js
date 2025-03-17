/**
 * Controls class
 * Handles user interactions (touch, mouse) for artwork navigation and viewing
 */

import * as THREE from 'three';

export class Controls {
    constructor(experience) {
        this.experience = experience;
        this.camera = this.experience.camera;
        this.sizes = this.experience.sizes;
        this.time = this.experience.time;
        this.canvas = this.experience.canvas;
        this.ui = this.experience.ui;
        
        // Control states
        this.isActive = true;
        this.isDragging = false;
        this.isZooming = false;
        this.currentIndex = 0;
        this.totalItems = 0; // Will be set by World class
        
        // Touch/mouse positions
        this.touchStart = { x: 0, y: 0 };
        this.touchCurrent = { x: 0, y: 0 };
        this.touchDelta = { x: 0, y: 0 };
        
        // Pinch/zoom
        this.pinchStart = 0;
        this.pinchCurrent = 0;
        this.pinchDelta = 0;
        
        // Camera controls
        this.cameraRotation = { x: 0, y: 0 };
        this.cameraZoom = 1;
        
        // Swipe detection
        this.swipeThreshold = 50;
        this.swipeVerticalThreshold = 50;
        this.swipeDirection = null;
        this.swipeVerticalDirection = null;
        
        // Camera settings
        this.defaultDistance = 5;
        this.minDistance = 2;
        this.maxDistance = 8;
        this.rotationSensitivity = 0.005;
        this.zoomSensitivity = 0.001;
        this.dampingFactor = 0.95;
        
        // Camera motion
        this.momentum = { x: 0, y: 0 };
        this.isInertiaActive = true;
        
        // Zoom settings
        this.zoomConfig = {
            minZoom: 0.5,            // Factor mínimo de zoom (1 = 100%)
            maxZoom: 3.0,            // Factor máximo de zoom (3 = 300%)
            defaultZoom: 1.0,        // Zoom por defecto
            currentZoom: 1.0,        // Zoom actual
            targetZoom: 1.0,         // Zoom objetivo para animación
            zoomSmoothness: 0.08,    // Suavidad de animación (0.08 = suave, 0.2 = más rápido)
            mouseWheelSpeed: 0.05,   // Velocidad de zoom con rueda de ratón
            pinchSpeed: 0.01,        // Velocidad de zoom con pellizco en móvil
            zoomCenter: new THREE.Vector2(0, 0),  // Centro de zoom para zoom a un punto
            zoomCenterObject: null,  // Objeto que está en el centro del zoom
            zoomAnimation: null,     // Para gestionar la animación de zoom
            zoomInProgress: false,   // Si hay un zoom en progreso
            zoomHintShown: false     // Si se ha mostrado el hint de zoom
        };
        
        // Initial camera position/target for resets
        this.initialCameraPosition = new THREE.Vector3(0, 0, this.defaultDistance);
        this.initialLookAtPosition = new THREE.Vector3(0, 0, 0);
        
        // Event callbacks
        this.callbacks = {};
        
        // Setup
        this.setupEventListeners();
        this.setupOrbitControls();
    }
    
    /**
     * Setup additional orbit-like controls for smoother rotation
     */
    setupOrbitControls() {
        this.orbitTargetPosition = new THREE.Vector3(0, 0, 0);
        this.orbitDistance = this.defaultDistance;
        this.orbitRotation = { x: 0, y: 0 };
        this.orbitVelocity = { x: 0, y: 0 };
        this.damping = 0.92;
    }
    
    /**
     * Setup event listeners for user interactions
     */
    setupEventListeners() {
        // Touch events
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
        
        // Mouse events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // Wheel event for zoom
        this.canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
        
        // Double-tap/click for reset
        this.lastTapTime = 0;
        this.canvas.addEventListener('click', this.onCanvasClick.bind(this));
        
        // Key events for additional controls
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }
    
    /**
     * Handle key down events
     */
    onKeyDown(event) {
        if (!this.isActive) return;
        
        switch (event.key) {
            case 'ArrowLeft':
                this.previousItem();
                break;
            case 'ArrowRight':
                this.nextItem();
                break;
            case 'ArrowUp':
                this.showArtworkInfo();
                break;
            case 'ArrowDown':
                this.hideArtworkInfo();
                break;
            case 'r':
            case 'R':
                this.resetCameraView();
                break;
            default:
                break;
        }
    }
    
    /**
     * Handle canvas click for double-click detection
     */
    onCanvasClick(event) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.lastTapTime;
        
        if (tapLength < 300 && tapLength > 0) {
            // Double click/tap detected
            this.resetCameraView();
            event.preventDefault();
        }
        
        this.lastTapTime = currentTime;
    }
    
    /**
     * Handle touch start event
     */
    onTouchStart(event) {
        if (!this.isActive) return;
        
        event.preventDefault();
        
        // Reset momentum
        this.momentum = { x: 0, y: 0 };
        
        // Single touch (drag)
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.isZooming = false;
            this.touchStart.x = event.touches[0].clientX;
            this.touchStart.y = event.touches[0].clientY;
            this.touchCurrent.x = this.touchStart.x;
            this.touchCurrent.y = this.touchStart.y;
            this.touchDelta.x = 0;
            this.touchDelta.y = 0;
            
            // Almacenar tiempo para posible doble tap
            this.touchStartTime = Date.now();
            
            // Mostrar hint de zoom si es la primera interacción del usuario
            if (!this.zoomConfig.zoomHintShown) {
                setTimeout(() => {
                    this.showGestureHint("Pinch to zoom, double tap to focus");
                    this.zoomConfig.zoomHintShown = true;
                }, 1000);
            }
        }
        // Double touch (pinch)
        else if (event.touches.length === 2) {
            this.isDragging = false;
            this.isZooming = true;
            
            // Reiniciar valores de pellizco
            this.pinchStart = 0;
            this.zoomConfig.zoomStartValue = this.zoomConfig.currentZoom;
            
            // Procesar el primer evento de pellizco
            this.handlePinchZoom(event);
            
            // Mostrar hint visual de gesto
            this.showGestureHint("Pinch to zoom in/out");
        }
    }
    
    /**
     * Handle touch move event
     */
    onTouchMove(event) {
        if (!this.isActive) return;
        
        event.preventDefault();

        if (this.isZooming && event.touches.length === 2) {
            this.handlePinchZoom(event);
            return;
        }
        
        // Single touch (drag)
        if (this.isDragging && event.touches.length === 1) {
            const now = Date.now();
            const x = event.touches[0].clientX;
            const y = event.touches[0].clientY;
            
            this.touchCurrent.x = x;
            this.touchCurrent.y = y;
            
            // Calculate delta with reduced movement for smoother control
            this.touchDelta.x = (this.touchCurrent.x - this.touchStart.x) * 0.8;
            this.touchDelta.y = (this.touchCurrent.y - this.touchStart.y) * 0.8;
            
            // Calculate momentum with reduced acceleration
            if (now - this.lastPosition.time > 10) {
                this.momentum.x = (x - this.lastPosition.x) * 0.02;
                this.momentum.y = (y - this.lastPosition.y) * 0.02;
                
                this.lastPosition = {
                    x: x,
                    y: y,
                    time: now
                };
            }
            
            // Detect horizontal swipe direction (for artwork navigation)
            if (Math.abs(this.touchDelta.x) > Math.abs(this.touchDelta.y)) {
                if (this.touchDelta.x > this.swipeThreshold) {
                    this.swipeDirection = 'right';
                    this.swipeVerticalDirection = null;
                } else if (this.touchDelta.x < -this.swipeThreshold) {
                    this.swipeDirection = 'left';
                    this.swipeVerticalDirection = null;
                }
            } 
            // Detect vertical swipe direction (for information panel)
            else {
                if (this.touchDelta.y > this.swipeVerticalThreshold) {
                    this.swipeVerticalDirection = 'down';
                    this.swipeDirection = null;
                } else if (this.touchDelta.y < -this.swipeVerticalThreshold) {
                    this.swipeVerticalDirection = 'up';
                    this.swipeDirection = null;
                }
            }
            
            // If not swiping, apply rotation to camera or model
            if (!this.swipeDirection && !this.swipeVerticalDirection) {
                const currentItem = this.getCurrentItem();
                
                if (currentItem && currentItem.handleManualRotation) {
                    // Pass rotation to item
                    currentItem.handleManualRotation(this.momentum.x * 200, this.momentum.y * 200);
                } else {
                    // Apply to camera
                    this.applyTouchRotation();
                }
            }
        }
    }
    
    /**
     * Handle touch end event
     */
    onTouchEnd(event) {
        if (!this.isActive) return;
        
        const now = Date.now();
        const touchDuration = now - this.touchStartTime;
        
        // Detect quick tap (for double tap detection)
        if (touchDuration < 300 && Math.abs(this.touchDelta.x) < 10 && Math.abs(this.touchDelta.y) < 10) {
            const currentTime = now;
            const tapLength = currentTime - this.lastTapTime;
            
            if (tapLength < 300 && tapLength > 0) {
                // Double tap detected
                this.onDoubleTap(this.touchCurrent.x, this.touchCurrent.y);
                event.preventDefault();
            }
            
            this.lastTapTime = currentTime;
        } 
        // Handle swipe with reduced sensitivity (for more intentional swipes)
        else if (touchDuration < 400) {
            // Handle horizontal swipe for artwork navigation
            if (this.swipeDirection === 'left' && Math.abs(this.touchDelta.x) > this.swipeThreshold * 1.2) {
                this.nextItem();
            } else if (this.swipeDirection === 'right' && Math.abs(this.touchDelta.x) > this.swipeThreshold * 1.2) {
                this.previousItem();
            }
            // Handle vertical swipe for artwork information
            else if (this.swipeVerticalDirection === 'up' && Math.abs(this.touchDelta.y) > this.swipeVerticalThreshold * 1.2) {
                this.showArtworkInfo();
            } else if (this.swipeVerticalDirection === 'down' && Math.abs(this.touchDelta.y) > this.swipeVerticalThreshold * 1.2) {
                this.hideArtworkInfo();
            }
        }
        
        // Reset states but keep momentum for smooth deceleration
        this.isDragging = false;
        this.isZooming = false;
        this.pinchDelta = 0;
        this.swipeDirection = null;
        this.swipeVerticalDirection = null;
    }
    
    /**
     * Handle double tap for quick zoom
     */
    onDoubleTap(x, y) {
        // Obtener objeto en la posición del doble tap
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -((y / window.innerHeight) * 2 - 1)
        );
        
        raycaster.setFromCamera(mouse, this.camera.instance);
        
        // Buscar intersecciones con objetos en la escena
        const currentItem = this.getCurrentItem();
        if (!currentItem || !currentItem.mesh) return;
        
        // Decidir si hacer zoom in o out
        if (this.zoomConfig.currentZoom > 1.5) {
            // Ya estamos en zoom in, hacer zoom out
            this.zoomConfig.targetZoom = this.zoomConfig.defaultZoom;
            this.zoomConfig.zoomCenterObject = null;
        } else {
            // Hacer zoom in hacia el objeto
            this.zoomToObject(currentItem.mesh, 2.5);
        }
        
        // Iniciar animación
        this.startZoomAnimation();
        
        // Mostrar indicador
        this.showZoomIndicator(this.zoomConfig.targetZoom);
    }
    
    /**
     * Zoom to a specific point on screen
     */
    zoomToPoint(x, y) {
        if (!this.camera) return;
        
        // Apply a focused zoom
        this.cameraZoom = Math.max(
            this.minDistance / this.defaultDistance, 
            this.cameraZoom * 0.5
        );
        
        // Apply the zoom
        this.applyTouchRotation();
    }
    
    /**
     * Handle mouse down event
     */
    onMouseDown(event) {
        if (!this.isActive) return;
        
        this.isDragging = true;
        this.touchStart.x = event.clientX;
        this.touchStart.y = event.clientY;
        this.touchCurrent.x = this.touchStart.x;
        this.touchCurrent.y = this.touchStart.y;
        this.touchDelta.x = 0;
        this.touchDelta.y = 0;
        this.swipeDirection = null;
        
        // Reset momentum
        this.momentum = { x: 0, y: 0 };
        
        // Store last position for momentum
        this.lastPosition = {
            x: this.touchStart.x,
            y: this.touchStart.y,
            time: Date.now()
        };
    }

    /**
     * Get the current artwork item
     * @returns {Object} The current artwork item or null
     */
    getCurrentItem() {
        if (this.experience && this.experience.world && 
            this.experience.world.items && 
            this.currentIndex < this.experience.world.items.length) {
            return this.experience.world.items[this.currentIndex];
        }
        return null;
    }
    
    /**
     * Handle mouse move event
     */
    onMouseMove(event) {
        if (!this.isActive || !this.isDragging) return;
        
        const now = Date.now();
        const x = event.clientX;
        const y = event.clientY;
        
        this.touchCurrent.x = x;
        this.touchCurrent.y = y;
        
        // Calculate delta
        this.touchDelta.x = this.touchCurrent.x - this.touchStart.x;
        this.touchDelta.y = this.touchCurrent.y - this.touchStart.y;
        
        // Calculate momentum
        if (now - this.lastPosition.time > 20) {
            this.momentum.x = (x - this.lastPosition.x) * 0.01;
            this.momentum.y = (y - this.lastPosition.y) * 0.01;
            
            this.lastPosition = {
                x: x,
                y: y,
                time: now
            };
        }
        
        // Detect horizontal swipe direction (for artwork navigation)
        if (Math.abs(this.touchDelta.x) > Math.abs(this.touchDelta.y)) {
            if (this.touchDelta.x > this.swipeThreshold) {
                this.swipeDirection = 'right';
                this.swipeVerticalDirection = null;
            } else if (this.touchDelta.x < -this.swipeThreshold) {
                this.swipeDirection = 'left';
                this.swipeVerticalDirection = null;
            }
        }
        // Detect vertical swipe direction (for information panel)
        else {
            if (this.touchDelta.y > this.swipeVerticalThreshold) {
                this.swipeVerticalDirection = 'down';
                this.swipeDirection = null;
            } else if (this.touchDelta.y < -this.swipeVerticalThreshold) {
                this.swipeVerticalDirection = 'up';
                this.swipeDirection = null;
            }
        }
        
        if (!this.swipeDirection && !this.swipeVerticalDirection) {
            // Check if current item has custom rotation handler
            const currentItem = this.getCurrentItem();
            
            if (currentItem && currentItem.handleManualRotation) {
                currentItem.handleManualRotation(this.momentum.x * 200, this.momentum.y * 200);
            } else {
                this.applyTouchRotation();
            }
        }
    }
    
    /**
     * Handle mouse up event
     */
    onMouseUp(event) {
        if (!this.isActive) return;
        
        // Handle horizontal swipe for artwork navigation
        if (this.swipeDirection === 'left') {
            this.nextItem();
        } else if (this.swipeDirection === 'right') {
            this.previousItem();
        }
        // Handle vertical swipe for artwork information
        else if (this.swipeVerticalDirection === 'up') {
            this.showArtworkInfo();
        } else if (this.swipeVerticalDirection === 'down') {
            this.hideArtworkInfo();
        }
        
        // Reset state but keep momentum for smooth deceleration
        this.isDragging = false;
        this.swipeDirection = null;
        this.swipeVerticalDirection = null;
    }
    
    /**
     * Handle mouse wheel event for zoom
     */
    onWheel(event) {
        if (!this.isActive) return;
        
        event.preventDefault();
        
        // Dirección de scroll (+1 hacia abajo, -1 hacia arriba)
        const direction = Math.sign(event.deltaY);
        
        // Calcular velocidad basada en la velocidad de la rueda
        const speed = this.zoomConfig.mouseWheelSpeed * Math.min(Math.abs(event.deltaY), 100) / 100;
        
        // Calcular nuevo zoom objetivo
        const newZoom = this.zoomConfig.targetZoom * (1 - direction * speed);
        
        // Limitar zoom al mínimo y máximo
        this.zoomConfig.targetZoom = Math.max(
            this.zoomConfig.minZoom,
            Math.min(this.zoomConfig.maxZoom, newZoom)
        );
        
        // Almacenar posición del ratón para zoom hacia ese punto
        this.zoomConfig.zoomCenter.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.zoomConfig.zoomCenter.y = -((event.clientY / window.innerHeight) * 2 - 1);
        
        // Iniciar animación de zoom si no está en progreso
        this.startZoomAnimation();
        
        // Notificar cambio de zoom mediante un evento
        this.emit('zoomChange', this.zoomConfig.targetZoom);
        
        // Mostrar hint visual de zoom si es la primera vez
        if (!this.zoomConfig.zoomHintShown) {
            this.showGestureHint(direction > 0 ? "Zoom out" : "Zoom in");
            this.zoomConfig.zoomHintShown = true;
        }
    }
    
    /**
     * Apply rotation based on touch/mouse movement
     */
    applyTouchRotation() {
        if (!this.camera || (!this.isDragging && !this.isZooming)) return;
        
        // Special case for pinch zoom
        if (this.isZooming && !this.isDragging) {
            const distance = this.defaultDistance * this.cameraZoom;
            const cameraX = Math.sin(this.cameraRotation.y) * Math.cos(this.cameraRotation.x) * distance;
            const cameraY = Math.sin(this.cameraRotation.x) * distance;
            const cameraZ = Math.cos(this.cameraRotation.y) * Math.cos(this.cameraRotation.x) * distance;
            
            const newPosition = new THREE.Vector3(
                cameraX + this.initialLookAtPosition.x,
                cameraY + this.initialLookAtPosition.y,
                cameraZ + this.initialLookAtPosition.z
            );
            
            if (this.camera.moveTo) {
                this.camera.moveTo(newPosition, this.initialLookAtPosition, 0.3);
            }
            return;
        }
        
        // For normal dragging, calculate rotation
        const rotX = this.touchDelta.y * this.rotationSensitivity * 1.5;
        const rotY = this.touchDelta.x * this.rotationSensitivity * 1.5;
        
        // Update rotation with smooth transitions
        this.cameraRotation.x = THREE.MathUtils.lerp(this.cameraRotation.x, this.cameraRotation.x + rotX, 0.5);
        this.cameraRotation.y = THREE.MathUtils.lerp(this.cameraRotation.y, this.cameraRotation.y + rotY, 0.5);
        
        // Limit vertical rotation
        this.cameraRotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, this.cameraRotation.x));
        
        // Calculate new camera position
        const distance = this.defaultDistance * this.cameraZoom;
        const cameraX = Math.sin(this.cameraRotation.y) * Math.cos(this.cameraRotation.x) * distance;
        const cameraY = Math.sin(this.cameraRotation.x) * distance;
        const cameraZ = Math.cos(this.cameraRotation.y) * Math.cos(this.cameraRotation.x) * distance;
        
        // Create new position vector
        const newPosition = new THREE.Vector3(
            cameraX + this.initialLookAtPosition.x,
            cameraY + this.initialLookAtPosition.y,
            cameraZ + this.initialLookAtPosition.z
        );
        
        // Update camera position
        if (this.camera.moveTo) {
            this.camera.moveTo(newPosition, this.initialLookAtPosition, 0.2);
        }
    }
    
    /**
     * Apply zoom based on pinch/wheel
     */
    applyZoom() {
        if (!this.camera) return;
        
        // Calculate zoom factor
        const zoomFactor = this.pinchDelta * this.zoomSensitivity;
        
        // Calculate target zoom with limits
        const targetZoom = Math.max(
            this.minDistance / this.defaultDistance,
            Math.min(
                this.maxDistance / this.defaultDistance,
                this.cameraZoom - zoomFactor
            )
        );
        
        // Smooth transition to target zoom
        this.cameraZoom = THREE.MathUtils.lerp(this.cameraZoom, targetZoom, 0.2);
        
        // Reset pinch delta
        this.pinchDelta = 0;
        
        // Apply zoom by updating camera position
        this.applyTouchRotation();
    }
    
    // Reemplaza la función de pinch zoom existente por esta mejorada
    handlePinchZoom(event) {
        if (!this.isActive || !this.isZooming) return;
        
        // Calcular distancia actual entre dedos
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si es el primer evento, inicializar
        if (this.pinchStart === 0) {
            this.pinchStart = distance;
            this.zoomConfig.zoomStartValue = this.zoomConfig.currentZoom;
            return;
        }
        
        // Calcular factor de zoom basado en la diferencia de distancia
        const pinchRatio = distance / this.pinchStart;
        const zoomDelta = (pinchRatio - 1) * this.zoomConfig.pinchSpeed;
        
        // Aplicar zoom basado en el movimiento de pellizco
        const newZoom = this.zoomConfig.zoomStartValue * (1 + zoomDelta * 20);
        
        // Limitar al min/max zoom
        this.zoomConfig.targetZoom = Math.max(
            this.zoomConfig.minZoom,
            Math.min(this.zoomConfig.maxZoom, newZoom)
        );
        
        // Calcular el centro del pellizco para hacer zoom hacia ese punto
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        this.zoomConfig.zoomCenter.x = (centerX / window.innerWidth) * 2 - 1;
        this.zoomConfig.zoomCenter.y = -((centerY / window.innerHeight) * 2 - 1);
        
        // Iniciar animación de zoom
        this.startZoomAnimation();
        
        // Emitir evento de cambio de zoom
        this.emit('zoomChange', this.zoomConfig.targetZoom);
        
        // Mostrar indicador de zoom en pantalla
        this.showZoomIndicator(this.zoomConfig.targetZoom);
    }

    // Nueva función para iniciar la animación de zoom
    startZoomAnimation() {
        // Marcar que hay un zoom en progreso
        this.zoomConfig.zoomInProgress = true;
        
        // Cancelar animación anterior si existe
        if (this.zoomConfig.zoomAnimation) {
            cancelAnimationFrame(this.zoomConfig.zoomAnimation);
        }
        
        // Función para la animación del zoom
        const animateZoom = () => {
            // Calcular interpolación suave entre zoom actual y objetivo
            this.zoomConfig.currentZoom += (this.zoomConfig.targetZoom - this.zoomConfig.currentZoom) 
                * this.zoomConfig.zoomSmoothness;
            
            // Actualizar la cámara basado en el nuevo zoom
            this.updateCameraZoom();
            
            // Continuar la animación si aún no estamos lo suficientemente cerca del objetivo
            if (Math.abs(this.zoomConfig.currentZoom - this.zoomConfig.targetZoom) > 0.001) {
                this.zoomConfig.zoomAnimation = requestAnimationFrame(animateZoom);
            } else {
                // Finalizar la animación
                this.zoomConfig.zoomInProgress = false;
                this.zoomConfig.currentZoom = this.zoomConfig.targetZoom;
                this.updateCameraZoom();
            }
        };
        
        // Iniciar la animación
        this.zoomConfig.zoomAnimation = requestAnimationFrame(animateZoom);
    }

    // Nueva función para actualizar la cámara durante el zoom
    updateCameraZoom() {
        if (!this.camera) return;
        
        // Obtener factor de zoom relativo al valor predeterminado
        const zoomFactor = this.zoomConfig.currentZoom / this.zoomConfig.defaultZoom;
        
        // Calcular distancia basada en el zoom
        const distance = this.defaultDistance / zoomFactor;
        
        // Posición actual de la cámara
        const cameraPos = new THREE.Vector3();
        this.camera.instance.getWorldPosition(cameraPos);
        
        // Dirección de la cámara
        const cameraDir = new THREE.Vector3();
        this.camera.instance.getWorldDirection(cameraDir);
        
        // Calcular nueva posición basada en zoom y centro
        let newPosition;
        
        if (this.zoomConfig.zoomCenterObject) {
            // Zoom hacia un objeto específico
            const targetPos = new THREE.Vector3();
            this.zoomConfig.zoomCenterObject.getWorldPosition(targetPos);
            
            // Calcular dirección hacia el objeto
            const direction = new THREE.Vector3()
                .subVectors(targetPos, cameraPos)
                .normalize();
            
            // Nueva posición
            newPosition = new THREE.Vector3()
                .copy(targetPos)
                .sub(direction.multiplyScalar(distance));
        } else {
            // Zoom normal
            const cameraX = Math.sin(this.cameraRotation.y) * Math.cos(this.cameraRotation.x) * distance;
            const cameraY = Math.sin(this.cameraRotation.x) * distance;
            const cameraZ = Math.cos(this.cameraRotation.y) * Math.cos(this.cameraRotation.x) * distance;
            
            newPosition = new THREE.Vector3(
                cameraX + this.initialLookAtPosition.x,
                cameraY + this.initialLookAtPosition.y,
                cameraZ + this.initialLookAtPosition.z
            );
        }
        
        // Aplicar la nueva posición con movimiento suave
        if (this.camera.moveTo) {
            // Duración más corta para que se sienta más responsivo
            const duration = 0.15;
            this.camera.moveTo(newPosition, this.initialLookAtPosition, duration);
        }
    }

    // Mostrar indicador de nivel de zoom en pantalla
    showZoomIndicator(zoomLevel) {
        // Verificar si el UI existe
        if (!this.ui) return;
        
        // Calcular porcentaje de zoom
        const zoomPercent = Math.round(zoomLevel * 100);
        
        // Mostrar hint con el nivel de zoom
        this.showGestureHint(`Zoom: ${zoomPercent}%`);
    }

    // Nuevo método para hacer zoom hacia un objeto específico (llamado cuando se da doble click)
    zoomToObject(object, targetZoom = null) {
        if (!object || !this.camera) return;
        
        // Guardar objeto como centro de zoom
        this.zoomConfig.zoomCenterObject = object;
        
        // Establecer nivel de zoom, o usar 2.5x como predeterminado
        this.zoomConfig.targetZoom = targetZoom || 2.5;
        
        // Iniciar animación
        this.startZoomAnimation();
        
        // Emitir evento de zoom
        this.emit('zoomChange', this.zoomConfig.targetZoom);
        
        // Mostrar indicador
        this.showZoomIndicator(this.zoomConfig.targetZoom);
        
        // Cancelar el centro de zoom después de completar la animación
        setTimeout(() => {
            this.zoomConfig.zoomCenterObject = null;
        }, 1000);
    }



    
    /**
     * Navigate to the next item
     */
    nextItem() {
        if (this.currentIndex < this.totalItems - 1) {
            const oldIndex = this.currentIndex;
            this.currentIndex++;
            
            this.emit('itemChange', this.currentIndex);
            
            // Reset camera position and rotation with a horizontal transition
            this.resetCameraViewHorizontal('left');
            
            // Update UI
            this.updateNavDots();
            
            // Show gesture hint
            this.showGestureHint("Swipe left/right to navigate");
        }
    }
    
    /**
     * Navigate to the previous item
     */
    previousItem() {
        if (this.currentIndex > 0) {
            const oldIndex = this.currentIndex;
            this.currentIndex--;
            
            this.emit('itemChange', this.currentIndex);
            
            // Reset camera position and rotation with a horizontal transition
            this.resetCameraViewHorizontal('right');
            
            // Update UI
            this.updateNavDots();
            
            // Show gesture hint
            this.showGestureHint("Swipe left/right to navigate");
        }
    }
    
    /**
     * Show artwork information (triggered by swiping up)
     */
    showArtworkInfo() {
        // Emit event for UI to show info panel
        this.emit('showInfo', this.currentIndex);
        
        // Show gesture hint
        this.showGestureHint("Swipe down to hide info");
    }
    
    /**
     * Hide artwork information (triggered by swiping down)
     */
    hideArtworkInfo() {
        // Emit event for UI to hide info panel
        this.emit('hideInfo');
        
        // Show gesture hint
        this.showGestureHint("Swipe up to show info");
    }
    
    /**
     * Reset camera view with horizontal transition effect
     */
    resetCameraViewHorizontal(direction) {
        // Reset rotation and zoom
        this.cameraRotation = { x: 0, y: 0 };
        this.cameraZoom = 1;
        this.momentum = { x: 0, y: 0 };
        
        // Emit event for world to transition the artwork
        this.emit('horizontalTransition', direction);
        
        // Apply camera transition
        if (this.camera && this.camera.moveTo) {
            this.camera.moveTo(
                this.initialCameraPosition,
                this.initialLookAtPosition,
                0.8
            );
        }
    }
    
    /**
     * Reset camera to default view
     */
    resetCameraView() {
        this.cameraRotation = { x: 0, y: 0 };
        this.cameraZoom = 1;
        this.momentum = { x: 0, y: 0 };
        
        if (this.camera && this.camera.moveTo) {
            this.camera.moveTo(
                this.initialCameraPosition,
                this.initialLookAtPosition,
                0.7
            );
        }
    }
    
    /**
     * Update navigation dots in the UI
     */
    updateNavDots() {
        const navDots = document.getElementById('nav-dots');
        if (!navDots) return;
        
        // Clear existing dots
        navDots.innerHTML = '';
        
        // Create new dots
        for (let i = 0; i < this.totalItems; i++) {
            const dot = document.createElement('div');
            dot.className = 'nav-dot';
            if (i === this.currentIndex) {
                dot.classList.add('active');
            }
            
            // Add click event
            dot.addEventListener('click', () => {
                this.currentIndex = i;
                this.emit('itemChange', this.currentIndex);
                this.resetCameraView();
                this.updateNavDots();
            });
            
            navDots.appendChild(dot);
        }
    }
    
    /**
     * Show gesture hint with improved visibility
     */
    showGestureHint(text) {
        if (this.ui && this.ui.showGestureHint) {
            this.ui.showGestureHint(text);
        }
    }
    
    /**
     * Set total number of items
     */
    setTotalItems(count) {
        this.totalItems = count;
        this.updateNavDots();
    }
    
    /**
     * Apply momentum effect for smoother camera movement
     */
    applyMomentum() {
        if (!this.isInertiaActive || this.isDragging) return;
        
        // Reduce momentum over time
        this.momentum.x *= this.dampingFactor;
        this.momentum.y *= this.dampingFactor;
        
        // Only apply if momentum is significant
        if (Math.abs(this.momentum.x) < 0.01 && Math.abs(this.momentum.y) < 0.01) return;
        
        // Apply momentum to rotation
        this.cameraRotation.y += this.momentum.x * this.rotationSensitivity * 2;
        this.cameraRotation.x += this.momentum.y * this.rotationSensitivity * 2;
        
        // Limit vertical rotation
        this.cameraRotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, this.cameraRotation.x));
        
        // Update camera position
        this.applyTouchRotation();
    }
    
    /**
     * Update controls on each frame
     */
    update() {
        // Apply momentum effect for smooth deceleration
        this.applyMomentum();
    }
    
    /**
     * Event emitter methods
     */
    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
        
        return this;
    }
    
    off(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
        }
        
        return this;
    }
    
    emit(event, ...args) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(...args));
        }
        
        return this;
    }
}