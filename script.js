import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    getDocs, 
    where,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// CONFIGURACIÓN FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDBw4f59W7E4H-LSnrzZlhxk24_HWkpyNE",
  authDomain: "balisticaforense-2770a.firebaseapp.com",
  projectId: "balisticaforense-2770a",
  storageBucket: "balisticaforense-2770a.firebasestorage.app",
  messagingSenderId: "1093018109964",
  appId: "1:1093018109964:web:e9abcf0cf33de007c44629"
};

// Inicialización de Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// ==========================================
// DATOS DEL JUEGO (PREGUNTAS)
// ==========================================
const preguntasDesafio = {
    1: [ // Nivel 1: Conceptos básicos
        { p: "¿Qué estudia principalmente la balística forense?", o: ["Evidencia relacionada con armas de fuego", "Meteorología", "Medicina general", "Electricidad"], c: 0, exp: "La balística forense se centra en las armas de fuego y la evidencia asociada para la investigación criminal." },
        { p: "¿Cuál no es una rama de la balística forense?", o: ["Interna", "Externa", "Financiera", "Terminal"], c: 2, exp: "Las ramas principales son interna, externa, terminal e identificativa." },
        { p: "¿Qué analiza la balística interna?", o: ["El vuelo del proyectil", "Lo que ocurre dentro del arma", "Las heridas en la víctima", "El clima del lugar"], c: 1, exp: "Estudia los fenómenos desde la percusión hasta que el proyectil abandona el cañón." },
        { p: "¿Qué es un casquillo o vaina?", o: ["La parte frontal del proyectil", "El contenedor de la pólvora y el fulminante", "El mecanismo de disparo", "El cañón del arma"], c: 1, exp: "El casquillo contiene la carga propulsora y es expulsado o retenido tras el disparo." },
        { p: "¿Para qué sirve el estriado del cañón?", o: ["Para que el arma se vea mejor", "Para darle giro y estabilidad al proyectil", "Para reducir el sonido", "Para que no se oxide"], c: 1, exp: "El estriado hace girar el proyectil, estabilizándolo en su trayectoria." }
    ],
    2: [ // Nivel 2: Balística forense
        { p: "¿Qué estudia la balística externa?", o: ["Las marcas en el casquillo", "La trayectoria del proyectil en el aire", "Los daños en el objetivo", "La fabricación de pólvora"], c: 1, exp: "Analiza el recorrido del proyectil desde que sale del cañón hasta el impacto." },
        { p: "¿Qué es la balística terminal o de efectos?", o: ["El estudio de los daños en el blanco", "El estudio de la balística en estaciones", "El estudio del sonido del disparo", "La limpieza del arma"], c: 0, exp: "Estudia los efectos, perforaciones y daños que produce el proyectil al impactar." },
        { p: "¿Qué busca la balística identificativa?", o: ["Saber el precio del arma", "Identificar quién la fabricó", "Vincular casquillos y proyectiles a un arma específica", "Identificar a la víctima"], c: 2, exp: "Se encarga de identificar si una munición fue percutida o disparada por un arma en particular." },
        { p: "¿Qué tipo de marcas deja la aguja percutora?", o: ["En el estriado", "En el fulminante del casquillo", "En el aire", "En el cargador"], c: 1, exp: "La aguja golpea el fulminante para iniciar la detonación, dejando una marca característica." },
        { p: "¿El calibre se refiere a?", o: ["El peso del arma", "El diámetro interno del cañón o del proyectil", "La longitud del arma", "El color de la munición"], c: 1, exp: "El calibre es la medida del diámetro interno del cañón o del proyectil." }
    ],
    3: [ // Nivel 3: Evidencia y análisis
        { p: "¿Cuál es una regla de oro al manipular un arma en el lugar de los hechos?", o: ["Descargarla inmediatamente", "Limpiarla", "No introducir objetos en el cañón", "Dispararla para probar"], c: 2, exp: "Introducir objetos (como lápices) en el cañón puede dañar las estrías que son evidencia clave." },
        { p: "¿Por dónde se debe tomar un arma encontrada como evidencia?", o: ["Por el cañón", "Por zonas no estriadas/rugosas (guardamonte o cachas)", "Por el gatillo", "Con cualquier parte de la mano"], c: 1, exp: "Se toman de lugares donde es menos probable encontrar huellas dactilares útiles." },
        { p: "¿Cómo se deben embalar las prendas con impactos de proyectil?", o: ["Mojadas y en bolsas plásticas", "Secas y en bolsas de papel", "Planchadas", "En cajas de metal"], c: 1, exp: "Deben secarse a temperatura ambiente y guardarse en papel para evitar proliferación de hongos." },
        { p: "¿Qué es el tatuaje en balística terminal?", o: ["Un dibujo en el arma", "Incrustación de granos de pólvora no quemada en la piel", "Una marca de fábrica", "Un tipo de munición"], c: 1, exp: "El tatuaje se produce en disparos a corta distancia por la pólvora incombusta." },
        { p: "Los proyectiles recuperados deben...", o: ["Lavarse con cloro", "Embalarse individualmente en algodón o papel suave", "Guardarse todos juntos en un frasco", "Fundirse"], c: 1, exp: "Se embalan por separado para que no se rocen y pierdan sus microlesiones identificativas." }
    ],
    4: [ // Nivel 4: Funciones del primer responsable
        { p: "¿Quién es el primer responsable?", o: ["El juez", "La primera autoridad que llega al lugar de los hechos", "El fiscal", "El perito balístico"], c: 1, exp: "Es la primera autoridad (policía, militar, etc.) que arriba a la escena tras el evento." },
        { p: "¿Cuál es la prioridad absoluta al llegar a la escena?", o: ["Recoger las armas", "La seguridad personal y de las víctimas", "Tomar fotos para redes sociales", "Llamar a la prensa"], c: 1, exp: "Siempre se debe priorizar la vida, brindar primeros auxilios y asegurar el área contra amenazas." },
        { p: "¿Qué significa acordonar la escena?", o: ["Atar a los sospechosos", "Delimitar y proteger el área para evitar ingresos no autorizados", "Poner cintas de adorno", "Llevarse las evidencias"], c: 1, exp: "Acordonar protege la escena de contaminación o alteración por parte de curiosos." },
        { p: "¿Debe el primer responsable recoger los casquillos del suelo?", o: ["Sí, para que no se pierdan", "No, debe preservarlos en su lugar hasta que llegue policía judicial", "Sí, y guardarlos en el bolsillo", "Sí, pero solo los grandes"], c: 1, exp: "El primer responsable preserva, la recolección la hacen los peritos capacitados (salvo riesgo inminente de pérdida)." },
        { p: "¿Qué debe hacer si llueve y hay un arma de fuego en el suelo?", o: ["Llevársela a su casa", "Protegerla cubriéndola con una caja u objeto que no la altere", "Secarla con un trapo", "Pisarla"], c: 1, exp: "Se debe proteger la evidencia de los factores climáticos sin alterar su posición original." }
    ],
    5: [ // Nivel 5: Cadena de custodia
        { p: "¿Qué es la cadena de custodia?", o: ["Una cárcel de máxima seguridad", "Procedimiento para garantizar integridad y trazabilidad de la evidencia", "Un tipo de candado", "Un collar militar"], c: 1, exp: "Es el sistema documentado que garantiza que la evidencia presentada en juicio es la misma recogida en la escena." },
        { p: "¿Cuándo inicia la cadena de custodia?", o: ["En el juicio", "En el laboratorio", "Con el hallazgo y recolección de los elementos", "Cuando el juez lo ordena"], c: 2, exp: "Inicia desde el momento mismo en que se descubre o recolecta el elemento material probatorio." },
        { p: "¿El registro de cadena de custodia incluye...", o: ["Solo el nombre de la víctima", "Fechas, horas, nombres de quienes manipulan y propósitos", "El precio de la evidencia", "El clima solamente"], c: 1, exp: "Garantiza la trazabilidad anotando quién, cuándo y por qué manipuló la evidencia." },
        { p: "¿Qué pasa si se rompe la cadena de custodia?", o: ["Nada, se arregla con cinta", "La evidencia pierde valor probatorio y puede ser rechazada en juicio", "Se paga una multa", "Se repite el delito"], c: 1, exp: "Una ruptura sugiere posible alteración o cambio de la evidencia, invalidándola legalmente." },
        { p: "¿Puede cualquier persona manipular la evidencia recolectada?", o: ["Sí, si usa guantes", "No, solo el personal autorizado y registrado en el formato", "Sí, si es militar", "Sí, por curiosidad"], c: 1, exp: "Solo las personas estrictamente necesarias y documentadas pueden manipularla." }
    ]
};

const preguntasReto = [
    {
        p: "Al patrullar, usted escucha un disparo y llega a un callejón. Hay una persona herida en el suelo y un arma a dos metros. El agresor huyó. ¿Cuál es su primer paso?",
        o: ["Tomar el arma inmediatamente para evitar accidentes", "Asegurar el área, solicitar asistencia médica y acordonar", "Perseguir al agresor dejando a la víctima y el arma solos", "Levantar a la víctima y llevarla al hospital en su patrulla"],
        c: 1,
        exp: "La prioridad es asegurar la zona de amenazas, pedir apoyo médico para salvar vidas y proteger la escena acordonando."
    },
    {
        p: "Los curiosos se acercan a la escena acordonada e intentan pasar para ver qué ocurrió. ¿Usted qué debe hacer?",
        o: ["Dejarlos pasar unos minutos", "Retirarlos y mantener el perímetro de seguridad estrictamente", "Pedirles que tomen fotos de lejos", "Ignorarlos si no tocan nada"],
        c: 1,
        exp: "El perímetro debe mantenerse intacto para evitar cualquier tipo de contaminación de la evidencia."
    },
    {
        p: "Policía judicial llega a la escena que usted aseguró. ¿Qué debe hacer?",
        o: ["Irse de inmediato", "Entregar el lugar formalmente mediante acta y explicar lo observado", "Ayudarles a recoger los casquillos", "Llevarse las cintas de acordonamiento"],
        c: 1,
        exp: "El primer responsable entrega formalmente la escena a los investigadores, informando todo lo acontecido."
    },
    {
        p: "Hay un casquillo en la calle y empieza a llover fuertemente. El agua se lo está llevando hacia una alcantarilla. Peritos aún no llegan. ¿Qué hace?",
        o: ["Dejar que se lo lleve el agua, no se puede tocar", "Recolectarlo de emergencia documentando por qué lo hizo y su posición original", "Poner el pie encima para que no se mueva", "Patearlo lejos de la alcantarilla"],
        c: 1,
        exp: "Ante riesgo inminente de pérdida o destrucción, se hace recolección de emergencia dejando constancia detallada."
    },
    {
        p: "Usted es el encargado de transportar un arma de fuego embalada hacia el almacén de evidencias. En el camino, un compañero le pide abrir la caja para ver el arma. ¿Qué hace?",
        o: ["La abre rápidamente y la vuelve a sellar", "Se niega rotundamente, argumentando la cadena de custodia", "La saca solo si el compañero usa guantes", "Le deja tomar una foto por fuera de la caja"],
        c: 1,
        exp: "El embalaje no debe abrirse sin justificación pericial formal, proteger la cadena de custodia es primordial."
    }
];


// ==========================================
// ESTADO GLOBAL Y SPA
// ==========================================
const app = {
    user: null,
    userData: null,
    currentSection: 'inicio',
    
    init() {

        this.initTheme();
        this.setupNavigation();
        this.setupTabs();
        this.setupAuthObserver();
        
        // Escuchadores de Formularios
        document.getElementById('form-login').addEventListener('submit', this.login.bind(this));
        document.getElementById('form-register').addEventListener('submit', this.register.bind(this));
        
        // Mostrar/Ocultar menú en móviles
        document.getElementById('nav-toggle').addEventListener('click', () => {
            document.getElementById('nav-links').classList.toggle('show');
        });

        // Escuchador de enrutamiento
        window.addEventListener('hashchange', this.handleRouting.bind(this));
    },

    handleRouting() {
        let hash = window.location.hash.substring(1);
        if (!hash) hash = 'portada';
        
        // Redirigir a dashboard si el usuario está logueado y trata de ir a inicio, login o register
        if (this.user && ['inicio', 'login', 'register'].includes(hash)) {
            window.location.hash = 'dashboard';
            return;
        }

        // Rutas públicas
        const publicRoutes = ['portada', 'inicio', 'login', 'register'];
        if (!this.user && !publicRoutes.includes(hash)) {
            window.location.hash = 'portada';
            return;
        }

        this.showSection(hash);
    },

    initTheme() {
        const themeToggleBtn = document.getElementById('theme-toggle');
        if (!themeToggleBtn) return;
        
        const sunIcon = themeToggleBtn.querySelector('.sun-icon');
        const moonIcon = themeToggleBtn.querySelector('.moon-icon');
        
        // Cargar preferencia guardada
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark-mode');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
        
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            
            if (isDark) {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
                localStorage.setItem('theme', 'dark');
            } else {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
                localStorage.setItem('theme', 'light');
            }
        });
    },

    showLoader(show) {
        document.getElementById('loader').classList[show ? 'remove' : 'add']('hidden');
    },

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.backgroundColor = type === 'error' ? 'var(--danger)' : 'var(--secondary-dark)';
        toast.classList.remove('hidden');
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 3000);
    },

    navigate(sectionId) {
        window.location.hash = sectionId;
    },

    showSection(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
        
        // Mostrar la solicitada o fallback
        const target = document.getElementById(`sec-${sectionId}`);
        if(target) {
            target.classList.remove('hidden');
            this.currentSection = sectionId;
        } else {
            const fallback = this.user ? 'dashboard' : 'inicio';
            document.getElementById(`sec-${fallback}`).classList.remove('hidden');
            this.currentSection = fallback;
            sectionId = fallback;
        }

        // Acciones específicas por sección
        if(sectionId === 'dashboard') this.loadDashboard();
        if(sectionId === 'ranking') this.loadRanking();
        if(sectionId === 'perfil') this.loadPerfil();
        if(sectionId === 'historial') this.loadHistorial();
        if(sectionId === 'admin') this.loadAdmin();
        if(sectionId === 'misiones') this.loadMisiones();
        if(sectionId === 'logros') this.loadLogros();
        if(sectionId === 'zona-interactiva') {
            if(window.interactivos) interactivos.volverAlMenu();
        }
        if(sectionId === 'mision-aprender') {
            const savedMision = sessionStorage.getItem('forense_nivelActual');
            if (savedMision && juego) {
                juego.nivelActual = parseInt(savedMision);
                juego.abrirMision(juego.nivelActual, true); // true indica que ya estamos en la ruta
            }
        }

        // Cerrar menú móvil si está abierto
        document.getElementById('nav-links').classList.remove('show');
        window.scrollTo(0,0);
    },

    setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Quitar activo
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
                
                // Activar la pestaña destino
                tab.classList.add('active');
                document.getElementById(tab.dataset.target).classList.remove('hidden');
            });
        });
    },

    // ==========================================
    // AUTENTICACIÓN Y USUARIOS
    // ==========================================
    setupAuthObserver() {
        this.showLoader(true);
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.user = user;
                await this.fetchUserData();
                this.updateNav(true);
                
                let hash = window.location.hash.substring(1);
                if (!hash || ['inicio', 'login', 'register'].includes(hash)) {
                    window.location.hash = 'dashboard';
                } else {
                    this.handleRouting();
                }
            } else {
                this.user = null;
                this.userData = null;
                this.updateNav(false);
                let hash = window.location.hash.substring(1);
                if (hash && !['inicio', 'login', 'register'].includes(hash)) {
                    window.location.hash = 'inicio';
                } else {
                    this.handleRouting();
                }
            }
            this.showLoader(false);
        });
    },

    
    updateNav(isLogged) {
        const nav = document.getElementById('nav-links');
        nav.innerHTML = '';
        if (isLogged) {
            nav.innerHTML = `
                <li><a href="#dashboard">Hub Principal</a></li>
                <li><a href="#misiones">Misiones</a></li>
                <li><a href="#logros">Logros</a></li>
                <li><a href="#zona-interactiva" style="color:var(--accent)"><i class="fa-solid fa-gamepad"></i> Zona Interactiva</a></li>
                <li><a href="#ranking">Ranking</a></li>
                <li><a href="#perfil">Perfil</a></li>
                ${this.userData?.isAdmin ? '<li><a href="#admin" style="color:var(--danger)">Admin</a></li>' : ''}
                <li><button class="btn btn-outline btn-sm" onclick="app.logout()">Cerrar Sesión</button></li>
            `;
        } else {
            nav.innerHTML = `
                <li><button class="btn btn-primary btn-sm" onclick="app.navigate('login')">Iniciar Sesión</button></li>
            `;
        }
    },

    async fetchUserData() {
        try {
            const docRef = doc(db, "usuarios", this.user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                let data = docSnap.data();
                // Retrocompatibilidad para usuarios antiguos
                let needsUpdate = false;
                if(data.xp === undefined) { data.xp = data.puntaje || 0; needsUpdate = true; }
                if(data.rachaMaxima === undefined) { data.rachaMaxima = 0; needsUpdate = true; }
                if(data.logros === undefined) { data.logros = []; needsUpdate = true; }
                if(data.misionesCompletadas === undefined) { data.misionesCompletadas = data.nivelesCompletados || 0; needsUpdate = true; }
                
                this.userData = data;
                
                if(needsUpdate) {
                    await updateDoc(docRef, { 
                        xp: data.xp, 
                        rachaMaxima: data.rachaMaxima, 
                        logros: data.logros,
                        misionesCompletadas: data.misionesCompletadas
                    });
                }
            } else {
                this.showToast("No se encontraron datos de usuario", "error");
            }
        } catch (error) {
            console.error(error);
        }
    },

    async register(e) {
        e.preventDefault();
        const errorP = document.getElementById('reg-error');
        errorP.textContent = "";
        
        const nombre = document.getElementById('reg-nombre').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const pass = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;

        if (pass !== confirm) {
            errorP.textContent = "Las contraseñas no coinciden.";
            return;
        }

        this.showLoader(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;
            
            await setDoc(doc(db, "usuarios", user.uid), {
                nombre: nombre,
                email: email,
                puntaje: 0,
                xp: 0,
                rachaMaxima: 0,
                logros: [],
                misionesCompletadas: 0,
                nivelActual: 1,
                preguntasRespondidas: 0,
                respuestasCorrectas: 0,
                nivelesCompletados: 0,
                fechaRegistro: new Date().toISOString(),
                isAdmin: false // Por defecto false
            });

            this.showToast("Registro exitoso");
        } catch (error) {
            this.showLoader(false);
            errorP.textContent = this.translateFirebaseError(error.code);
        }
    },

    async login(e) {
        e.preventDefault();
        const errorP = document.getElementById('login-error');
        errorP.textContent = "";
        
        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-password').value;

        this.showLoader(true);
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            this.showToast("Inicio de sesión exitoso");
            // El observador de autenticación redirigirá automáticamente
        } catch (error) {
            this.showLoader(false);
            errorP.textContent = this.translateFirebaseError(error.code);
        }
    },

    async logout() {
        this.showLoader(true);
        try {
            await signOut(auth);
            this.showToast("Sesión cerrada");
        } catch(error) {
            this.showLoader(false);
            console.error(error);
        }
    },

    translateFirebaseError(code) {
        switch(code) {
            case 'auth/email-already-in-use': return "El correo ya está registrado.";
            case 'auth/invalid-credential': return "Credenciales incorrectas.";
            case 'auth/weak-password': return "La contraseña es muy débil (mínimo 6 caracteres).";
            default: return "Ocurrió un error. Intenta nuevamente.";
        }
    },

    // ==========================================
    // VISTAS DE DATOS
    // ==========================================
    loadDashboard() {
        if(!this.userData) return;
        document.getElementById('dash-name').textContent = this.userData.nombre;
        document.getElementById('dash-level').textContent = this.userData.nivelActual;
        document.getElementById('dash-xp').textContent = (this.userData.xp || 0) + " XP";
        document.getElementById('dash-streak').textContent = this.userData.rachaMaxima || 0;
        
        let progress = Math.min(((this.userData.misionesCompletadas || 0) / 6) * 100, 100);
        document.getElementById('dash-progress-text').textContent = Math.round(progress) + "%";
        document.getElementById('dash-progress-bar').style.width = progress + "%";

        // Mostrar introducción global si es la primera vez
        if (!localStorage.getItem('forense_hasSeenIntro')) {
            setTimeout(() => {
                const modal = document.getElementById('modal-intro-global');
                if(modal) {
                    modal.classList.remove('hidden');
                    localStorage.setItem('forense_hasSeenIntro', 'true');
                }
            }, 500);
        }
    },

    loadPerfil() {
        if(!this.userData) return;
        document.getElementById('prof-name').textContent = this.userData.nombre;
        document.getElementById('prof-email').textContent = this.userData.email;
        document.getElementById('prof-score').textContent = this.userData.puntaje;
        document.getElementById('prof-level').textContent = this.userData.nivelActual;
        document.getElementById('prof-answered').textContent = this.userData.preguntasRespondidas;
        document.getElementById('prof-corrects').textContent = this.userData.respuestasCorrectas;
        
        let percent = 0;
        if (this.userData.preguntasRespondidas > 0) {
            percent = Math.round((this.userData.respuestasCorrectas / this.userData.preguntasRespondidas) * 100);
        }
        document.getElementById('prof-percent').textContent = percent + "%";
        document.getElementById('prof-completed').textContent = this.userData.nivelesCompletados;

        const pBar = document.getElementById('prof-progress-bar');
        const progress = Math.min((this.userData.nivelActual / 5) * 100, 100);
        setTimeout(() => pBar.style.width = progress + "%", 100);
    },

    async loadRanking() {
        this.showLoader(true);
        try {
            const q = query(collection(db, "usuarios"), orderBy("puntaje", "desc"));
            const querySnapshot = await getDocs(q);
            
            const tbody = document.getElementById('ranking-body');
            tbody.innerHTML = '';
            
            let pos = 1;
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if(data.isAdmin) return; // Opcional: no mostrar admins en ranking

                let medal = pos;
                if(pos === 1) medal = "1";
                if(pos === 2) medal = "2";
                if(pos === 3) medal = "3";

                const isMe = docSnap.id === this.user.uid;
                
                const tr = document.createElement('tr');
                if(isMe) tr.style.backgroundColor = "rgba(59, 130, 246, 0.15)"; // resaltar al usuario actual
                tr.innerHTML = `
                    <td><strong>${medal}</strong></td>
                    <td>${data.nombre} ${isMe ? '(Tú)' : ''}</td>
                    <td>${data.nivelActual}</td>
                    <td><strong>${data.puntaje}</strong></td>
                `;
                tbody.appendChild(tr);
                pos++;
            });
        } catch (error) {
            console.error(error);
            this.showToast("Error cargando ranking", "error");
        }
        this.showLoader(false);
    },

    async loadHistorial() {
        this.showLoader(true);
        try {
            const q = query(collection(db, "resultados"), where("usuarioId", "==", this.user.uid), orderBy("fecha", "desc"));
            const querySnapshot = await getDocs(q);
            
            const tbody = document.getElementById('historial-body');
            tbody.innerHTML = '';
            
            if(querySnapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay resultados aún. ¡Juega para ver tu historial!</td></tr>';
            }

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const date = new Date(data.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${date}</td>
                    <td>${data.juego}</td>
                    <td>${data.nivel || '-'}</td>
                    <td><strong>${data.puntaje}</strong></td>
                    <td>${data.porcentaje}%</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
            const tbody = document.getElementById('historial-body');
            tbody.innerHTML = '<tr><td colspan="5" class="text-center danger-text">Aviso: El historial no está disponible momentáneamente. Se requiere configurar la base de datos (Índice faltante).</td></tr>';
        }
        this.showLoader(false);
    },

    async loadAdmin() {
        if(!this.userData?.isAdmin) {
            this.navigate('dashboard');
            return;
        }
        this.showLoader(true);
        try {
            const q = query(collection(db, "usuarios"), orderBy("puntaje", "desc"));
            const querySnapshot = await getDocs(q);
            
            const tbody = document.getElementById('admin-users-body');
            tbody.innerHTML = '';
            
            let count = 0;
            let best = 0;

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                count++;
                if(data.puntaje > best) best = data.puntaje;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${data.nombre} ${data.isAdmin ? '(Admin)' : ''}</td>
                    <td>${data.email}</td>
                    <td>${data.puntaje}</td>
                    <td>${data.nivelActual}</td>
                    <td>
                        <button class="btn btn-outline btn-sm" onclick="app.resetUser('${docSnap.id}')">Reset Puntos</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.getElementById('admin-total-users').textContent = count;
            document.getElementById('admin-best-score').textContent = best;

        } catch (error) {
            console.error(error);
        }
        this.showLoader(false);
    },

    async resetUser(uid) {
        if(!confirm("¿Seguro que deseas reiniciar el progreso de este usuario?")) return;
        this.showLoader(true);
        try {
            const docRef = doc(db, "usuarios", uid);
            await updateDoc(docRef, {
                puntaje: 0,
                nivelActual: 1,
                preguntasRespondidas: 0,
                respuestasCorrectas: 0,
                nivelesCompletados: 0
            });
            this.showToast("Usuario reiniciado");
            this.loadAdmin();
        } catch (error) {
            console.error(error);
            this.showToast("Error al reiniciar", "error");
        }
        this.showLoader(false);
    },

    
    loadMisiones() {
        const container = document.getElementById('mission-map-container');
        container.innerHTML = '';
        
        const misionesData = [
            { id: 1, title: 'Conociendo la evidencia', desc: 'Conceptos básicos de balística', icon: '<i class="fa-solid fa-magnifying-glass" style="color:var(--primary)"></i>' },
            { id: 2, title: 'Analizando la escena', desc: 'Balística forense y sus tipos', icon: '<i class="fa-solid fa-microscope" style="color:var(--primary)"></i>' },
            { id: 3, title: 'El primer responsable', desc: 'Funciones generales en la escena', icon: '<i class="fa-solid fa-shield-halved" style="color:var(--secondary)"></i>' },
            { id: 4, title: 'Protegiendo la evidencia', desc: 'Preservación de elementos probatorios', icon: '<i class="fa-solid fa-truck-medical" style="color:var(--danger)"></i>' },
            { id: 5, title: 'Cadena de custodia', desc: 'Trazabilidad y registro legal', icon: '<i class="fa-solid fa-file-contract" style="color:var(--accent)"></i>' },
            { id: 6, title: 'Desafío Forense', desc: 'Misión Final: Pon a prueba todo tu conocimiento', icon: '<i class="fa-solid fa-trophy" style="color:var(--accent)"></i>' }
        ];

        let nivelesCompletados = this.userData.misionesCompletadas || 0;

        misionesData.forEach(m => {
            const node = document.createElement('div');
            node.className = 'mission-node';
            
            if (m.id <= nivelesCompletados) {
                node.classList.add('completed');
                node.innerHTML = `
                    <div class="mission-icon">${m.icon}</div>
                    <h4>Misión ${m.id}: ${m.title}</h4>
                    <p>Completada <i class=\'fa-solid fa-check\'></i></p>
                `;
                node.onclick = () => juego.abrirMision(m.id);
            } else if (m.id === nivelesCompletados + 1) {
                node.classList.add('active');
                node.innerHTML = `
                    <div class="mission-icon">${m.icon}</div>
                    <h4>Misión ${m.id}: ${m.title}</h4>
                    <p>${m.desc}</p>
                    <button class="btn btn-primary btn-sm mt-2">Iniciar Misión</button>
                `;
                node.onclick = () => juego.abrirMision(m.id);
            } else {
                node.classList.add('locked');
                node.innerHTML = `
                    <div class="mission-icon"><i class=\'fa-solid fa-lock\'></i></div>
                    <h4>Misión ${m.id}</h4>
                    <p>Bloqueada</p>
                `;
            }
            container.appendChild(node);
        });
    },

    loadLogros() {
        const container = document.getElementById('achievements-container');
        container.innerHTML = '';
        const userLogros = this.userData.logros || [];
        
        const todosLogros = [
            { id: 'primer_desafio', icon: '<i class="fa-solid fa-trophy" style="color:var(--accent)"></i>', title: 'Primer desafío', desc: 'Completar la primera misión.' },
            { id: 'precision', icon: '<i class="fa-solid fa-bullseye" style="color:var(--primary)"></i>', title: 'Precisión', desc: 'Obtener 100% en una misión.' },
            { id: 'racha_5', icon: '<i class="fa-solid fa-fire" style="color:var(--danger)"></i>', title: 'Racha', desc: 'Responder 5 preguntas correctamente seguidas.' },
            { id: 'estudiante', icon: '<i class="fa-solid fa-book" style="color:var(--primary)"></i>', title: 'Estudiante', desc: 'Completar los 5 módulos educativos.' },
            { id: 'investigador', icon: '<i class="fa-solid fa-scale-balanced" style="color:var(--secondary)"></i>', title: 'Investigador', desc: 'Completar el Desafío Forense final.' }
        ];

        todosLogros.forEach(l => {
            const card = document.createElement('div');
            card.className = 'achievement-card';
            if(userLogros.includes(l.id)) {
                card.classList.add('unlocked');
            } else {
                card.classList.add('locked');
            }
            card.innerHTML = `
                <div class="achievement-icon">${l.icon}</div>
                <h4>${l.title}</h4>
                <p>${l.desc}</p>
            `;
            container.appendChild(card);
        });
    },

    setupNavigation() {}

};

// ==========================================
// LÓGICA DE JUEGOS
// ==========================================
const juego = {
    nivelActual: 1,
    preguntas: [],
    indicePregunta: 0,
    aciertosNivel: 0,
    xpGanada: 0,
    rachaActual: 0,
    rachaMaximaMision: 0,

    abrirMision(misionId, skipNavigate = false) {
        this.nivelActual = misionId;
        sessionStorage.setItem('forense_nivelActual', misionId);
        if(!skipNavigate) app.navigate('mision-aprender');
        
        document.getElementById('learn-title').textContent = `Misión ${misionId}: Aprende y Prepárate`;
        
        const content = document.getElementById('learn-content');
        content.innerHTML = ''; 

        let html = '';
        if(misionId === 1) {
            html = `<div class="learn-card">
                        <h4><i class="fa-solid fa-magnifying-glass"></i> Tema 1: Balística Forense</h4>
                        <p>La <strong>Balística Forense</strong> es la disciplina científica que analiza las armas de fuego, las municiones empleadas y los efectos que producen al ser disparadas. Combina principios de física, química y matemáticas para reconstruir hechos delictivos y resolver problemas legales.</p>
                        <ul>
                            <li><strong>Balística Interior:</strong> Estudia lo que ocurre dentro del arma.</li>
                            <li><strong>Balística Exterior:</strong> Estudia la trayectoria del proyectil en el aire.</li>
                            <li><strong>Balística de Efectos:</strong> Estudia los daños causados en el objetivo.</li>
                        </ul>
                    </div>
                    <div class="learn-card">
                        <h4><i class="fa-solid fa-bullseye"></i> Objetivo Principal</h4>
                        <p>El propósito fundamental es establecer una relación irrefutable entre el arma disparada, los proyectiles encontrados (o casquillos), la escena del crimen y la víctima. Esta ciencia es clave para aportar pruebas objetivas en un juicio.</p>
                    </div>`;
        } else if(misionId === 2) {
            html = `<div class="learn-card">
                        <h4><i class="fa-solid fa-microscope"></i> Profundizando: Balística Interna y Externa</h4>
                        <p>La <strong>Balística Interna</strong> abarca desde el momento en que la aguja percutora golpea el fulminante del cartucho, hasta que el proyectil abandona la boca del cañón. Aquí es vital estudiar el 'estriado', que le da giro y estabilidad a la bala.</p>
                        <p>La <strong>Balística Externa</strong> analiza el vuelo del proyectil, influenciado por factores como la gravedad, la resistencia del viento y la velocidad inicial. Permite calcular el ángulo y la distancia de disparo.</p>
                    </div>
                    <div class="learn-card">
                        <h4><i class="fa-solid fa-burst"></i> Balística Terminal e Identificativa</h4>
                        <p>La <strong>Balística Terminal (o de Efectos)</strong> estudia las lesiones o daños provocados al impactar. La <strong>Identificativa</strong> es como tomar huellas dactilares: estudia las marcas microscópicas únicas que el arma deja grabadas en balas y casquillos.</p>
                    </div>`;
        } else if(misionId === 3) {
            html = `<div class="learn-card">
                        <h4><i class="fa-solid fa-shield-halved"></i> Tema 2: El Primer Responsable</h4>
                        <p>El <strong>Primer Responsable</strong> es la primera autoridad (policía, paramédico, bombero) que llega al lugar de los hechos. Su actuación es crítica, ya que un error inicial puede contaminar irreparablemente la escena del crimen.</p>
                        <ul>
                            <li><strong>Prioridad #1:</strong> Proteger la vida y brindar primeros auxilios si hay heridos.</li>
                            <li><strong>Prioridad #2:</strong> Proteger y asegurar el lugar de los hechos.</li>
                        </ul>
                    </div>
                    <div class="learn-card">
                        <h4><i class="fa-solid fa-truck-medical"></i> Aseguramiento del Perímetro</h4>
                        <p>Debe establecer cordones de seguridad (policivos) para evitar la entrada de curiosos, prensa o familiares que puedan alterar evidencias. Se definen tres zonas: Interior (crítica), Exterior (restringida) y Amplia (libre).</p>
                    </div>`;
        } else if(misionId === 4) {
            html = `<div class="learn-card">
                        <h4><i class="fa-solid fa-mitten"></i> Preservación de Evidencia Balística</h4>
                        <p>Regla de oro: <strong>No tocar, no mover y no alterar nada</strong> hasta que llegue el equipo forense especializado. Las armas de fuego halladas no deben ser manipuladas y, bajo ninguna circunstancia, se deben introducir lápices u objetos en el cañón para levantarlas, ya que esto daña el estriado (evidencia clave).</p>
                    </div>
                    <div class="learn-card">
                        <h4><i class="fa-solid fa-clipboard"></i> Documentación y Reporte</h4>
                        <p>El Primer Responsable debe tomar notas precisas: la hora de llegada, el clima, las personas presentes, olores extraños (ej. pólvora) y cualquier alteración estrictamente necesaria que haya tenido que hacer (ej. mover un mueble para salvar a una víctima).</p>
                    </div>`;
        } else if(misionId === 5) {
            html = `<div class="learn-card">
                        <h4><i class="fa-solid fa-file-contract"></i> La Cadena de Custodia</h4>
                        <p>Es un procedimiento documentado que garantiza la autenticidad, integridad y mismidad de la evidencia física. Es decir, asegura que el indicio presentado en el juicio es exactamente el mismo que se encontró en la escena del crimen, sin haber sido alterado o sustituido.</p>
                    </div>
                    <div class="learn-card">
                        <h4><i class="fa-solid fa-box-open"></i> Embalaje y Trazabilidad</h4>
                        <p>Los casquillos y balas deben recogerse con pinzas con puntas de goma y guardarse en contenedores individuales adecuados (cajas de cartón pequeñas, no bolsas de plástico que acumulen humedad). Cada traspaso de la evidencia debe quedar firmado y registrado con fecha y hora.</p>
                    </div>`;
        } else if(misionId === 6) {
            html = `<div class="learn-card">
                        <h4><i class="fa-solid fa-trophy"></i> El Gran Desafío Forense</h4>
                        <p>Has completado el entrenamiento sobre Balística Forense, el rol del Primer Responsable y la Cadena de Custodia. Estás a punto de enfrentarte al examen final.</p>
                        <p>Deberás aplicar tu criterio en situaciones prácticas y resolver crímenes simulados. ¡Solo los mejores logran el grado de Investigador Experto!</p>
                    </div>`;
        }
        
        content.innerHTML = html;
    },

    iniciarQuiz() {
        this.preguntas = (this.nivelActual === 6) ? this.shuffle([...preguntasReto]) : this.shuffle([...preguntasDesafio[this.nivelActual]]);
        this.indicePregunta = 0;
        this.aciertosNivel = 0;
        this.xpGanada = 0;
        this.rachaActual = 0;
        this.rachaMaximaMision = 0;

        document.getElementById('quiz-title').textContent = this.nivelActual === 6 ? 'Misión Final: Desafío Forense' : `Misión ${this.nivelActual}`;
        document.getElementById('quiz-streak-container').classList.add('hidden');
        document.getElementById('quiz-feedback').classList.add('hidden');
        document.getElementById('quiz-progress-bar').style.width = '0%';
        
        app.navigate('mision-quiz');
        this.showPregunta();
    },

    showPregunta() {
        const p = this.preguntas[this.indicePregunta];
        document.getElementById('quiz-counter').textContent = `Pregunta ${this.indicePregunta + 1} / ${this.preguntas.length}`;
        
        const progress = (this.indicePregunta / this.preguntas.length) * 100;
        document.getElementById('quiz-progress-bar').style.width = progress + '%';

        document.getElementById('quiz-question').textContent = p.p;
        document.getElementById('quiz-feedback').classList.add('hidden');
        
        const optsContainer = document.getElementById('quiz-options');
        optsContainer.innerHTML = '';
        
        p.o.forEach((optText, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = optText;
            btn.onclick = () => this.checkAnswer(index, btn);
            optsContainer.appendChild(btn);
        });
    },

    checkAnswer(selectedIndex, btnElement) {
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach(b => b.disabled = true);

        const p = this.preguntas[this.indicePregunta];
        const isCorrect = selectedIndex === p.c;
        const feedback = document.getElementById('quiz-feedback');
        const fTitle = document.getElementById('feedback-title');
        const fDesc = document.getElementById('feedback-desc');
        const fIcon = document.getElementById('feedback-icon');
        const fXp = document.getElementById('feedback-xp');
        
        feedback.className = 'quiz-feedback'; // Reiniciar clases

        if(isCorrect) {
            btnElement.classList.add('correct');
            this.aciertosNivel++;
            this.rachaActual++;
            if(this.rachaActual > this.rachaMaximaMision) this.rachaMaximaMision = this.rachaActual;
            
            let xpEarned = 100;
            if(this.rachaActual >= 3) xpEarned += 50; 
            this.xpGanada += xpEarned;

            fTitle.textContent = "¡CORRECTO!";
            fIcon.innerHTML = "<i class='fa-solid fa-check'></i>";
            fXp.textContent = `+${xpEarned} XP`;
            fXp.style.display = 'inline-block';
        } else {
            btnElement.classList.add('incorrect');
            buttons[p.c].classList.add('correct');
            this.rachaActual = 0;

            feedback.classList.add('incorrect');
            fTitle.textContent = "INCORRECTO";
            fIcon.innerHTML = "<i class='fa-solid fa-xmark'></i>";
            fXp.style.display = 'none';
        }

        const streakCont = document.getElementById('quiz-streak-container');
        if(this.rachaActual >= 2) {
            streakCont.classList.remove('hidden');
            document.getElementById('quiz-streak').textContent = this.rachaActual;
        } else {
            streakCont.classList.add('hidden');
        }

        fDesc.textContent = p.exp;
        feedback.classList.remove('hidden');

        document.getElementById('btn-next-question').onclick = () => {
            this.indicePregunta++;
            if(this.indicePregunta < this.preguntas.length) {
                this.showPregunta();
            } else {
                this.finishJuego();
            }
        };
    },

    async finishJuego() {
        app.showLoader(true);
        const totalPreguntas = this.preguntas.length;
        const porcentaje = Math.round((this.aciertosNivel / totalPreguntas) * 100);
        let mensaje = "";
        let nuevaMisionAlcanzada = false;
        let isMissionPassed = porcentaje >= 80;
        
        let pExtra = 0;
        let nuevosLogros = [];

        const currentLogros = app.userData.logros || [];
        if(this.nivelActual === 1 && isMissionPassed && !currentLogros.includes('primer_desafio')) {
            nuevosLogros.push('primer_desafio');
        }
        if(porcentaje === 100 && !currentLogros.includes('precision')) {
            nuevosLogros.push('precision');
        }
        if(this.rachaMaximaMision >= 5 && !currentLogros.includes('racha_5')) {
            nuevosLogros.push('racha_5');
        }

        if(isMissionPassed) {
            if(this.nivelActual === (app.userData.misionesCompletadas + 1)) {
                mensaje = "¡Felicidades! Has superado la misión y desbloqueado la siguiente.";
                nuevaMisionAlcanzada = true;
                pExtra = 500; 
                
                if(this.nivelActual === 5 && !currentLogros.includes('estudiante')) nuevosLogros.push('estudiante');
                if(this.nivelActual === 6 && !currentLogros.includes('investigador')) nuevosLogros.push('investigador');
            } else {
                mensaje = "¡Buen trabajo! Superaste la misión.";
            }
        } else {
            mensaje = "No alcanzaste el 80% de precisión necesario para completar la misión. ¡Inténtalo de nuevo!";
        }

        this.xpGanada += pExtra;

        document.getElementById('res-title').innerHTML = isMissionPassed ? '<i class="fa-solid fa-trophy"></i> ¡Misión Completada!' : '<i class="fa-solid fa-triangle-exclamation"></i> Misión Fallida';
        document.getElementById('res-xp').textContent = `+${this.xpGanada} XP`;
        document.getElementById('res-corrects').textContent = `${this.aciertosNivel}/${totalPreguntas}`;
        document.getElementById('res-percent').textContent = `${porcentaje}%`;
        document.getElementById('res-message').textContent = mensaje;
        
        const unlockUI = document.getElementById('res-unlock');
        if(nuevaMisionAlcanzada && this.nivelActual < 6) {
            unlockUI.classList.remove('hidden');
        } else {
            unlockUI.classList.add('hidden');
        }

        try {
            let completadas = app.userData.misionesCompletadas || 0;
            if(nuevaMisionAlcanzada) completadas++;

            const allLogros = [...new Set([...currentLogros, ...nuevosLogros])];
            const maxRachaGlobal = Math.max(app.userData.rachaMaxima || 0, this.rachaMaximaMision);
            
            const newXp = (app.userData.xp || 0) + this.xpGanada;
            const newScore = (app.userData.puntaje || 0) + this.xpGanada;
            const newQuestions = (app.userData.preguntasRespondidas || 0) + totalPreguntas;
            const newCorrects = (app.userData.respuestasCorrectas || 0) + this.aciertosNivel;
            const newLevel = completadas + 1 > 6 ? 6 : completadas + 1;

            app.userData.xp = newXp;
            app.userData.puntaje = newScore;
            app.userData.misionesCompletadas = completadas;
            app.userData.logros = allLogros;
            app.userData.rachaMaxima = maxRachaGlobal;
            app.userData.preguntasRespondidas = newQuestions;
            app.userData.respuestasCorrectas = newCorrects;
            app.userData.nivelActual = newLevel;

            // 1. Guardar Resultado 
            const docRef = doc(db, "usuarios", app.user.uid);
            await updateDoc(docRef, {
                puntaje: newScore,
                xp: newXp,
                nivelActual: newLevel,
                misionesCompletadas: completadas,
                logros: allLogros,
                rachaMaxima: maxRachaGlobal,
                preguntasRespondidas: newQuestions,
                respuestasCorrectas: newCorrects
            });

            await addDoc(collection(db, "resultados"), {
                usuarioId: app.user.uid,
                juego: `Mision ${this.nivelActual}`,
                nivel: this.nivelActual,
                puntaje: this.xpGanada,
                correctas: this.aciertosNivel,
                total: totalPreguntas,
                porcentaje: porcentaje,
                fecha: new Date().toISOString()
            });

        } catch (fbErr) {
            console.error("Firebase save error: ", fbErr);
        }

        
        app.showLoader(false);
        app.navigate('juego-resultado');
    },

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};

// Exportar funciones globalmente para eventos de clic en HTML
window.app = app;
window.juego = juego;

// Iniciar
document.addEventListener('DOMContentLoaded', () => {
    app.init();
    if(window.interactivos) interactivos.init();
});
