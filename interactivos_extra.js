/**
 * Minijuegos adicionales para la Zona Interactiva
 */

Object.assign(interactivos, {
    // =====================================
    // Misión 4: Trivia Forense
    // =====================================
    startJuego4(container) {
        const title = document.createElement('h3');
        title.innerHTML = '<i class="fa-solid fa-stopwatch"></i> Trivia Rápida';
        title.className = 'text-center mb-3';
        container.appendChild(title);

        const img = document.createElement('img');
        img.src = 'assets/images/game_trivia.jpg';
        img.style = 'width: 100%; max-width: 400px; height: 120px; object-fit: cover; border-radius: 12px; margin: 0 auto 20px auto; display: block; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid var(--border-color);';
        container.appendChild(img);

        const qContainer = document.createElement('div');
        qContainer.className = 'quiz-container text-center';
        container.appendChild(qContainer);

        const questions = [
            { q: "¿Qué marca deja la aguja percutora?", o: ["En la bala", "En el fulminante", "En el cañón"], a: 1 },
            { q: "Estudia el recorrido del proyectil en el aire", o: ["Balística Interna", "Balística Externa", "Balística de Efectos"], a: 1 },
            { q: "¿Cómo se embala ropa con sangre?", o: ["Bolsa plástica", "Bolsa de papel", "Frasco de vidrio"], a: 1 },
            { q: "Principal deber del primer responsable", o: ["Proteger la vida y el lugar", "Recoger los casquillos", "Dar entrevistas"], a: 0 },
            { q: "El estriado sirve para...", o: ["Dar giro y estabilidad", "Reducir ruido", "Estética del arma"], a: 0 }
        ];

        let currentQ = 0;
        let score = 0;

        const renderQuestion = () => {
            if (currentQ >= questions.length) {
                this.endGame(true, "¡Trivia completada!");
                return;
            }

            qContainer.innerHTML = '';
            const qObj = questions[currentQ];
            
            const qEl = document.createElement('h4');
            qEl.textContent = qObj.q;
            qEl.className = 'mb-3';
            qContainer.appendChild(qEl);

            const optionsDiv = document.createElement('div');
            optionsDiv.style.display = 'flex';
            optionsDiv.style.flexDirection = 'column';
            optionsDiv.style.gap = '10px';
            optionsDiv.style.maxWidth = '400px';
            optionsDiv.style.margin = '0 auto';

            qObj.o.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-outline';
                btn.textContent = opt;
                btn.onclick = () => {
                    // Deshabilitar todos los botones para prevenir doble clic
                    Array.from(optionsDiv.children).forEach(b => b.disabled = true);
                    
                    if (idx === qObj.a) {
                        score += 100;
                        this.addPoints(100, btn);
                        this.showFeedback(true, "¡Correcto!", "+100 pts");
                        btn.classList.replace('btn-outline', 'btn-secondary');
                    } else {
                        score = Math.max(0, score - 50);
                        this.showFeedback(false, "Incorrecto", "-50 pts");
                        this.playSound('error');
                        btn.classList.replace('btn-outline', 'btn-danger');
                    }
                    currentQ++;
                    setTimeout(renderQuestion, 1000);
                };
                optionsDiv.appendChild(btn);
            });
            qContainer.appendChild(optionsDiv);
        };

        this.startTimer(60); // 60 segundos
        renderQuestion();
    },

    // =====================================
    // Misión 5: Sopa de Letras
    // =====================================
    startJuego5(container) {
        const title = document.createElement('h3');
        title.innerHTML = '<i class="fa-solid fa-spell-check"></i> Sopa de Letras Forense';
        title.className = 'text-center mb-3';
        container.appendChild(title);

        const img = document.createElement('img');
        img.src = 'assets/images/game_wordsearch.jpg';
        img.style = 'width: 100%; max-width: 400px; height: 120px; object-fit: cover; border-radius: 12px; margin: 0 auto 20px auto; display: block; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid var(--border-color);';
        container.appendChild(img);

        const words = ['VAINA', 'CALIBRE', 'ESTRIA', 'POLVORA', 'BALA'];
        const grid = [
            ['V','A','I','N','A','X','Y','B'],
            ['E','P','O','L','V','O','R','A'],
            ['S','A','L','M','A','C','Z','L'],
            ['T','M','C','A','L','I','B','A'],
            ['R','E','S','C','A','T','E','T'],
            ['I','O','D','O','P','E','N','O'],
            ['A','C','A','L','I','B','R','E'],
            ['L','K','B','A','L','A','M','O']
        ]; // Tablero predefinido para simplificar
        
        let foundWords = 0;
        let selectedCells = [];

        const wordList = document.createElement('div');
        wordList.className = 'text-center mb-3';
        wordList.innerHTML = '<strong>Palabras a encontrar:</strong> ' + words.map(w => `<span id="word-${w}" class="badge">${w}</span>`).join(' ');
        container.appendChild(wordList);

        const gridEl = document.createElement('div');
        gridEl.style.display = 'grid';
        gridEl.style.gridTemplateColumns = 'repeat(8, 40px)';
        gridEl.style.gap = '5px';
        gridEl.style.justifyContent = 'center';
        container.appendChild(gridEl);

        const checkSelection = () => {
            if (selectedCells.length < 4 && selectedCells.length !== 5 && selectedCells.length !== 6 && selectedCells.length !== 7) return;
            
            const wordStr = selectedCells.map(c => c.textContent).join('');
            const wordStrRev = selectedCells.map(c => c.textContent).reverse().join('');
            
            const matchedWord = words.find(w => w === wordStr || w === wordStrRev);
            
            if (matchedWord) {
                const badge = document.getElementById(`word-${matchedWord}`);
                if (badge && !badge.classList.contains('found')) {
                    badge.classList.add('found');
                    badge.style.textDecoration = 'line-through';
                    badge.style.color = 'var(--secondary)';
                    
                    selectedCells.forEach(c => c.style.backgroundColor = 'var(--secondary)');
                    this.addPoints(150, selectedCells[0]);
                    foundWords++;
                    selectedCells = [];
                    
                    if (foundWords === words.length) {
                        setTimeout(() => this.endGame(true, "¡Todas las palabras encontradas!"), 1000);
                    }
                }
            } else {
                if (selectedCells.length >= 7) {
                    selectedCells.forEach(c => c.classList.remove('selected-cell'));
                    selectedCells.forEach(c => c.style.backgroundColor = '');
                    selectedCells = [];
                }
            }
        };

        for(let r=0; r<8; r++){
            for(let c=0; c<8; c++){
                const cell = document.createElement('div');
                cell.textContent = grid[r][c];
                cell.style.width = '40px';
                cell.style.height = '40px';
                cell.style.display = 'flex';
                cell.style.alignItems = 'center';
                cell.style.justifyContent = 'center';
                cell.style.border = '1px solid var(--border-color)';
                cell.style.borderRadius = '4px';
                cell.style.cursor = 'pointer';
                cell.style.fontWeight = 'bold';
                cell.style.userSelect = 'none';
                
                cell.onclick = () => {
                    if (cell.style.backgroundColor === 'var(--secondary)') return; // Already found
                    
                    if (cell.classList.contains('selected-cell')) {
                        cell.classList.remove('selected-cell');
                        cell.style.backgroundColor = '';
                        selectedCells = selectedCells.filter(x => x !== cell);
                    } else {
                        cell.classList.add('selected-cell');
                        cell.style.backgroundColor = 'var(--primary-light)';
                        selectedCells.push(cell);
                        checkSelection();
                    }
                };
                gridEl.appendChild(cell);
            }
        }
        this.startTimer(120);
    },

    // =====================================
    // Misión 6: Ahorcado Forense
    // =====================================
    startJuego6(container) {
        const title = document.createElement('h3');
        title.innerHTML = '<i class="fa-solid fa-pen-clip"></i> Ahorcado Forense';
        title.className = 'text-center mb-3';
        container.appendChild(title);

        const img = document.createElement('img');
        img.src = 'assets/images/game_hangman.jpg';
        img.style = 'width: 100%; max-width: 400px; height: 120px; object-fit: cover; border-radius: 12px; margin: 0 auto 20px auto; display: block; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid var(--border-color);';
        container.appendChild(img);

        const wordsToGuess = [
            { w: 'PROYECTIL', h: 'Elemento dinámico de la munición' },
            { w: 'CUSTODIA', h: 'Cadena que asegura la evidencia' }
        ];
        
        let currentWordObj = wordsToGuess[Math.floor(Math.random() * wordsToGuess.length)];
        let word = currentWordObj.w;
        let guessed = new Array(word.length).fill('_');
        let mistakes = 0;
        const maxMistakes = 6;

        const displayDiv = document.createElement('div');
        displayDiv.className = 'text-center';
        container.appendChild(displayDiv);

        const wordEl = document.createElement('h2');
        wordEl.style.letterSpacing = '5px';
        wordEl.style.marginBottom = '20px';
        displayDiv.appendChild(wordEl);

        const hintEl = document.createElement('p');
        hintEl.innerHTML = `<em>Pista: ${currentWordObj.h}</em>`;
        hintEl.className = 'text-muted mb-3';
        displayDiv.appendChild(hintEl);

        const hangmanEl = document.createElement('div');
        hangmanEl.style.marginBottom = '20px';
        hangmanEl.style.textAlign = 'center';
        displayDiv.appendChild(hangmanEl);
        
        const hangmanStages = [
            "  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========",
            "  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========",
            "  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========",
            "  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========",
            "  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========",
            "  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========",
            "  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n========="
        ];

        const keyboardEl = document.createElement('div');
        keyboardEl.style.display = 'flex';
        keyboardEl.style.flexWrap = 'wrap';
        keyboardEl.style.gap = '5px';
        keyboardEl.style.justifyContent = 'center';
        keyboardEl.style.maxWidth = '400px';
        keyboardEl.style.margin = '0 auto';
        container.appendChild(keyboardEl);

        const updateDisplay = () => {
            wordEl.textContent = guessed.join(' ');
            hangmanEl.innerHTML = `<pre style="font-family: monospace; font-size: 1.2rem; font-weight: bold; line-height: 1.2; color: var(--danger); margin: 0 auto; text-align: left; display: inline-block; background: var(--bg-color); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">${hangmanStages[mistakes]}</pre>`;
        };

        const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
        alphabet.forEach(letter => {
            const btn = document.createElement('button');
            btn.textContent = letter;
            btn.className = 'btn btn-outline btn-sm';
            btn.style.width = '40px';
            btn.onclick = () => {
                btn.disabled = true;
                if (word.includes(letter)) {
                    btn.classList.replace('btn-outline', 'btn-secondary');
                    for (let i = 0; i < word.length; i++) {
                        if (word[i] === letter) guessed[i] = letter;
                    }
                    this.addPoints(20, btn);
                    updateDisplay();
                    
                    if (!guessed.includes('_')) {
                        setTimeout(() => this.endGame(true, "¡Palabra descubierta!"), 1000);
                    }
                } else {
                    btn.classList.replace('btn-outline', 'btn-danger');
                    mistakes++;
                    this.addPoints(-10, btn);
                    updateDisplay();
                    
                    if (mistakes >= maxMistakes) {
                        setTimeout(() => this.endGame(false, `La palabra era: ${word}`), 1000);
                    }
                }
            };
            keyboardEl.appendChild(btn);
        });

        this.startTimer(90);
        updateDisplay();
    },

    // =====================================
    // Misión 7: Conectar Conceptos
    // =====================================
    startJuego7(container) {
        const title = document.createElement('h3');
        title.innerHTML = '<i class="fa-solid fa-diagram-project"></i> Conectar Conceptos';
        title.className = 'text-center mb-3';
        container.appendChild(title);

        const img = document.createElement('img');
        img.src = 'assets/images/game_connect.jpg';
        img.style = 'width: 100%; max-width: 400px; height: 120px; object-fit: cover; border-radius: 12px; margin: 0 auto 20px auto; display: block; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid var(--border-color);';
        container.appendChild(img);

        const terms = [
            { id: 1, text: "Balística Interna" },
            { id: 2, text: "Balística Externa" },
            { id: 3, text: "Balística de Efectos" },
            { id: 4, text: "Cadena de Custodia" }
        ];

        const defs = [
            { id: 3, text: "Estudia los daños y perforaciones al impactar." },
            { id: 1, text: "Fenómenos dentro del arma tras la percusión." },
            { id: 4, text: "Garantiza que la evidencia no sea alterada." },
            { id: 2, text: "Trayectoria del proyectil en el aire." }
        ];

        const flexContainer = document.createElement('div');
        flexContainer.style.display = 'flex';
        flexContainer.style.justifyContent = 'space-between';
        flexContainer.style.maxWidth = '600px';
        flexContainer.style.margin = '0 auto';
        container.appendChild(flexContainer);

        const colLeft = document.createElement('div');
        const colRight = document.createElement('div');
        colLeft.style.width = '45%';
        colRight.style.width = '45%';
        flexContainer.appendChild(colLeft);
        flexContainer.appendChild(colRight);

        let selectedTerm = null;
        let connections = 0;

        const checkMatch = (defBtn, termId) => {
            if (termId === selectedTerm.dataset.id) {
                defBtn.classList.replace('btn-outline', 'btn-secondary');
                selectedTerm.classList.replace('btn-primary', 'btn-secondary');
                defBtn.disabled = true;
                selectedTerm.disabled = true;
                selectedTerm = null;
                connections++;
                this.addPoints(100, defBtn);
                
                if (connections === terms.length) {
                    setTimeout(() => this.endGame(true, "¡Conexiones correctas!"), 1000);
                }
            } else {
                this.addPoints(-20, defBtn);
                this.showFeedback(false, "Incorrecto", "Revisa la definición");
                selectedTerm.classList.replace('btn-primary', 'btn-outline');
                selectedTerm = null;
            }
        };

        terms.forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline btn-block mb-2';
            btn.textContent = t.text;
            btn.dataset.id = t.id;
            btn.style.textAlign = 'left';
            btn.onclick = () => {
                if (btn.disabled) return;
                if (selectedTerm) selectedTerm.classList.replace('btn-primary', 'btn-outline');
                selectedTerm = btn;
                btn.classList.replace('btn-outline', 'btn-primary');
            };
            colLeft.appendChild(btn);
        });

        defs.forEach(d => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline btn-block mb-2';
            btn.textContent = d.text;
            btn.style.textAlign = 'left';
            btn.style.fontSize = '0.9rem';
            btn.onclick = () => {
                if (btn.disabled) return;
                if (!selectedTerm) {
                    this.showFeedback(false, "Error", "Selecciona un concepto primero");
                    return;
                }
                checkMatch(btn, d.id.toString());
            };
            colRight.appendChild(btn);
        });

        this.startTimer(90);
    },

    // =====================================
    // Misión 8: Relacionar Imágenes
    // =====================================
    startJuego8(container) {
        const title = document.createElement('h3');
        title.innerHTML = '<i class="fa-solid fa-image"></i> Relacionar Imágenes';
        title.className = 'text-center mb-3';
        container.appendChild(title);

        const img = document.createElement('img');
        img.src = 'assets/images/game_memory.jpg';
        img.style = 'width: 100%; max-width: 400px; height: 120px; object-fit: cover; border-radius: 12px; margin: 0 auto 20px auto; display: block; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid var(--border-color);';
        container.appendChild(img);

        const symbols = ['🔫', '🔬', '🧤', '📦', '🔍', '🚨'];
        let deck = [...symbols, ...symbols];
        
        // Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        const gridEl = document.createElement('div');
        gridEl.style.display = 'grid';
        gridEl.style.gridTemplateColumns = 'repeat(4, 1fr)';
        gridEl.style.gap = '10px';
        gridEl.style.maxWidth = '400px';
        gridEl.style.margin = '0 auto';
        container.appendChild(gridEl);

        let firstCard = null;
        let secondCard = null;
        let matches = 0;
        let lockBoard = false;

        deck.forEach(sym => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.style.height = '80px';
            card.style.background = 'var(--bg-main)';
            card.style.border = '2px solid var(--border-color)';
            card.style.borderRadius = '8px';
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'center';
            card.style.fontSize = '2rem';
            card.style.cursor = 'pointer';
            card.dataset.sym = sym;
            
            card.onclick = () => {
                if (lockBoard) return;
                if (card === firstCard) return;
                if (card.classList.contains('matched')) return;

                card.textContent = sym;
                card.style.background = 'var(--primary-light)';

                if (!firstCard) {
                    firstCard = card;
                    return;
                }

                secondCard = card;
                lockBoard = true;

                if (firstCard.dataset.sym === secondCard.dataset.sym) {
                    firstCard.classList.add('matched');
                    secondCard.classList.add('matched');
                    firstCard.style.background = 'var(--secondary)';
                    secondCard.style.background = 'var(--secondary)';
                    this.addPoints(50, secondCard);
                    matches++;
                    
                    if (matches === symbols.length) {
                        setTimeout(() => this.endGame(true, "¡Imágenes emparejadas!"), 1000);
                    }
                    resetBoard();
                } else {
                    this.addPoints(-5, secondCard);
                    setTimeout(() => {
                        firstCard.textContent = '';
                        secondCard.textContent = '';
                        firstCard.style.background = 'var(--bg-main)';
                        secondCard.style.background = 'var(--bg-main)';
                        resetBoard();
                    }, 1000);
                }
            };
            gridEl.appendChild(card);
        });

        const resetBoard = () => {
            [firstCard, secondCard, lockBoard] = [null, null, false];
        };

        this.startTimer(60);
    }
});
