/* ==========================================================================
   BACKSTAGE.DG - LOGICA DE FUNCIONALIDAD COMPLETA (VERSIÓN 1.5 - FILTRO INTELIGENTE)
   ========================================================================== */

// Base de datos simulada de músicos
let musiciansData = [
    {
        id: 1,
        name: "Carlos Delgado",
        role: "Música en Vivo",
        genres: "Rock, Blues",
        bio: "Guitarrista y vocalista con más de 10 años de experiencia en bandas de circuito nacional. Especialista en directos de alta energía.",
        photo: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80",
        instagram: "https://instagram.com",
        spotify: "https://spotify.com",
        youtube: "https://youtube.com",
        active: true
    },
    {
        id: 2,
        name: "Elena Rossi",
        role: "Compositores",
        genres: "Cinematográfico, Clásica Contemporánea",
        bio: "Compositora y arreglista enfocada en bandas sonoras para cortometrajes y piezas publicitarias emocionales.",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        instagram: "https://instagram.com",
        spotify: "https://spotify.com",
        youtube: "",
        active: true
    },
    {
        id: 3,
        name: "David Funk",
        role: "Productores",
        genres: "Funk, Pop, Hip-Hop",
        bio: "Productor e ingeniero de mezcla en constante búsqueda de sonidos groove y ritmos modernos. Dueño de Groove Studio.",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        instagram: "",
        spotify: "https://spotify.com",
        youtube: "https://youtube.com",
        active: false // Este perfil nacerá oculto para el público, visible solo para admin
    },
    {
        id: 4,
        name: "Sofía Martínez",
        role: "Músicos de Sesión",
        genres: "Jazz, Funk, Pop",
        bio: "Bajista profesional egresada de conservatorio. Disponible para grabaciones de estudio remotas y giras internacionales.",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        instagram: "https://instagram.com",
        spotify: "",
        youtube: "https://youtube.com",
        active: true
    }
];

// Usuarios simulados en el sistema
const validUsers = {
    "admin": { password: "admin123", role: "admin" },
    "musico": { password: "musico123", role: "musico" }
};

// Variables globales de control de estado y sesión de usuarios
let currentFilter = "todos";
let currentUserRole = "invitado"; 

// Nodos principales del DOM
const cardsGrid = document.getElementById('cards-grid');
const dynamicTitle = document.getElementById('dynamic-section-title');
const lineupDropdownLinks = document.querySelectorAll('.dropdown-content a');
const authContainer = document.getElementById('auth-buttons-container');
const sessionIndicator = document.getElementById('session-indicator');

// Nodos del Formulario y Modal de Perfiles
const modal = document.getElementById('musician-modal');
const closeModalBtn = document.getElementById('close-modal');
const musicianForm = document.getElementById('musician-form');
const photoInput = document.getElementById('form-photo-url');
const photoPreview = document.getElementById('photo-preview');

// Nodos del Modal de Login
const loginModal = document.getElementById('login-modal');
const closeLoginModalBtn = document.getElementById('close-login-modal');
const loginForm = document.getElementById('login-form');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');

/* ==========================================================================
   1. RENDERIZADO DEL DIRECTORIO DE TARJETAS
   ========================================================================== */
function renderDirectory() {
    if (!cardsGrid) return;
    cardsGrid.innerHTML = '';

    // Filtrado inteligente: oculta los pausados para el público, pero los muestra al admin
    const filteredData = musiciansData.filter(musico => {
        // Si el usuario NO es administrador y el perfil está pausado, se elimina de la lista visual
        if (currentUserRole !== "admin" && !musico.active) {
            return false;
        }

        // Aplicar el filtro de categorías del menú Lineup
        if (currentFilter === "todos") return true;
        
        const rRol = musico.role.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const rFiltro = currentFilter.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return rRol === rFiltro;
    });

    if (filteredData.length === 0) {
        cardsGrid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #888; padding: 50px 0;">No se encontraron perfiles activos en esta categoría.</p>`;
        return;
    }

    filteredData.forEach(musico => {
        const card = document.createElement('div');
        card.className = 'musician-card';
        
        // El administrador ve los perfiles pausados con una opacidad reducida
        if (!musico.active) {
            card.style.opacity = "0.45";
            card.style.border = "1px dashed #fd7e14";
        }

        let instagramHtml = musico.instagram ? `<a href="${musico.instagram}" target="_blank"><i class="fab fa-instagram"></i></a>` : '';
        let spotifyHtml = musico.spotify ? `<a href="${musico.spotify}" target="_blank"><i class="fab fa-spotify"></i></a>` : '';
        let youtubeHtml = musico.youtube ? `<a href="${musico.youtube}" target="_blank"><i class="fab fa-youtube"></i></a>` : '';
        
        const hasSocial = instagramHtml || spotifyHtml || youtubeHtml;

        let statusBadgeHtml = '';
        if (currentUserRole === "admin") {
            if (musico.active) {
                statusBadgeHtml = `<span class="card-status-badge" style="background:#28a745; color:#fff; border:1px solid #1e7e34;"><i class="fas fa-check-circle"></i> Activo / Al día</span>`;
            } else {
                statusBadgeHtml = `<span class="card-status-badge" style="background:#fd7e14; color:#fff; border:1px solid #bc5a00;"><i class="fas fa-pause-circle"></i> Perfil Pausado</span>`;
            }
        } else if (currentUserRole === "musico" && musico.id === 1) {
            statusBadgeHtml = musico.active 
                ? `<span class="card-status-badge" style="background:#0056b3; color:#fff;"><i class="fas fa-user"></i> Tu Perfil Activo</span>`
                : `<span class="card-status-badge" style="background:#dc3545; color:#fff;"><i class="fas fa-wallet"></i> Revisar Suscripción</span>`;
        }

        let adminActionsHtml = '';
        if (currentUserRole === "admin") {
            adminActionsHtml = `
                <div class="card-status-controls" style="display:flex; gap:10px; margin-bottom:12px; width:100%;">
                    ${musico.active 
                        ? `<button class="btn-status-deactivate" onclick="toggleProfileStatus(${musico.id}, false)"><i class="fas fa-pause"></i> Pausar</button>`
                        : `<button class="btn-status-activate" onclick="toggleProfileStatus(${musico.id}, true)"><i class="fas fa-play"></i> Activar</button>`
                    }
                </div>
                <div class="card-actions">
                    <button class="btn-edit-card" onclick="openEditModal(${musico.id})"><i class="fas fa-edit"></i> Editar Perfil</button>
                    <button class="btn-delete-card" onclick="deleteMusician(${musico.id})"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        } else if (currentUserRole === "musico" && musico.id === 1) {
            adminActionsHtml = `
                <div class="card-actions">
                    <button class="btn-edit-card" onclick="openEditModal(${musico.id})" style="width: 100%;"><i class="fas fa-user-edit"></i> Actualizar Mis Datos</button>
                </div>
            `;
        }

        card.innerHTML = `
            ${statusBadgeHtml}
            <div class="card-photo" style="background-image: url('${musico.photo || 'https://via.placeholder.com/150'}')"></div>
            <span class="card-role">${musico.role}</span>
            <h3 class="card-name">${musico.name}</h3>
            <p style="font-size: 0.8rem; color: #888; margin-bottom: 12px; font-weight:600;">${musico.genres}</p>
            <div class="card-bio-container">
                <p class="card-bio">${musico.bio}</p>
            </div>
            <div class="card-social-links">
                ${hasSocial ? `${instagramHtml}${spotifyHtml}${youtubeHtml}` : '<span style="color:#444; font-size:0.8rem;">Sin redes</span>'}
            </div>
            ${adminActionsHtml}
        `;
        cardsGrid.appendChild(card);
    });
}

/* ==========================================================================
   2. SISTEMA DE FILTRADO DINÁMICO (MENÚ LINEUP)
   ========================================================================== */
lineupDropdownLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        
        const selectedCategory = link.getAttribute('data-category');
        if (!selectedCategory) return;

        currentFilter = selectedCategory;
        dynamicTitle.textContent = currentFilter === "todos" ? "Lineup Oficial" : `Lineup: ${link.textContent}`;
        renderDirectory();

        const targetSection = document.getElementById('directorio');
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

/* ==========================================================================
   3. GESTIÓN DE AUTENTICACIÓN (ESCUCHA GLOBAL DIRECTA)
   ========================================================================== */
function setupAuthUI() {
    if (!authContainer || !sessionIndicator) return;

    if (currentUserRole === "invitado") {
        authContainer.innerHTML = `<button id="btn-login" class="btn-login-nav">Iniciar Sesión</button>`;
        sessionIndicator.style.display = 'none';
    } else {
        authContainer.innerHTML = `<button id="btn-logout" class="btn-logout-nav">Cerrar Sesión</button>`;
        sessionIndicator.style.display = 'block';

        if (currentUserRole === "admin") {
            sessionIndicator.textContent = "Sesión activa como Administrador";
            sessionIndicator.style.backgroundColor = "#dc3545"; 
        } else if (currentUserRole === "musico") {
            sessionIndicator.textContent = "Sesión activa como Músico (Carlos Delgado)";
            sessionIndicator.style.backgroundColor = "#1DB954"; 
        }
    }
}

// Captura de clics globales para autenticación
document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'btn-login') {
        if (loginModal) {
            loginModal.style.display = 'block';
            loginModal.classList.add('modal-login-backdrop-blur');
        }
    }
    
    if (event.target && event.target.id === 'btn-logout') {
        currentUserRole = "invitado";
        setupAuthUI();
        renderDirectory(); // Al volver a ser invitado, se ocultan los perfiles inactivos automáticamente
    }
});

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = loginUsernameInput.value.trim().toLowerCase();
        const password = loginPasswordInput.value;

        if (validUsers[username] && validUsers[username].password === password) {
            currentUserRole = validUsers[username].role;
            loginModal.style.display = 'none';
            loginForm.reset();
            setupAuthUI();
            renderDirectory(); // Renderiza de nuevo para aplicar reglas visuales del nuevo rol
        } else {
            alert("Usuario o contraseña incorrectos. Inténtalo de nuevo.");
        }
    });
}

if (closeLoginModalBtn) {
    closeLoginModalBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        loginForm.reset();
    });
}

/* ==========================================================================
   4. GESTIÓN OPERATIVA DE PERFILES (EDITAR, ELIMINAR, ESTADOS)
   ========================================================================== */
function openEditModal(id) {
    const musico = musiciansData.find(m => m.id === id);
    if (!musico) return;

    document.getElementById('form-card-id').value = musico.id;
    document.getElementById('form-name').value = musico.name;
    document.getElementById('form-role').value = musico.role;
    document.getElementById('form-genres').value = musico.genres;
    document.getElementById('form-bio').value = musico.bio;
    document.getElementById('form-photo-url').value = musico.photo;
    document.getElementById('form-instagram').value = musico.instagram;
    document.getElementById('form-spotify').value = musico.spotify;
    document.getElementById('form-youtube').value = musico.youtube;

    if (musico.photo) {
        photoPreview.style.backgroundImage = `url('${musico.photo}')`;
        photoPreview.style.display = 'block';
    } else {
        photoPreview.style.display = 'none';
    }

    modal.style.display = 'block';
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        musicianForm.reset();
    });
}

if (photoInput) {
    photoInput.addEventListener('input', () => {
        const url = photoInput.value.trim();
        if (url) {
            photoPreview.style.backgroundImage = `url('${url}')`;
            photoPreview.style.display = 'block';
        } else {
            photoPreview.style.display = 'none';
        }
    });
}

if (musicianForm) {
    musicianForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('form-card-id').value);
        const index = musiciansData.findIndex(m => m.id === id);

        if (index !== -1) {
            musiciansData[index].name = document.getElementById('form-name').value.trim();
            musiciansData[index].role = document.getElementById('form-role').value;
            musiciansData[index].genres = document.getElementById('form-genres').value.trim();
            musiciansData[index].bio = document.getElementById('form-bio').value.trim();
            musiciansData[index].photo = document.getElementById('form-photo-url').value.trim();
            musiciansData[index].instagram = document.getElementById('form-instagram').value.trim();
            musiciansData[index].spotify = document.getElementById('form-spotify').value.trim();
            musiciansData[index].youtube = document.getElementById('form-youtube').value.trim();

            modal.style.display = 'none';
            musicianForm.reset();
            renderDirectory();
        }
    });
}

function toggleProfileStatus(id, status) {
    const musico = musiciansData.find(m => m.id === id);
    if (musico) {
        musico.active = status;
        renderDirectory(); // Vuelve a dibujar el directorio aplicando los nuevos criterios de visibilidad
    }
}

function deleteMusician(id) {
    if (confirm('¿Estás completamente seguro de que deseas eliminar permanentemente este perfil del lineup oficial?')) {
        musiciansData = musiciansData.filter(m => m.id !== id);
        renderDirectory();
    }
}

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        musicianForm.reset();
    }
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
        loginForm.reset();
    }
});

// Inicialización de la App al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    setupAuthUI();
    renderDirectory();
});