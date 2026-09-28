/**
 * Lógica para la Zona Interactiva
 * Módulo de Minijuegos de Balística Forense
 */

const interactivos = {
    state: {
        score: 0,
        j1: { completed: false, score: 0, time: 0 },
        j2: { completed: false, score: 0, time: 0 },
        j3: { completed: false, score: 0, time: 0 },
        j4: { completed: false, score: 0, time: 0 },
        j5: { completed: false, score: 0, time: 0 },
        j6: { completed: false, score: 0, time: 0 },
        j7: { completed: false, score: 0, time: 0 },
        j8: { completed: false, score: 0, time: 0 },
        soundEnabled: false,
    },
    
    currentGame: null,
    timerInterval: null,
    currentTime: 0,
    currentScore: 0,
    currentElements: 0,
    maxElements: 0,
    errors: 0,

    audioCtx: null,

    // =====================================
    // INICIALIZACIÓN Y ESTADO
    // =====================================
    init() {
        this.loadProgress();
        this.renderMenu();
        this.updateSoundButton();
    },

    loadProgress() {
        const saved = localStorage.getItem('forense_interactivos');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing saved progress", e);
            }
        }
    },

    saveProgress() {
        localStorage.setItem('forense_interactivos', JSON.stringify(this.state));
        this.renderMenu();
    },

    resetProgress() {
        if (confirm("¿Estás seguro de que deseas borrar todo tu progreso en la Zona Interactiva?")) {
            this.state = {
                score: 0,
                j1: { completed: false, score: 0, time: 0 },
                j2: { completed: false, score: 0, time: 0 },
                j3: { completed: false, score: 0, time: 0 },
                j4: { completed: false, score: 0, time: 0 },
                j5: { completed: false, score: 0, time: 0 },
                j6: { completed: false, score: 0, time: 0 },
                j7: { completed: false, score: 0, time: 0 },
                j8: { completed: false, score: 0, time: 0 },
                soundEnabled: this.state.soundEnabled
            };
            this.saveProgress();
            this.volverAlMenu();
            app.showToast("Progreso reiniciado");
        }
    },

    // =====================================
    // NAVEGACIÓN Y MENÚ
    // =====================================
    renderMenu() {
        const container = document.getElementById('interactive-games-container');
        if (!container) return;

        const isJ1 = true;
        const isJ2 = true;
        const isJ3 = true;

        const games = [
            {
                id: 1,
                title: 'Asegura la escena',
                desc: 'Protege correctamente el área antes de comenzar la investigación.',
                icon: '🚧',
                diff: '⭐',
                avail: isJ1,
                comp: this.state.j1.completed,
                score: this.state.j1.score
            },
            {
                id: 2,
                title: 'Detective forense',
                desc: 'Explora y encuentra las evidencias clave ocultas en la escena.',
                icon: '🔎',
                diff: '⭐⭐',
                avail: isJ2,
                comp: this.state.j2.completed,
                score: this.state.j2.score
            },
            {
                id: 3,
                title: 'Recolecta correctamente',
                desc: 'Selecciona el embalaje adecuado para cada tipo de evidencia.',
                icon: '🧤',
                diff: '⭐⭐⭐',
                avail: isJ3,
                comp: this.state.j3.completed,
                score: this.state.j3.score
            },
            {
                id: 4,
                title: 'Trivia Forense',
                desc: 'Responde preguntas contra reloj sobre balística.',
                icon: '⏱️',
                diff: '⭐⭐',
                avail: true,
                comp: this.state.j4?.completed || false,
                score: this.state.j4?.score || 0
            },
            {
                id: 5,
                title: 'Sopa de Letras',
                desc: 'Encuentra términos clave de la balística forense.',
                icon: '🔠',
                diff: '⭐',
                avail: true,
                comp: this.state.j5?.completed || false,
                score: this.state.j5?.score || 0
            },
            {
                id: 6,
                title: 'Ahorcado Forense',
                desc: 'Adivina la palabra oculta antes de quedarte sin intentos.',
                icon: '📝',
                diff: '⭐⭐',
                avail: true,
                comp: this.state.j6?.completed || false,
                score: this.state.j6?.score || 0
            },
            {
                id: 7,
                title: 'Conectar Conceptos',
                desc: 'Relaciona cada término con su definición correcta.',
                icon: '🔗',
                diff: '⭐⭐',
                avail: true,
                comp: this.state.j7?.completed || false,
                score: this.state.j7?.score || 0
            },
            {
                id: 8,
                title: 'Relacionar Imágenes',
                desc: 'Encuentra las parejas de imágenes relacionadas a la balística.',
                icon: '🖼️',
                diff: '⭐⭐',
                avail: true,
                comp: this.state.j8?.completed || false,
                score: this.state.j8?.score || 0
            }
        ];

        container.innerHTML = '';
        games.forEach(g => {
            const card = document.createElement('div');
            let statusClass = g.comp ? 'status-completed' : (g.avail ? 'status-available' : 'status-locked');
            let statusText = g.comp ? 'Completado' : (g.avail ? 'Disponible' : 'Bloqueado');
            
            card.className = `ig-card ${!g.avail ? 'locked' : ''}`;
            card.innerHTML = `
                <div class="ig-icon">${g.icon}</div>
                <h3 class="ig-title">${g.title}</h3>
                <p class="ig-desc">${g.desc}</p>
                <div class="ig-meta">
                    <span class="ig-diff">Dificultad: ${g.diff}</span>
                    <span class="ig-status ${statusClass}">${statusText}</span>
                </div>
                ${g.comp ? `<div class="mb-3 text-secondary text-sm">Puntuación: <strong>${g.score}</strong></div>` : ''}
                <button class="btn btn-primary btn-block" ${!g.avail ? 'disabled' : ''} onclick="interactivos.startGame(${g.id})">
                    ${g.comp ? 'Jugar de nuevo' : 'Jugar'}
                </button>
            `;
            container.appendChild(card);
        });

        if (this.state.j1.completed && this.state.j2.completed && this.state.j3.completed && this.state.j4?.completed && this.state.j5?.completed && this.state.j6?.completed && this.state.j7?.completed && this.state.j8?.completed) {
            // Mostrar botón para ver resultado final
            const btnFinal = document.createElement('button');
            btnFinal.className = "btn btn-secondary btn-block mt-4";
            btnFinal.innerHTML = "<i class='fa-solid fa-trophy'></i> Ver Certificado Final";
            btnFinal.onclick = () => this.showFinalScreen();
            container.appendChild(btnFinal);
        }
    },

    volverAlMenu() {
        this.stopTimer();
        document.getElementById('interactive-menu').classList.remove('hidden');
        document.getElementById('interactive-game-area').classList.add('hidden');
        document.getElementById('interactive-final-screen').classList.add('hidden');
        this.renderMenu();
    },

    // =====================================
    // UTILIDADES (TIEMPO, PUNTOS, SONIDO)
    // =====================================
    formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    },

    startTimer(maxTime = null) {
        this.stopTimer();
        this.currentTime = 0;
        document.getElementById('game-time').textContent = "00:00";
        document.getElementById('game-time').style.color = "inherit";

        this.timerInterval = setInterval(() => {
            this.currentTime++;
            document.getElementById('game-time').textContent = this.formatTime(this.currentTime);
            
            if (maxTime && this.currentTime >= maxTime) {
                this.stopTimer();
                this.endGame(false, "Tiempo agotado");
            }
        }, 1000);
    },

    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    },

    addPoints(pts, targetEl = null) {
        this.currentScore += pts;
        if(this.currentScore < 0) this.currentScore = 0;
        document.getElementById('game-score').textContent = this.currentScore;

        if (targetEl) {
            const floatTxt = document.createElement('div');
            floatTxt.className = `floating-text ${pts > 0 ? 'pos' : 'neg'}`;
            floatTxt.textContent = pts > 0 ? `+${pts}` : pts;
            
            const rect = targetEl.getBoundingClientRect();
            const containerRect = document.getElementById('game-container').getBoundingClientRect();
            
            floatTxt.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
            floatTxt.style.top = (rect.top - containerRect.top) + 'px';
            
            document.getElementById('game-container').appendChild(floatTxt);
            setTimeout(() => floatTxt.remove(), 1000);
        }

        if (pts > 0) this.playSound('success');
        else this.playSound('error');
    },

    toggleSound() {
        this.state.soundEnabled = !this.state.soundEnabled;
        this.saveProgress();
        this.updateSoundButton();
        if(this.state.soundEnabled) this.initAudio();
    },

    updateSoundButton() {
        const btn = document.getElementById('btn-sound-toggle');
        if(!btn) return;
        if (this.state.soundEnabled) {
            btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Sonido: ON';
            btn.classList.replace('btn-outline', 'btn-primary');
        } else {
            btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> Sonido: OFF';
            btn.classList.replace('btn-primary', 'btn-outline');
        }
    },

    initAudio() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if(AudioContext) this.audioCtx = new AudioContext();
        }
    },

    playSound(type) {
        if (!this.state.soundEnabled || !this.audioCtx) return;
        
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;

        if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'win') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.setValueAtTime(600, now + 0.1);
            osc.frequency.setValueAtTime(800, now + 0.2);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        }
    },

    showFeedback(isSuccess, title, desc, pointsStr, isFailureModal = false) {
        const overlay = document.getElementById('game-feedback');
        const card = overlay.querySelector('.feedback-card');
        const icon = document.getElementById('feedback-icon-large');
        const titleEl = document.getElementById('feedback-title-large');
        const descEl = document.getElementById('feedback-desc-large');
        const pointsEl = document.getElementById('feedback-points');
        const actionsEl = document.getElementById('feedback-actions');

        overlay.classList.remove('hidden');
        card.className = `feedback-card ${isSuccess ? 'success' : 'error'}`;
        icon.innerHTML = isSuccess ? '<i class="fa-solid fa-circle-check" style="color:var(--secondary)"></i>' : '<i class="fa-solid fa-circle-xmark" style="color:var(--danger)"></i>';
        titleEl.textContent = title;
        descEl.textContent = desc;
        
        if (pointsStr) {
            pointsEl.textContent = pointsStr;
            pointsEl.style.color = isSuccess ? 'var(--secondary)' : 'var(--danger)';
        } else {
            pointsEl.textContent = '';
        }

        if (isFailureModal && actionsEl) {
            actionsEl.classList.remove('hidden');
            document.getElementById('btn-feedback-retry').onclick = () => {
                overlay.classList.add('hidden');
                this.startGame(this.currentGame);
            };
            document.getElementById('btn-feedback-cancel').onclick = () => {
                overlay.classList.add('hidden');
                this.volverAlMenu();
            };
        } else {
            if(actionsEl) actionsEl.classList.add('hidden');
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 2000);
        }
    },

    // =====================================
    // GESTOR DE JUEGOS
    // =====================================
    startGame(id) {
        if(this.state.soundEnabled) this.initAudio();
        this.currentGame = id;
        
        // Mostrar Briefing antes de iniciar
        this.showBriefing(id);
    },

    showBriefing(id) {
        const modal = document.getElementById('modal-briefing-juego');
        const title = document.getElementById('briefing-title');
        const content = document.getElementById('briefing-content');
        const btnStart = document.getElementById('btn-start-minigame');

        if (id === 1) {
            title.innerHTML = '<i class="fa-solid fa-person-military-pointing"></i> Misión 1: Asegura la Escena';
            content.innerHTML = `
                <img src="assets/images/game_scene.jpg" alt="Escena del crimen" style="width:100%; height:150px; object-fit:cover; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <div class="info-block" style="margin-top: 0;">
                    <h4>Funciones del Primer Responsable</h4>
                    <p>En esta misión aplicarás el principio fundamental de protección. Tu objetivo principal es <strong>acordonar</strong> el área para evitar el ingreso de curiosos y <strong>marcar</strong> las evidencias visibles sin tocarlas.</p>
                </div>
                <div class="info-block mt-3" style="border-color: var(--secondary);">
                    <h4><i class="fa-solid fa-circle-exclamation"></i> Instrucciones</h4>
                    <p>Arrastra los elementos del inventario (cinta, conos, señalizadores) hacia las zonas punteadas correspondientes en la escena. ¡Hazlo rápido para obtener un bono de tiempo!</p>
                </div>
            `;
        } else if (id === 2) {
            title.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Misión 2: Detective Forense';
            content.innerHTML = `
                <img src="assets/images/game_detective.jpg" alt="Detective analizando evidencia" style="width:100%; height:150px; object-fit:cover; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <div class="info-block" style="margin-top: 0;">
                    <h4>Principios de Balística</h4>
                    <p>Recordando la <strong>balística identificativa y de efectos</strong>, debes buscar elementos clave (armas, casquillos, impactos, manchas). Ignora los objetos que no aporten a la investigación primaria.</p>
                </div>
                <div class="info-block mt-3" style="border-color: var(--secondary);">
                    <h4><i class="fa-solid fa-circle-exclamation"></i> Instrucciones</h4>
                    <p>Haz clic sobre las 5 evidencias reales esparcidas por la escena. Si haces clic en elementos distractores, perderás puntos.</p>
                </div>
            `;
        } else if (id === 3) {
            title.innerHTML = '<i class="fa-solid fa-box-open"></i> Misión 3: Recolecta Correctamente';
            content.innerHTML = `
                <img src="assets/images/game_collect.jpg" alt="Recolección de evidencia" style="width:100%; height:150px; object-fit:cover; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <div class="info-block" style="margin-top: 0;">
                    <h4>La Cadena de Custodia</h4>
                    <p>Garantizar la "mismidad" de la evidencia significa que no debe alterarse. Las armas van en cajas, los casquillos en recipientes rígidos para proteger estrías, y los indicios biológicos/húmedos (como ropa ensangrentada) en papel para evitar hongos.</p>
                </div>
                <div class="info-block mt-3" style="border-color: var(--secondary);">
                    <h4><i class="fa-solid fa-circle-exclamation"></i> Instrucciones</h4>
                    <p>Arrastra cada evidencia de la izquierda hacia su contenedor de embalaje correcto a la derecha.</p>
                </div>
            `;
        } else if (id === 4) {
            title.innerHTML = '<i class="fa-solid fa-stopwatch"></i> Misión 4: Trivia Forense';
            content.innerHTML = `
                <img src="assets/images/game_trivia.jpg" alt="Pantalla de datos balísticos" style="width:100%; height:150px; object-fit:cover; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <div class="info-block" style="margin-top: 0;">
                    <h4>Conocimientos a prueba</h4>
                    <p>Evalúa tus conocimientos generales sobre la balística forense en un desafío rápido.</p>
                </div>
                <div class="info-block mt-3" style="border-color: var(--secondary);">
                    <h4><i class="fa-solid fa-circle-exclamation"></i> Instrucciones</h4>
                    <p>Responde correctamente la mayor cantidad de preguntas antes de que se acabe el tiempo.</p>
                </div>
            `;
        } else if (id === 5) {
            title.innerHTML = '<i class="fa-solid fa-spell-check"></i> Misión 5: Sopa de Letras';
            content.innerHTML = `
                <img src="assets/images/game_wordsearch.jpg" alt="Pantalla de Sopa de Letras" style="width:100%; height:150px; object-fit:cover; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <div class="info-block" style="margin-top: 0;">
                    <h4>Conceptos Clave</h4>
                    <p>La terminología forense es esencial para cualquier investigación técnica.</p>
                </div>
                <div class="info-block mt-3" style="border-color: var(--secondary);">
                    <h4><i class="fa-solid fa-circle-exclamation"></i> Instrucciones</h4>
                    <p>Encuentra las palabras ocultas en la cuadrícula relacionadas con la balística.</p>
                </div>
            `;
        } else if (id === 6) {
            title.innerHTML = '<i class="fa-solid fa-pen-clip"></i> Misión 6: Ahorcado Forense';
            content.innerHTML = `
                <img src="assets/images/game_hangman.jpg" alt="Libreta de Ahorcado" style="width:100%; height:150px; object-fit:cover; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <div class="info-block" style="margin-top: 0;">
                    <h4>Descifra el misterio</h4>
                    <p>En la balística, identificar la palabra exacta o el componente es crucial.</p>
                </div>
                <div class="info-block mt-3" style="border-color: var(--secondary);">
                    <h4><i class="fa-solid fa-circle-exclamation"></i> Instrucciones</h4>
                    <p>Adivina la palabra oculta letra por letra. Tienes un límite de fallos permitidos antes de perder.</p>
                </div>
            `;
        } else if (id === 7) {
            title.innerHTML = '<i class="fa-solid fa-diagram-project"></i> Misión 7: Conectar Conceptos';
            content.innerHTML = `
                <img src="assets/images/game_connect.jpg" alt="Holograma de Conceptos" style="width:100%; height:150px; object-fit:cover; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <div class="info-block" style="margin-top: 0;">
                    <h4>Relación y Asociación</h4>
                    <p>Saber conectar un indicio con su definición correcta evita errores en la cadena de custodia.</p>
                </div>
                <div class="info-block mt-3" style="border-color: var(--secondary);">
                    <h4><i class="fa-solid fa-circle-exclamation"></i> Instrucciones</h4>
                    <p>Selecciona un concepto de la columna izquierda y luego su definición en la columna derecha para unirlos.</p>
                </div>
            `;
        } else if (id === 8) {
            title.innerHTML = '<i class="fa-solid fa-image"></i> Misión 8: Relacionar Imágenes';
            content.innerHTML = `
                <img src="assets/images/game_memory.jpg" alt="Fotografías de evidencia" style="width:100%; height:150px; object-fit:cover; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <div class="info-block" style="margin-top: 0;">
                    <h4>Identificación Visual</h4>
                    <p>El reconocimiento visual es una de las habilidades principales del investigador forense.</p>
                </div>
                <div class="info-block mt-3" style="border-color: var(--secondary);">
                    <h4><i class="fa-solid fa-circle-exclamation"></i> Instrucciones</h4>
                    <p>Encuentra los pares correspondientes. Levanta dos cartas para ver si coinciden.</p>
                </div>
            `;
        }

        modal.classList.remove('hidden');

        btnStart.onclick = () => {
            modal.classList.add('hidden');
            this.executeGame(id);
        };
    },

    executeGame(id) {
        document.getElementById('interactive-menu').classList.add('hidden');
        document.getElementById('interactive-game-area').classList.remove('hidden');
        
        this.currentScore = 0;
        this.currentElements = 0;
        this.errors = 0;
        document.getElementById('game-score').textContent = "0";
        document.getElementById('game-extra-stat').innerHTML = "";
        
        const container = document.getElementById('game-container');
        container.innerHTML = '';

        if (id === 1) this.startJuego1(container);
        if (id === 2) this.startJuego2(container);
        if (id === 3) this.startJuego3(container);
        if (id === 4) this.startJuego4(container);
        if (id === 5) this.startJuego5(container);
        if (id === 6) this.startJuego6(container);
        if (id === 7) this.startJuego7(container);
        if (id === 8) this.startJuego8(container);
    },

    endGame(success, reason = "") {
        this.stopTimer();
        
        if (success) {
            this.playSound('win');
            
            // Cálculo de puntos extra por rapidez
            let timeBonus = 0;
            if (this.currentGame === 1 && this.currentTime < 120) timeBonus = (120 - this.currentTime) * 2;
            if (this.currentGame === 2 && this.currentTime < 90) timeBonus = (90 - this.currentTime) * 3;
            if (this.currentGame === 3 && this.currentTime < 150) timeBonus = (150 - this.currentTime) * 2;
            
            if (timeBonus > 0) {
                this.currentScore += timeBonus;
                app.showToast(`Bono de tiempo: +${timeBonus} pts`);
            }

            // Limitar los puntajes máximos (para que no se rompa el juego)
            if(this.currentGame === 1 && this.currentScore > 1000) this.currentScore = 1000;
            if(this.currentGame === 2 && this.currentScore > 1500) this.currentScore = 1500;
            if(this.currentGame === 3 && this.currentScore > 2000) this.currentScore = 2000;

            // Guardar el progreso del usuario
            if (!this.state[`j${this.currentGame}`]) {
                this.state[`j${this.currentGame}`] = { completed: false, score: 0, time: 0 };
            }
            const st = this.state[`j${this.currentGame}`];
            st.completed = true;
            if (this.currentScore > (st.score || 0)) {
                st.score = this.currentScore;
                st.time = this.currentTime;
            }
            this.saveProgress();

            this.showFeedback(true, "¡Escena Completada!", `Desempeño excelente. Errores: ${this.errors}. Tiempo: ${this.formatTime(this.currentTime)}`, `Puntaje final: ${this.currentScore}`);
            
            setTimeout(() => {
                this.volverAlMenu();
                
                const allCompleted = this.state.j1.completed && 
                                     this.state.j2.completed && 
                                     this.state.j3.completed && 
                                     this.state.j4?.completed && 
                                     this.state.j5?.completed && 
                                     this.state.j6?.completed && 
                                     this.state.j7?.completed && 
                                     this.state.j8?.completed;
                
                if (allCompleted) {
                    this.showFinalScreen();
                }
            }, 3000);
        } else {
            this.showFeedback(false, "Intento Fallido", reason || "Demasiados errores o tiempo agotado.", "", true);
        }
    },

    // =====================================
    // JUEGO 1: ASEGURA LA ESCENA
    // =====================================
    startJuego1(container) {
        if (!this.state.j1Level) this.state.j1Level = 1;
        this.renderJuego1Level(container);
    },

    getConceptualFeedback(type) {
        const concepts = {
            cinta: "La cinta perimetral es la primera barrera física que aísla la escena, evitando que personas no autorizadas contaminen, alteren o destruyan evidencias cruciales.",
            cono: "Los numeradores fijan visualmente la ubicación exacta de las evidencias antes de ser recolectadas, asegurando un registro topográfico y fotográfico.",
            señal: "Señalizar fluidos corporales evita que sean pisados o contaminados accidentalmente por otros intervinientes de la escena.",
            acceso: "El control de acceso registra quién entra y sale de la escena, siendo el primer paso vital para garantizar la Cadena de Custodia.",
            camara: "La fijación fotográfica documenta el estado original inalterado de los elementos, constituyendo una prueba objetiva en juicio.",
            guantes: "Los elementos de bioseguridad previenen la contaminación cruzada (transferencia de ADN) y protegen al investigador."
        };
        return concepts[type] || "Excelente procedimiento.";
    },

    renderJuego1Level(container) {
        const level = this.state.j1Level;
        this.currentElements = 0;
        
        let levelData = {};
        
        if (level === 1) {
            this.maxElements = 4;
            levelData = {
                img: 'assets/images/game1_lvl1.jpg',
                title: 'NIVEL 1: VÍA PÚBLICA',
                desc: 'Acordonar y proteger los indicios en un entorno urbano abierto.',
                html: `
                <div class="j1-scene" id="j1-scene" style="background: linear-gradient(to bottom, #60a5fa 0%, #60a5fa 25%, #475569 25%, #334155 100%);">
                    <div style="position:absolute; top:25%; left:0; width:100%; border-top: 3px dashed rgba(255,255,255,0.4);"></div>
                    <div style="position:absolute; top:52%; left:42%; font-size: clamp(3rem, 10vw, 5rem); filter: grayscale(1); opacity:0.8; transform: rotate(90deg); color: #cbd5e1;" title="Víctima"><i class="fa-solid fa-person-falling"></i></div>
                    <div style="position:absolute; top:65%; left:62%; font-size: clamp(1.5rem, 5vw, 2.5rem); color: #334155;" title="Arma"><i class="fa-solid fa-gun"></i></div>
                    <div style="position:absolute; top:35%; left:75%; font-size: clamp(2.5rem, 8vw, 4rem); color: #f87171;" title="Vehículo"><i class="fa-solid fa-car"></i></div>
                    
                    <div class="j1-dropzone" data-target="cinta" style="top: 40%; left: 30%; width: 45%; height: 45%; justify-content: flex-start; align-items: flex-start; padding: 1rem;">
                        <span>Aislar Perímetro</span>
                    </div>
                    <div class="j1-dropzone" data-target="cono" style="top: 60%; left: 60%; width: clamp(50px, 15vw, 90px); height: clamp(50px, 15vw, 90px); flex-direction: column;">
                        <span>Marcar<br>Arma</span>
                    </div>
                    <div class="j1-dropzone" data-target="señal" style="top: 48%; left: 40%; width: clamp(60px, 20vw, 110px); height: clamp(60px, 20vw, 110px); flex-direction: column;">
                        <span>Marcar<br>Cuerpo</span>
                    </div>
                    <div class="j1-dropzone" data-target="acceso" style="bottom: 5%; left: 5%; width: clamp(70px, 25vw, 130px); height: clamp(50px, 20vw, 90px); flex-direction: column;">
                        <span>Control de<br>Acceso</span>
                    </div>
                </div>`
            };
        } else if (level === 2) {
            this.maxElements = 3;
            levelData = {
                img: 'assets/images/game1_lvl2.jpg',
                title: 'NIVEL 2: ESPACIO CERRADO',
                desc: 'Un apartamento alterado. Protege los accesos y fija los elementos.',
                html: `
                <div class="j1-scene" id="j1-scene" style="background: linear-gradient(to bottom, #78716c 0%, #a8a29e 40%, #d6d3d1 40%, #e7e5e4 100%);">
                    <div style="position:absolute; top:40%; left:0; width:100%; border-top: 5px solid #444;"></div>
                    <div style="position:absolute; top:10%; left:10%; width: 20%; height: 30%; border: 3px solid #5c4033; background: #8b5a2b;"><i class="fa-solid fa-door-open" style="font-size:3rem; color:#fff; position:absolute; bottom:10%; right:10%;"></i></div>
                    <div style="position:absolute; top:15%; right:20%; width: 15%; height: 20%; border: 2px solid #333; background: #93c5fd;"><i class="fa-solid fa-burst" style="font-size:2rem; color:#fff; position:absolute; top:30%; left:30%;"></i></div>
                    <div style="position:absolute; top:65%; left:42%; font-size: 3rem; color: #b91c1c;"><i class="fa-solid fa-droplet"></i></div>
                    <div style="position:absolute; top:55%; right:25%; font-size: 4rem; transform: rotate(90deg); color: #57534e;"><i class="fa-solid fa-chair"></i></div>

                    <div class="j1-dropzone" data-target="cinta" style="top: 15%; left: 8%; width: 24%; height: 24%; flex-direction: column;">
                        <span>Bloquear<br>Puerta</span>
                    </div>
                    <div class="j1-dropzone" data-target="señal" style="top: 60%; left: 40%; width: 15%; height: 15%; flex-direction: column;">
                        <span>Marcar<br>Sangre</span>
                    </div>
                    <div class="j1-dropzone" data-target="camara" style="top: 50%; right: 20%; width: 15%; height: 15%; flex-direction: column;">
                        <span>Fijar<br>Silla</span>
                    </div>
                </div>`
            };
        } else {
            this.maxElements = 4;
            levelData = {
                img: 'assets/images/game1_lvl3.jpg',
                title: 'NIVEL 3: ZONA BOSCOSA',
                desc: 'Área rural amplia. Prioriza el acordonamiento extenso y la recolección segura.',
                html: `
                <div class="j1-scene" id="j1-scene" style="background: linear-gradient(to bottom, #14532d 0%, #166534 30%, #451a03 30%, #78350f 100%);">
                    <div style="position:absolute; top:10%; left:15%; font-size: 5rem; color: #064e3b;"><i class="fa-solid fa-tree"></i></div>
                    <div style="position:absolute; top:5%; right:20%; font-size: 6rem; color: #064e3b;"><i class="fa-solid fa-tree"></i></div>
                    <div style="position:absolute; top:60%; left:45%; font-size: 4rem; color: #1c1917;"><i class="fa-solid fa-mound"></i></div>
                    <div style="position:absolute; top:65%; left:35%; font-size: 2.5rem; transform: rotate(45deg); color: #94a3b8;"><i class="fa-solid fa-spoon"></i></div>

                    <div class="j1-dropzone" data-target="cinta" style="top: 25%; left: 5%; width: 90%; height: 70%; justify-content: flex-start; align-items: flex-start; padding: 1rem;">
                        <span>Acordonar Bosque</span>
                    </div>
                    <div class="j1-dropzone" data-target="cono" style="top: 55%; left: 42%; width: 15%; height: 15%; flex-direction: column;">
                        <span>Marcar<br>Tierra</span>
                    </div>
                    <div class="j1-dropzone" data-target="guantes" style="top: 60%; left: 30%; width: 15%; height: 15%; flex-direction: column;">
                        <span>Manipular<br>Pala</span>
                    </div>
                    <div class="j1-dropzone" data-target="acceso" style="bottom: 5%; right: 10%; width: 20%; height: 15%; flex-direction: column;">
                        <span>Vigilar<br>Sendero</span>
                    </div>
                </div>`
            };
        }

        document.getElementById('game-extra-stat').innerHTML = `<i class="fa-solid fa-layer-group"></i> Nivel ${level}/3 | <i class="fa-solid fa-box"></i> <span id="j1-count">0</span>/${this.maxElements}`;
        
        container.innerHTML = `
            <div class="j2-case-header" style="background: var(--bg-card); padding: 1rem; border-left: 4px solid var(--primary); margin-bottom: 1rem; border-radius: 8px;">
                <h4 style="margin:0; color:var(--primary);">${levelData.title}</h4>
                <p style="margin:0.5rem 0 0 0; color:var(--text-muted); font-size:0.95rem;">${levelData.desc}</p>
            </div>
            <img src="${levelData.img}" style="width: 100%; max-width: 400px; height: 120px; object-fit: cover; border-radius: 12px; margin: 0 auto 15px auto; display: block; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid var(--border-color);">
            <div class="j1-layout">
                ${levelData.html}
                <div class="j1-toolbar" id="j1-toolbar">
                    <div class="draggable-item" draggable="true" data-type="cono" title="Numerador/Cono" style="color: #f97316;"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div class="draggable-item" draggable="true" data-type="cinta" title="Cinta de seguridad" style="color: #facc15;"><i class="fa-solid fa-ribbon"></i></div>
                    <div class="draggable-item" draggable="true" data-type="guantes" title="Guantes" style="color: #60a5fa;"><i class="fa-solid fa-hands"></i></div>
                    <div class="draggable-item" draggable="true" data-type="camara" title="Cámara" style="color: #475569;"><i class="fa-solid fa-camera"></i></div>
                    <div class="draggable-item" draggable="true" data-type="señal" title="Señalización de fluido" style="color: #d4d4d8;"><i class="fa-solid fa-tag"></i></div>
                    <div class="draggable-item" draggable="true" data-type="acceso" title="Policía (Control de Acceso)" style="color: #3b82f6;"><i class="fa-solid fa-user-shield"></i></div>
                </div>
            </div>
            <!-- Modal de retroalimentación conceptual -->
            <div id="j1-concept-modal" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:100; flex-direction:column; justify-content:center; align-items:center; border-radius:12px; padding:2rem; text-align:center;">
                <i class="fa-solid fa-circle-check" style="color:#4ade80; font-size:4rem; margin-bottom:1rem;"></i>
                <h3 style="color:#fff;">¡Acción Correcta!</h3>
                <p id="j1-concept-text" style="color:#cbd5e1; font-size:1.1rem; line-height:1.5; margin-bottom:1.5rem;"></p>
                <button class="btn btn-primary" id="btn-j1-continue">Continuar</button>
            </div>
        `;

        if (level === 1) this.startTimer(120); // 2 mins total para los 3 niveles

        this.setupDragAndDrop('.draggable-item', '.j1-dropzone', (dragged, dropzone) => {
            const type = dragged.dataset.type;
            const target = dropzone.dataset.target;
            
            if (type === target) {
                dropzone.innerHTML = dragged.innerHTML;
                dropzone.classList.add('correct');
                dropzone.dataset.filled = "true";
                dragged.classList.add('used');
                dragged.draggable = false;
                
                this.addPoints(100, dropzone);
                this.currentElements++;
                document.getElementById('j1-count').textContent = this.currentElements;
                
                // Mostrar retroalimentación conceptual
                const conceptModal = document.getElementById('j1-concept-modal');
                document.getElementById('j1-concept-text').textContent = this.getConceptualFeedback(type);
                conceptModal.style.display = 'flex';
                
                document.getElementById('btn-j1-continue').onclick = () => {
                    conceptModal.style.display = 'none';
                    if (this.currentElements >= this.maxElements) {
                        if (this.state.j1Level < 3) {
                            this.state.j1Level++;
                            app.showToast(`¡Nivel ${this.state.j1Level - 1} completado! Cargando Nivel ${this.state.j1Level}...`, "success");
                            setTimeout(() => this.renderJuego1Level(container), 1500);
                        } else {
                            setTimeout(() => {
                                this.state.j1Level = 1; // reset for future plays
                                this.endGame(true);
                            }, 500);
                        }
                    }
                };
            } else {
                this.errors++;
                this.addPoints(-50, dropzone);
                app.showToast(`Error: Esa acción no corresponde a esta evidencia.`, "error");
            }
        });
    },

    // =====================================
    // JUEGO 2: DETECTIVE FORENSE
    // =====================================
    startJuego2(container) {
        if (!this.state.j2Level) this.state.j2Level = 1;
        this.renderJuego2Level(container);
    },

    renderJuego2Level(container) {
        const level = this.state.j2Level;
        this.currentElements = 0;
        
        let levelData = {};
        
        if (level === 1) {
            this.maxElements = 3;
            levelData = {
                img: 'assets/images/game2_lvl1.jpg',
                title: 'EXPEDIENTE 001 - ALTERCADO CALLEJERO',
                desc: 'Reporte de disparos en un callejón. Busca: 1 Arma de fuego, 1 Rastro de sangre, 1 Casquillo.',
                items: [
                    { type: 'evi', icon: '<i class="fa-solid fa-gun" style="color: #94a3b8"></i>', x: 20, y: 70, rot: -15 },
                    { type: 'evi', icon: '<i class="fa-solid fa-droplet" style="color: #ef4444"></i>', x: 45, y: 85, rot: 0 },
                    { type: 'evi', icon: '<i class="fa-solid fa-capsules" style="color: #fbbf24"></i>', x: 75, y: 60, rot: 45 },
                    { type: 'dis', icon: '<i class="fa-solid fa-bottle-water" style="color: #38bdf8"></i>', x: 10, y: 30, rot: 20 },
                    { type: 'dis', icon: '<i class="fa-solid fa-mobile-screen" style="color: #334155"></i>', x: 85, y: 80, rot: -5 }
                ]
            };
        } else if (level === 2) {
            this.maxElements = 3;
            levelData = {
                img: 'assets/images/game2_lvl2.jpg',
                title: 'EXPEDIENTE 002 - INTERCEPTACIÓN VEHICULAR',
                desc: 'Un vehículo fue atacado. Busca: 1 Impacto balístico, 1 Documento confidencial, 1 Proyectil deformado.',
                items: [
                    { type: 'evi', icon: '<i class="fa-solid fa-bullseye" style="color: #1e293b"></i>', x: 35, y: 40, rot: 0 },
                    { type: 'evi', icon: '<i class="fa-solid fa-file-contract" style="color: #e2e8f0"></i>', x: 60, y: 70, rot: 15 },
                    { type: 'evi', icon: '<i class="fa-solid fa-compact-disc" style="color: #94a3b8"></i>', x: 80, y: 85, rot: -10 },
                    { type: 'dis', icon: '<i class="fa-solid fa-burger" style="color: #f59e0b"></i>', x: 15, y: 80, rot: 45 },
                    { type: 'dis', icon: '<i class="fa-solid fa-glasses" style="color: #333"></i>', x: 50, y: 20, rot: 10 },
                    { type: 'dis', icon: '<i class="fa-solid fa-wallet" style="color: #78350f"></i>', x: 70, y: 30, rot: 40 }
                ]
            };
        } else {
            this.maxElements = 3;
            levelData = {
                img: 'assets/images/game2_lvl3.jpg',
                title: 'EXPEDIENTE 003 - BODEGA CLANDESTINA',
                desc: 'Bodega abandonada. Busca: 1 Arma larga (rifle), 1 Cargador, 1 Rastro químico (pólvora).',
                items: [
                    { type: 'evi', icon: '<i class="fa-solid fa-person-rifle" style="color: #475569"></i>', x: 70, y: 55, rot: 0 },
                    { type: 'evi', icon: '<i class="fa-brands fa-magento" style="color: #64748b"></i>', x: 25, y: 65, rot: -45 },
                    { type: 'evi', icon: '<i class="fa-solid fa-flask" style="color: #a3e635"></i>', x: 50, y: 85, rot: 20 },
                    { type: 'dis', icon: '<i class="fa-solid fa-wrench" style="color: #9ca3af"></i>', x: 85, y: 80, rot: -30 },
                    { type: 'dis', icon: '<i class="fa-solid fa-box-open" style="color: #d97706"></i>', x: 15, y: 35, rot: 5 },
                    { type: 'dis', icon: '<i class="fa-solid fa-lightbulb" style="color: #fcd34d"></i>', x: 45, y: 25, rot: 15 }
                ]
            };
        }

        document.getElementById('game-extra-stat').innerHTML = `<i class="fa-solid fa-layer-group"></i> Nivel ${level}/3 | <i class="fa-solid fa-magnifying-glass"></i> <span id="j2-count">0</span>/${this.maxElements}`;
        
        let itemsHtml = levelData.items.map(item => `
            <div class="j2-item" data-type="${item.type}" style="left: ${item.x}%; top: ${item.y}%; --rot: ${item.rot};">
                ${item.icon}
            </div>
        `).join('');

        container.innerHTML = `
            <div class="j2-case-header" style="background: var(--bg-card); padding: 1rem; border-left: 4px solid var(--secondary); margin-bottom: 1rem; border-radius: 8px;">
                <h4 style="margin:0; color:var(--secondary);">${levelData.title}</h4>
                <p style="margin:0.5rem 0 0 0; color:var(--text-muted); font-size:0.95rem;">${levelData.desc}</p>
            </div>
            <img src="${levelData.img}" style="width: 100%; max-width: 400px; height: 120px; object-fit: cover; border-radius: 12px; margin: 0 auto 15px auto; display: block; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid var(--border-color);">
            <div class="j2-layout">
                <div class="j2-hud">Evidencias recuperadas: <span id="j2-inventory"></span></div>
                ${itemsHtml}
            </div>
        `;

        if (level === 1) this.startTimer(90); // 90 secs for all 3 levels combined (fast pacing)

        const domItems = container.querySelectorAll('.j2-item');
        domItems.forEach(el => {
            el.addEventListener('click', (e) => {
                if (el.classList.contains('found')) return;
                
                const type = el.dataset.type;
                if (type === 'evi') {
                    el.classList.add('found');
                    this.addPoints(150, el);
                    this.currentElements++;
                    document.getElementById('j2-count').textContent = this.currentElements;
                    document.getElementById('j2-inventory').innerHTML += el.innerHTML;
                    
                    if (this.currentElements >= this.maxElements) {
                        if (this.state.j2Level < 3) {
                            this.state.j2Level++;
                            app.showToast(`¡Expediente completado! Pasando al siguiente caso...`, "success");
                            setTimeout(() => this.renderJuego2Level(container), 1500);
                        } else {
                            setTimeout(() => {
                                this.state.j2Level = 1;
                                this.endGame(true);
                            }, 1000);
                        }
                    }
                } else {
                    this.errors++;
                    this.addPoints(-25, el);
                    app.showToast("Eso no es evidencia útil. Pierdes puntos.", "error");
                    
                    if (this.errors >= 5) {
                        this.endGame(false, "Acumulaste demasiados errores en la búsqueda.");
                    }
                }
            });
        });
    },

    // =====================================
    // JUEGO 3: RECOLECTA CORRECTAMENTE
    // =====================================
    startJuego3(container) {
        this.maxElements = 5;
        document.getElementById('game-extra-stat').innerHTML = `<i class="fa-solid fa-box-open"></i> <span id="j3-count">0</span>/${this.maxElements}`;
        
        container.innerHTML = `
            <img src="assets/images/game_collect.jpg" style="width: 100%; max-width: 400px; height: 120px; object-fit: cover; border-radius: 12px; margin: 0 auto 15px auto; display: block; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid var(--border-color);">
            <div class="j3-layout">
                <div class="j3-panel j3-panel-left" id="j3-evidences">
                    <h4>Evidencias</h4>
                    <div class="j3-evidence draggable-item-3" draggable="true" data-type="arma"><i class="fa-solid fa-gun" style="color: #94a3b8"></i> Arma de fuego</div>
                    <div class="j3-evidence draggable-item-3" draggable="true" data-type="casquillo"><i class="fa-solid fa-capsules" style="color: #fbbf24"></i> Casquillo</div>
                    <div class="j3-evidence draggable-item-3" draggable="true" data-type="sangre"><i class="fa-solid fa-droplet" style="color: #ef4444"></i> Muestra seca</div>
                    <div class="j3-evidence draggable-item-3" draggable="true" data-type="documento"><i class="fa-solid fa-file-contract" style="color: #e2e8f0"></i> Documento</div>
                    <div class="j3-evidence draggable-item-3" draggable="true" data-type="ropa"><i class="fa-solid fa-shirt" style="color: #64748b"></i> Ropa húmeda</div>
                </div>

                <div class="j3-panel j3-panel-right" id="j3-containers">
                    <h4>Embalaje Correcto</h4>
                    <div class="j3-container-item dropzone-3" data-target="arma">
                        <div class="j3-container-icon" style="color: #d4d4d8;"><i class="fa-solid fa-box"></i></div>
                        <div class="j3-container-name">Caja de cartón</div>
                    </div>
                    <div class="j3-container-item dropzone-3" data-target="casquillo">
                        <div class="j3-container-icon" style="color: #38bdf8;"><i class="fa-solid fa-flask"></i></div>
                        <div class="j3-container-name">Recipiente rígido</div>
                    </div>
                    <div class="j3-container-item dropzone-3" data-target="sangre">
                        <div class="j3-container-icon" style="color: #fbbf24;"><i class="fa-solid fa-envelope"></i></div>
                        <div class="j3-container-name">Sobre de papel</div>
                    </div>
                    <div class="j3-container-item dropzone-3" data-target="ropa">
                        <div class="j3-container-icon" style="color: #d1d5db;"><i class="fa-solid fa-bag-shopping"></i></div>
                        <div class="j3-container-name">Bolsa de papel (secado)</div>
                    </div>
                    <div class="j3-container-item dropzone-3" data-target="documento">
                        <div class="j3-container-icon" style="color: #facc15;"><i class="fa-solid fa-folder-open"></i></div>
                        <div class="j3-container-name">Carpeta manila</div>
                    </div>
                </div>
            </div>
        `;

        this.startTimer(150);

        this.setupDragAndDrop('.draggable-item-3', '.dropzone-3', (dragged, dropzone) => {
            const type = dragged.dataset.type;
            const target = dropzone.dataset.target;
            
            if (type === target) {
                dropzone.style.background = 'rgba(16, 185, 129, 0.1)';
                dropzone.style.borderColor = 'var(--secondary)';
                dragged.style.display = 'none';
                
                this.addPoints(200, dropzone);
                this.currentElements++;
                document.getElementById('j3-count').textContent = this.currentElements;
                
                app.showToast("Embalaje correcto. Evita contaminación cruzada.", "success");
                
                if (this.currentElements >= this.maxElements) {
                    setTimeout(() => this.endGame(true), 500);
                }
            } else {
                this.errors++;
                this.addPoints(-75, dropzone);
                app.showToast(`Procedimiento incorrecto para este tipo de evidencia.`, "error");
            }
        });
    },

    // =====================================
    // UTILIDAD DE DRAG & DROP
    // =====================================
    setupDragAndDrop(dragSelector, dropSelector, onDropCallback) {
        const draggables = document.querySelectorAll(dragSelector);
        const dropzones = document.querySelectorAll(dropSelector);

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                draggable.classList.add('dragging');
                e.dataTransfer.setData('text/plain', draggable.dataset.type);
                window._draggedEl = draggable;
            });

            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
                window._draggedEl = null;
            });

            // Eventos táctiles para dispositivos móviles
            draggable.addEventListener('touchstart', (e) => {
                window._draggedEl = draggable;
                draggable.classList.add('dragging');
                draggable.style.opacity = '0.5';
                
                // Crear un clon visual para simular el arrastre táctil
                const clone = draggable.cloneNode(true);
                clone.id = 'touch-drag-clone';
                clone.style.position = 'fixed';
                clone.style.pointerEvents = 'none'; // para que no bloquee elementFromPoint al soltar
                clone.style.zIndex = '9999';
                clone.style.opacity = '0.8';
                clone.style.transform = 'scale(1.1)';
                
                const touch = e.touches[0];
                clone.style.left = (touch.clientX - draggable.offsetWidth / 2) + 'px';
                clone.style.top = (touch.clientY - draggable.offsetHeight / 2) + 'px';
                document.body.appendChild(clone);
                
                window._touchClone = clone;
            }, {passive: true});

            draggable.addEventListener('touchmove', (e) => {
                if (!window._touchClone) return;
                
                // CRUCIAL: Prevenir scroll del navegador al arrastrar
                e.preventDefault();
                
                const touch = e.touches[0];
                window._touchClone.style.left = touch.pageX - 20 + 'px';
                window._touchClone.style.top = touch.pageY - 20 + 'px';
                
                // Resaltar las zonas de destino
                dropzones.forEach(dz => {
                    const rect = dz.getBoundingClientRect();
                    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                        if (dz.dataset.filled !== "true") dz.classList.add('drag-over');
                    } else {
                        dz.classList.remove('drag-over');
                    }
                });
            }, {passive: false});

            draggable.addEventListener('touchend', (e) => {
                draggable.classList.remove('dragging');
                draggable.style.opacity = '1';
                
                if (window._touchClone) {
                    window._touchClone.remove();
                    window._touchClone = null;
                }
                dropzones.forEach(dz => dz.classList.remove('drag-over'));
                
                const touch = e.changedTouches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                
                if (target) {
                    const dropzone = target.closest(dropSelector);
                    if (dropzone && dropzone.dataset.filled !== "true") {
                        onDropCallback(draggable, dropzone);
                    }
                }
                window._draggedEl = null;
            });
        });

        dropzones.forEach(dropzone => {
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (dropzone.dataset.filled !== "true") {
                    dropzone.classList.add('drag-over');
                }
            });

            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('drag-over');
            });

            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('drag-over');
                if (dropzone.dataset.filled !== "true" && window._draggedEl) {
                    onDropCallback(window._draggedEl, dropzone);
                }
            });
        });
    },

    // =====================================
    // PANTALLA FINAL
    // =====================================
    showFinalScreen() {
        document.getElementById('interactive-menu').classList.add('hidden');
        document.getElementById('interactive-game-area').classList.add('hidden');
        document.getElementById('interactive-final-screen').classList.remove('hidden');
        
        this.playSound('win');

        const totalScore = this.state.j1.score + this.state.j2.score + this.state.j3.score + 
                           (this.state.j4?.score || 0) + (this.state.j5?.score || 0) + 
                           (this.state.j6?.score || 0) + (this.state.j7?.score || 0) + 
                           (this.state.j8?.score || 0);
                           
        const totalTime = this.state.j1.time + this.state.j2.time + this.state.j3.time + 
                          (this.state.j4?.time || 0) + (this.state.j5?.time || 0) + 
                          (this.state.j6?.time || 0) + (this.state.j7?.time || 0) + 
                          (this.state.j8?.time || 0);
        
        const maxPosScore = 7000; 
        let acc = Math.round((totalScore / maxPosScore) * 100);
        if (acc > 100) acc = 100;
        if (acc < 0) acc = 0;

        let levelName = "APRENDIZ";
        if(acc > 50) levelName = "OBSERVADOR";
        if(acc > 75) levelName = "INVESTIGADOR";
        if(acc >= 90) levelName = "INVESTIGADOR EXPERTO";

        document.getElementById('final-score').textContent = totalScore;
        document.getElementById('final-time').textContent = this.formatTime(totalTime);
        document.getElementById('final-accuracy').textContent = acc + "%";
        document.getElementById('final-level').textContent = levelName;

        const summaryHtml = `
            <li class="final-summary-item">
                <span><i class="fa-solid fa-triangle-exclamation" style="color: #f97316;"></i> Escena asegurada</span>
                <strong>${this.state.j1.score} pts | <i class="fa-solid fa-check" style="color: #10b981;"></i></strong>
            </li>
            <li class="final-summary-item">
                <span><i class="fa-solid fa-magnifying-glass" style="color: #60a5fa;"></i> Evidencias encontradas</span>
                <strong>${this.state.j2.score} pts | <i class="fa-solid fa-check" style="color: #10b981;"></i></strong>
            </li>
            <li class="final-summary-item">
                <span><i class="fa-solid fa-box" style="color: #d4d4d8;"></i> Recolección correcta</span>
                <strong>${this.state.j3.score} pts | <i class="fa-solid fa-check" style="color: #10b981;"></i></strong>
            </li>
        `;
        document.getElementById('final-summary-list').innerHTML = summaryHtml;
    },

    reiniciarTodos() {
        this.volverAlMenu();
    }
};

// Exportar globalmente
window.interactivos = interactivos;
