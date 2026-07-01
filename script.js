/* ==========================================================================
   BACKSTAGE.DG - LOGICA DE FUNCIONALIDAD COMPLETA (VERSIÓN 1.8)
   ========================================================================== */

// Base de datos simulada de músicos - Actualizada para presentación profesional
let musiciansData = [
    {
        id: 1,
        name: "Carlos Delgado",
        phone: "+57 300 555 1234",
        role: "Música en Vivo",
        bio: "Guitarrista y vocalista con más de 10 años de trayectoria en circuitos de rock y pop nacional. Especialista en shows en vivo de alta energía y ensambles acústicos corporativos.",
        photo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80",
        instagram: "https://instagram.com",
        spotify: "https://spotify.com",
        youtube: "https://youtube.com",
        active: true
    },
    {
        id: 2,
        name: "Elena Rossi",
        phone: "+57 315 444 5678",
        role: "Compositores",
        bio: "Compositora, arreglista y pianista enfocada en la creación de bandas sonoras para cortometrajes, piezas teatrales y diseño sonoro para marcas comerciales de alto impacto.",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
        instagram: "https://instagram.com",
        spotify: "https://spotify.com",
        youtube: "",
        active: true
    },
    {
        id: 3,
        name: "David Funk",
        phone: "+57 321 777 9012",
        role: "Productores",
        bio: "Productor musical e ingeniero de mezcla independiente. Especializado en géneros urbanos, funk y ritmos latinos modernos. Fundador y director técnico en Groove Studio.",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
        instagram: "https://instagram.com",
        spotify: "https://spotify.com",
        youtube: "https://youtube.com",
        active: true // Lo dejamos activo para que se vea completo en la presentación inicial
    },
    {
        id: 4,
        name: "Sofía Martínez",
        phone: "+57 311 888 3456",
        role: "Músicos de Sesión",
        bio: "Bajista profesional egresada de conservatorio. Amplia experiencia en grabaciones de estudio tanto remotas como presenciales, y acompañamiento en giras de artistas internacionales.",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
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
let currentPhotoBase64 = ""; 

// Nodos principales del DOM
const cardsGrid = document.getElementById('cards-grid');
const dynamicTitle = document.getElementById('dynamic-section-title');
const lineupDropdownLinks = document.querySelectorAll('.dropdown-content a');
const authContainer = document.getElementById('auth-buttons-container');
const sessionIndicator = document.getElementById('session-indicator');
const adminActionsBar = document.getElementById('admin-actions-bar');
const btnCreateProfile = document.getElementById('btn-create-profile');

// Nodos del Formulario y Modal de Perfiles
const modal = document.getElementById('musician-modal');
const modalTitle = document.getElementById('modal-title');
const btnSubmitForm = document.getElementById('btn-submit-form');
const closeModalBtn = document.getElementById('close-modal');
const musicianForm = document.getElementById('musician-form');
const photoFileInput = document.getElementById('form-photo-file');
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

    const filteredData = musiciansData.filter(musico => {
        if (currentUserRole !== "admin" && !musico.active) {
            return false;
        }
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

        let phoneHtml = musico.phone ? `<p class="card-phone" style="font-size: 0.85rem; color: #b3b3b3; margin-bottom: 12px;"><i class="fas fa-phone-alt" style="color: #1DB954; margin-right: 5px;"></i> ${musico.phone}</p>` : '';

        card.innerHTML = `
            ${statusBadgeHtml}
            <div class="card-photo" style="background-image: url('${musico.photo || 'https://via.placeholder.com/150'}')"></div>
            <span class="card-role">${musico.role}</span>
            <h3 class="card-name" style="margin-bottom: 4px;">${musico.name}</h3>
            ${phoneHtml}
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
   3. GESTIÓN DE AUTENTICACIÓN
   ========================================================================== */
function setupAuthUI() {
    if (!authContainer || !sessionIndicator || !adminActionsBar) return;

    if (currentUserRole === "invitado") {
        authContainer.innerHTML = `<button id="btn-login" class="btn-login-nav">Iniciar Sesión</button>`;
        sessionIndicator.style.display = 'none';
        adminActionsBar.style.display = 'none';
    } else {
        authContainer.innerHTML = `<button id="btn-logout" class="btn-logout-nav">Cerrar Sesión</button>`;
        sessionIndicator.style.display = 'block';
        adminActionsBar.style.display = 'block';

        if (currentUserRole === "admin") {
            sessionIndicator.textContent = "Sesión activa como Administrador";
            sessionIndicator.style.backgroundColor = "#dc3545"; 
        } else if (currentUserRole === "musico") {
            sessionIndicator.textContent = "Sesión activa como Músico (Carlos Delgado)";
            sessionIndicator.style.backgroundColor = "#1DB954"; 
        }
    }
}

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
        renderDirectory(); 
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
            renderDirectory(); 
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
   4. GESTIÓN OPERATIVA DE PERFILES (CON CARGA DE ARCHIVO LOCAL)
   ========================================================================== */
if (photoFileInput) {
    photoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                currentPhotoBase64 = event.target.result; 
                photoPreview.style.backgroundImage = `url('${currentPhotoBase64}')`;
            };
            reader.readAsDataURL(file);
        }
    });
}

if (btnCreateProfile) {
    btnCreateProfile.addEventListener('click', () => {
        musicianForm.reset();
        document.getElementById('form-card-id').value = ''; 
        currentPhotoBase64 = ""; 
        modalTitle.textContent = "Crear Nuevo Perfil Profesional";
        btnSubmitForm.textContent = "Publicar Perfil";
        photoPreview.style.backgroundImage = "url('https://via.placeholder.com/150')";
        modal.style.display = 'block';
    });
}

function openEditModal(id) {
    const musico = musiciansData.find(m => m.id === id);
    if (!musico) return;

    modalTitle.textContent = "Editar Perfil Profesional";
    btnSubmitForm.textContent = "Guardar Cambios";

    document.getElementById('form-card-id').value = musico.id;
    document.getElementById('form-name').value = musico.name;
    document.getElementById('form-phone').value = musico.phone || '';
    document.getElementById('form-role').value = musico.role;
    document.getElementById('form-bio').value = musico.bio;
    document.getElementById('form-instagram').value = musico.instagram;
    document.getElementById('form-spotify').value = musico.spotify;
    document.getElementById('form-youtube').value = musico.youtube;

    currentPhotoBase64 = musico.photo || "https://via.placeholder.com/150";
    photoPreview.style.backgroundImage = `url('${currentPhotoBase64}')`;

    modal.style.display = 'block';
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        musicianForm.reset();
    });
}

if (musicianForm) {
    musicianForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idField = document.getElementById('form-card-id').value;

        const name = document.getElementById('form-name').value.trim();
        const phone = document.getElementById('form-phone').value.trim();
        const role = document.getElementById('form-role').value;
        const bio = document.getElementById('form-bio').value.trim();
        const instagram = document.getElementById('form-instagram').value.trim();
        const spotify = document.getElementById('form-spotify').value.trim();
        const youtube = document.getElementById('form-youtube').value.trim();
        
        const photoToSave = currentPhotoBase64 || "https://via.placeholder.com/150";

        if (idField === '') {
            const newId = musiciansData.length > 0 ? Math.max(...musiciansData.map(m => m.id)) + 1 : 1;
            const newMusician = {
                id: newId,
                name,
                phone,
                role,
                bio,
                photo: photoToSave,
                instagram,
                spotify,
                youtube,
                active: true
            };
            musiciansData.push(newMusician);
        } else {
            const id = parseInt(idField);
            const index = musiciansData.findIndex(m => m.id === id);

            if (index !== -1) {
                musiciansData[index].name = name;
                musiciansData[index].phone = phone;
                musiciansData[index].role = role;
                musiciansData[index].bio = bio;
                musiciansData[index].photo = photoToSave;
                musiciansData[index].instagram = instagram;
                musiciansData[index].spotify = spotify;
                musiciansData[index].youtube = youtube;
            }
        }

        modal.style.display = 'none';
        musicianForm.reset();
        currentPhotoBase64 = ""; 
        renderDirectory();
    });
}

function toggleProfileStatus(id, status) {
    const musico = musiciansData.find(m => m.id === id);
    if (musico) {
        musico.active = status;
        renderDirectory();
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

document.addEventListener('DOMContentLoaded', () => {
    setupAuthUI();
    renderDirectory();
});