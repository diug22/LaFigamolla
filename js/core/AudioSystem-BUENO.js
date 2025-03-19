/**
 * AudioSystem class
 * Maneja la reproducción de música y efectos de sonido para la experiencia Laqueno
 */

export class AudioSystem {
    constructor(experience) {
        this.experience = experience;
        
        // Estado del audio
        this.musicEnabled = true;
        this.volume = 0.8; // Volumen por defecto (0-1)
        this.currentTrack = null;
        this.isTransitioning = false;
        
        // Elementos de la interfaz
        this.audioButton = null;
        
        // Contexto de audio
        this.audioContext = null;
        this.gainNode = null;
        this.tracks = {};
        this.soundEffects = {};
        
        // Configuración
        this.config = {
            fadeTime: 1.0, // Tiempo de transición en segundos
            musicVolume:1.0, // Volumen para música
            effectsVolume: 0.7 // Volumen para efectos
        };
        
        // Inicializar el sistema
        this.init();
    }
    
    /**
     * Inicializar el sistema de audio
     */
    init() {
        console.log('Inicializando sistema de audio');
        
        // Crear el botón de control de audio
        //this.createAudioButton();
        
        // Inicializar el sistema de audio cuando el usuario interactúa
        // (los navegadores requieren interacción del usuario antes de permitir reproducción)
        const startAudio = () => {
            // Solo inicializar una vez
            if (this.audioContext) return;
            
            this.initAudioContext();
            this.loadTracks();
            
            // Reproducir música automáticamente después de la carga
            
            this.playTrack('ambient');
            
        };
        
        window.addEventListener('click', startAudio);
        window.addEventListener('touchstart', startAudio);
    }
    
    /**
     * Inicializar el contexto de audio
     */
    initAudioContext() {
        try {
            // Crear contexto de audio
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Crear nodo de ganancia principal para control de volumen
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.volume;
            this.gainNode.connect(this.audioContext.destination);
            
            console.log('Contexto de audio inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar el contexto de audio:', error);
        }
    }
    
    /**
     * Cargar todas las pistas de audio
     */
    loadTracks() {
        // Definir las pistas a cargar
        const trackList = [
            { id: 'ambient', url: 'public/audio/background.mp3' }
            //{ id: 'transition', url: 'public/audio/transition-sound.mp3' }
        ];
        
        // Definir efectos de sonido
        /*const effectsList = [
            { id: 'click', url: 'public/audio/click-sound.mp3' },
            { id: 'hover', url: 'public/audio/hover-sound.mp3' }
        ];*/
        
        // Cargar cada pista
        trackList.forEach(track => {
            this.loadAudio(track.url, buffer => {
                this.tracks[track.id] = {
                    buffer: buffer,
                    source: null,
                    gainNode: null
                };
            });
        });
        
        // Cargar cada efecto de sonido
        /*effectsList.forEach(effect => {
            this.loadAudio(effect.url, buffer => {
                this.soundEffects[effect.id] = {
                    buffer: buffer
                };
            });
        });*/
    }
    
    /**
     * Cargar un archivo de audio
     * @param {string} url - URL del archivo de audio
     * @param {Function} callback - Función a llamar cuando se complete la carga
     */
    loadAudio(url, callback) {
        if (!this.audioContext) {
            console.warn('Contexto de audio no inicializado');
            return;
        }
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                callback(audioBuffer);
                console.log(`Audio cargado: ${url}`);
            })
            .catch(error => {
                console.error(`Error al cargar el audio ${url}:`, error);
            });
    }
    
    /**
     * Crear el botón de control de audio
     */
    createAudioButton() {
        // Eliminar botón existente si hay uno
        const existingButton = document.getElementById('audio-control');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Crear el nuevo botón
        const button = document.createElement('button');
        button.id = 'audio-control';
        button.className = 'audio-control';
        button.innerHTML = `
            <svg class="audio-icon audio-on" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
            <svg class="audio-icon audio-off" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
        `;
        
        // Agregar estilos
        const style = document.createElement('style');
        style.textContent = `
            .audio-control {
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: rgba(43, 46, 31, 0.7);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100;
                transition: background-color 0.3s;
            }
            
            .audio-control:hover {
                background-color: rgba(43, 46, 31, 0.9);
            }
            
            .audio-icon {
                width: 20px;
                height: 20px;
                color: #e4e3d3;
                transition: opacity 0.3s;
            }
            
            .audio-on {
                opacity: 1;
            }
            
            .audio-off {
                opacity: 0;
                position: absolute;
            }
            
            .audio-control.muted .audio-on {
                opacity: 0;
            }
            
            .audio-control.muted .audio-off {
                opacity: 1;
            }
            
            @media (max-width: 768px) {
                .audio-control {
                    bottom: 70px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(button);
        
        // Guardar referencia
        this.audioButton = button;
        
        // Agregar evento click para silenciar/activar
        button.addEventListener('click', () => {
            this.toggleMute();
            this.playEffect('click');
        });
    }
    
    /**
     * Silenciar o activar el audio
     */
    toggleMute() {
        this.musicEnabled = !this.musicEnabled;
        
        // Actualizar la clase del botón
        if (this.audioButton) {
            if (this.musicEnabled) {
                this.audioButton.classList.remove('muted');
            } else {
                this.audioButton.classList.add('muted');
            }
        }
        
        // Actualizar volumen con transición suave
        if (this.gainNode) {
            const targetVolume = this.musicEnabled ? this.volume : 0;
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.audioContext.currentTime);
            this.gainNode.gain.linearRampToValueAtTime(targetVolume, this.audioContext.currentTime + 0.5);
        }
    }
    
    /**
     * Reproducir una pista específica
     * @param {string} trackId - Identificador de la pista a reproducir
     */
    playTrack(trackId) {
        if (!this.audioContext || !this.tracks[trackId]) {
            console.warn(`No se puede reproducir la pista: ${trackId}`);
            return;
        }
        
        // Si hay una pista actual, hacer transición
        if (this.currentTrack) {
            this.crossFade(this.currentTrack, trackId);
        } else {
            // Iniciar reproducción directa
            this.startTrack(trackId);
        }
        
        this.currentTrack = trackId;
    }
    
    /**
     * Iniciar reproducción de una pista
     * @param {string} trackId - Identificador de la pista
     * @param {number} initialVolume - Volumen inicial (0-1)
     */
    startTrack(trackId, initialVolume = this.config.musicVolume) {
        const track = this.tracks[trackId];
        
        // Crear nodo de ganancia para esta pista
        const trackGainNode = this.audioContext.createGain();
        trackGainNode.gain.value = initialVolume * (this.musicEnabled ? 1 : 0);
        trackGainNode.connect(this.gainNode);
        
        // Crear fuente de audio
        const source = this.audioContext.createBufferSource();
        source.buffer = track.buffer;
        source.loop = true;
        source.connect(trackGainNode);
        
        // Guardar referencias
        track.source = source;
        track.gainNode = trackGainNode;
        
        // Iniciar reproducción
        source.start(0);
        
        console.log(`Reproduciendo pista: ${trackId}`);
    }
    
    /**
     * Realizar una transición suave entre dos pistas
     * @param {string} fromTrackId - Pista actual
     * @param {string} toTrackId - Nueva pista
     */
    crossFade(fromTrackId, toTrackId) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        const fromTrack = this.tracks[fromTrackId];
        const currentTime = this.audioContext.currentTime;
        const fadeTime = this.config.fadeTime;
        
        // Iniciar la nueva pista con volumen 0
        this.startTrack(toTrackId, 0);
        const toTrack = this.tracks[toTrackId];
        
        // Disminuir volumen de la pista actual
        fromTrack.gainNode.gain.setValueAtTime(fromTrack.gainNode.gain.value, currentTime);
        fromTrack.gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeTime);
        
        // Aumentar volumen de la nueva pista
        toTrack.gainNode.gain.setValueAtTime(0, currentTime);
        toTrack.gainNode.gain.linearRampToValueAtTime(
            this.config.musicVolume * (this.musicEnabled ? 1 : 0), 
            currentTime + fadeTime
        );
        
        // Detener la pista anterior después de la transición
        setTimeout(() => {
            if (fromTrack.source) {
                fromTrack.source.stop();
                fromTrack.source = null;
            }
            this.isTransitioning = false;
        }, fadeTime * 1000);
    }
    
    /**
     * Reproducir un efecto de sonido
     * @param {string} effectId - Identificador del efecto
     */
    playEffect(effectId) {
        if (!this.audioContext || !this.soundEffects[effectId] || !this.musicEnabled) {
            return;
        }
        
        // Crear fuente para el efecto
        const source = this.audioContext.createBufferSource();
        source.buffer = this.soundEffects[effectId].buffer;
        
        // Crear nodo de ganancia para efectos
        const effectGainNode = this.audioContext.createGain();
        effectGainNode.gain.value = this.config.effectsVolume;
        
        // Conectar
        source.connect(effectGainNode);
        effectGainNode.connect(this.gainNode);
        
        // Reproducir y liberar después
        source.start(0);
        source.onended = () => {
            source.disconnect();
            effectGainNode.disconnect();
        };
    }
    
    /**
     * Manejar eventos de navegación entre obras
     * @param {string} direction - Dirección de la navegación ('left' o 'right')
     */
    handleNavigation(direction) {
        // Reproducir efecto de navegación
        this.playEffect('transition');
    }
    
    /**
     * Cambiar el volumen general
     * @param {number} value - Nuevo valor de volumen (0-1)
     */
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        
        if (this.gainNode && this.musicEnabled) {
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.audioContext.currentTime);
            this.gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.1);
        }
    }
    
    /**
     * Limpiar recursos al destruir
     */
    destroy() {
        // Detener todas las pistas
        Object.keys(this.tracks).forEach(trackId => {
            const track = this.tracks[trackId];
            if (track.source) {
                track.source.stop();
                track.source = null;
            }
        });
        
        // Cerrar contexto de audio
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        
        // Eliminar botón de audio
        if (this.audioButton && this.audioButton.parentNode) {
            this.audioButton.parentNode.removeChild(this.audioButton);
        }
    }
}