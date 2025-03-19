/**
 * AudioSystem simplificado
 * Reproduce música de fondo automáticamente sin botón de control
 */

export class AudioSystem {
    constructor(experience) {
        this.experience = experience;
        
        // Estado del audio
        this.volume = 0.035; // Ajusta este valor según prefieras (0-1)
        // Contexto de audio
        this.audioContext = null;
        this.gainNode = null;
        this.musicSource = null;
        this.musicBuffer = null;
        
        // Inicializar el sistema inmediatamente
        this.init();
    }
    
    /**
     * Inicializar el sistema de audio
     */
    init() {
        console.log('Inicializando sistema de audio automático');
        
        // Crear elemento de audio HTML como fallback
        this.createHtmlAudio();
        
        // Intentar iniciar el Web Audio API cuando sea posible
        this.setupAutoStart();
    }
    
    /**
     * Crear un elemento de audio HTML como respaldo
     * (para mayor compatibilidad entre navegadores)
     */
    createHtmlAudio() {
        this.audioElement = new Audio();
        this.audioElement.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Cambia esta URL
        this.audioElement.loop = true;
        this.audioElement.volume = this.volume;
        this.audioElement.autoplay = true;
        this.audioElement.muted = true; // Inicialmente silenciado para evitar bloqueos del navegador
        
        // Intentar reproducir (muchos navegadores bloquearán esto)
        this.audioElement.play().catch(e => {
            console.log('Reproducción automática HTML bloqueada, esperando interacción del usuario');
        });
    }
    
    /**
     * Configurar inicio automático con interacción del usuario
     */
    setupAutoStart() {
        // Lista de eventos que indican interacción del usuario
        const userEvents = ['click', 'touchstart', 'keydown', 'scroll'];
        
        const startAudio = () => {
            // Iniciar Web Audio API
            if (!this.audioContext) {
                this.initAudioContext();
                this.loadBackgroundMusic();
            }
            
            // Activar audio HTML como respaldo
            this.audioElement.muted = false;
            this.audioElement.play().catch(e => {
                console.log('Playback error:', e);
            });
            
            // Limpiar event listeners
            userEvents.forEach(event => {
                window.removeEventListener(event, startAudio);
            });
        };
        
        // Añadir event listeners para detectar interacción
        userEvents.forEach(event => {
            window.addEventListener(event, startAudio, { once: true });
        });
        
        // Intentar reproducir directamente (funcionará en algunos navegadores)
        this.initAudioContext();
        this.loadBackgroundMusic();
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
            return true;
        } catch (error) {
            console.error('Error al inicializar el contexto de audio:', error);
            return false;
        }
    }
    
    /**
     * Cargar y reproducir música de fondo
     */
    loadBackgroundMusic() {
        if (!this.audioContext) return;
        
        // URL de tu música (cambia esto por tu archivo o URL pública)
        const musicUrl = '/public/audio/background.mp3';
        
        fetch(musicUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.musicBuffer = audioBuffer;
                this.playBackgroundMusic();
                console.log('Música de fondo cargada y reproduciendo');
            })
            .catch(error => {
                console.error('Error al cargar la música de fondo:', error);
                // Intentar con el elemento HTML como respaldo
                this.audioElement.play().catch(e => {
                    console.warn('También falló el elemento HTML audio');
                });
            });
    }
    
    /**
     * Reproducir la música de fondo
     */
    playBackgroundMusic() {
        if (!this.audioContext || !this.musicBuffer) return;
        
        try {
            // Crear fuente de audio
            this.musicSource = this.audioContext.createBufferSource();
            this.musicSource.buffer = this.musicBuffer;
            this.musicSource.loop = true;
            this.musicSource.connect(this.gainNode);
            
            // Iniciar reproducción
            this.musicSource.start(0);
            
            // Configurar para reiniciar si se detiene
            this.musicSource.onended = () => {
                // Solo reiniciar si no fue una detención intencional
                if (this.musicSource) {
                    this.playBackgroundMusic();
                }
            };
        } catch (error) {
            console.error('Error al reproducir la música de fondo:', error);
        }
    }
    
    /**
     * Cambiar el volumen (mantener para uso futuro)
     */
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        
        // Aplicar a Web Audio
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.audioContext.currentTime);
            this.gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.1);
        }
        
        // Aplicar al elemento HTML
        if (this.audioElement) {
            this.audioElement.volume = this.volume;
        }
    }
    
    /**
     * Limpiar recursos al destruir (para completitud)
     */
    destroy() {
        // Detener reproducción de Web Audio
        if (this.musicSource) {
            try {
                this.musicSource.stop();
                this.musicSource = null;
            } catch (e) {
                console.log('Error al detener fuente de audio:', e);
            }
        }
        
        // Detener elemento HTML
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.src = '';
        }
        
        // Cerrar contexto de audio
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close().catch(e => console.log('Error al cerrar contexto de audio:', e));
        }
    }
}