document.addEventListener('DOMContentLoaded', () => {
    const cardsGrid = document.getElementById('cards-grid');
    const modal = document.getElementById('modal-perfil');
    const modalLogin = document.getElementById('modal-login');
    const inputPhoto = document.getElementById('input-photo');
    const photoPreview = document.getElementById('photo-preview');
    const musicianForm = document.getElementById('musician-form');
    
    let fotoBase64 = "";

    // Estado global de la sesión simulada (Guarda el usuario activo en sessionStorage)
    let usuarioActivo = JSON.parse(sessionStorage.getItem('backstage_session')) || null;

    // --- PRE-CARGA DE DATOS DE PRUEBA (DATA POR DEFECTO) ---
    const inicializarDatosPorDefecto = () => {
        const datosExistentes = localStorage.getItem('backstage_pro_data');
        if (!datosExistentes) {
            const musicosSemilla = [
                {
                    nombre: "Carlos Santana",
                    rol: "Música en Vivo",
                    bio: "Guitarrista profesional con más de 15 años de trayectoria en escenarios internacionales, especializado en rock latino y fusión.",
                    ig: "https://instagram.com",
                    sp: "https://spotify.com",
                    yt: "https://youtube.com",
                    foto: "",
                    owner: "musico@backstage.com",
                    aprobado: true
                },
                {
                    nombre: "Ananías Martínez",
                    rol: "Músicos de Sesión",
                    bio: "Bajista y arreglista de estudio. Experiencia en grabaciones de jazz, folklore y música comercial pop.",
                    ig: "https://instagram.com",
                    sp: "",
                    yt: "https://youtube.com",
                    foto: "",
                    owner: "admin@backstage.com",
                    aprobado: true
                },
                {
                    nombre: "Diana Rossi",
                    rol: "Productores",
                    bio: "Productora musical e ingeniera de mezcla. Ganadora de menciones locales en desarrollo de proyectos independientes.",
                    ig: "https://instagram.com",
                    sp: "https://spotify.com",
                    yt: "",
                    foto: "",
                    owner: "admin@backstage.com",
                    aprobado: false
                }
            ];
            localStorage.setItem('backstage_pro_data', JSON.stringify(musicosSemilla));
        }
    };

    // --- GESTIÓN DE MODALES ---
    window.abrirModal = () => {
        if (musicianForm) musicianForm.reset();
        document.getElementById('edit-index').value = "-1"; 
        document.getElementById('modal-titulo').innerText = "Crear Perfil Profesional";
        fotoBase64 = "";
        if (photoPreview) {
            photoPreview.style.backgroundImage = "";
            photoPreview.style.display = 'none';
        }
        
        // Mostrar u ocultar el aviso de pago en el formulario según el rol
        const paymentNotice = document.getElementById('payment-notice-form');
        if (paymentNotice) {
            paymentNotice.style.display = (usuarioActivo && usuarioActivo.role === "admin") ? "none" : "block";
        }

        modal.style.display = "block";
    };

    window.cerrarModal = () => modal.style.display = "none";
    window.abrirModalLogin = () => {
        document.getElementById('login-form').reset();
        modalLogin.style.display = "block";
    };
    window.cerrarModalLogin = () => modalLogin.style.display = "none";

    // --- PROCESAR LOGIN SIMULADO ---
    window.procesarLogin = () => {
        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-password').value;

        if ((email === "admin@backstage.com" && pass === "123") || (email === "musico@backstage.com" && pass === "123")) {
            usuarioActivo = {
                email: email,
                role: email === "admin@backstage.com" ? "admin" : "musico"
            };
            sessionStorage.setItem('backstage_session', JSON.stringify(usuarioActivo));
            cerrarModalLogin();
            actualizarInterfazSegunRol();
        } else {
            alert("Credenciales incorrectas. Intenta con las cuentas de prueba.");
        }
    };

    // --- [CORREGIDO] CIERRE DE SESIÓN CON RESETEO ESTRICTO DE PERMISOS ---
    window.cerrarSesion = () => {
        // 1. Destruir variables de sesión
        sessionStorage.removeItem('backstage_session');
        usuarioActivo = null;
        
        // 2. Limpiar letrero indicador de forma inmediata
        const sessionIndicator = document.getElementById('session-indicator');
        if (sessionIndicator) {
            sessionIndicator.style.display = "none";
            sessionIndicator.innerText = "";
        }

        // 3. Forzar actualización estructural de la UI con el rol público
        actualizarInterfazSegunRol();
    };

    // --- ACTUALIZAR VISTA SEGÚN ROL ---
    window.actualizarInterfazSegunRol = () => {
        const authContainer = document.getElementById('auth-buttons-container');
        const navBtnRegister = document.getElementById('nav-btn-register');
        const heroBtnJoin = document.getElementById('hero-btn-join');
        const sessionIndicator = document.getElementById('session-indicator');

        if (usuarioActivo) {
            authContainer.innerHTML = `<button class="btn-logout-nav" onclick="cerrarSesion()">Cerrar Sesión</button>`;
            sessionIndicator.style.display = "block";
            sessionIndicator.innerText = `Sesión activa como: ${usuarioActivo.email} (${usuarioActivo.role.toUpperCase()})`;

            navBtnRegister.style.display = "block";
            if(heroBtnJoin) heroBtnJoin.style.display = "inline-block";
            
        } else {
            // Re-inyectar botones públicos y asegurar que se oculte el de registrarse en modo visita
            authContainer.innerHTML = `
                <button class="btn-login-nav" onclick="abrirModalLogin()">Iniciar Sesión</button>
                <button class="btn-nav-register" id="nav-btn-register" onclick="abrirModal()" style="display: none;">Registrarse</button>
            `;
            if (navBtnRegister) navBtnRegister.style.display = "none";
            if (heroBtnJoin) heroBtnJoin.style.display = "none";
            if (sessionIndicator) sessionIndicator.style.display = "none";
        }

        // Re-renderizar el directorio para remover botones de edición/borrado al instante
        renderDirectorio(); 
    };

    // --- PROCESAMIENTO DE FOTO ---
    if (inputPhoto) {
        inputPhoto.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    fotoBase64 = ev.target.result;
                    photoPreview.style.backgroundImage = `url('${fotoBase64}')`;
                    photoPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- RENDERIZADO DEL DIRECTORIO CON CONTROL MENSUAL ---
    window.renderDirectorio = (filtro = 'todos') => {
        const musicos = JSON.parse(localStorage.getItem('backstage_pro_data')) || [];
        cardsGrid.innerHTML = '';

        // 1. Filtrar primero por categoría (Rol musical)
        let listaFiltrada = filtro === 'todos' ? musicos : musicos.filter(m => m.rol === filtro);

        // 2. Aplicar filtro estricto de visibilidad pública
        listaFiltrada = listaFiltrada.filter(m => {
            if (m.aprobado === true) return true;
            
            if (usuarioActivo) {
                if (usuarioActivo.role === "admin") return true;
                if (usuarioActivo.role === "musico" && m.owner === usuarioActivo.email) return true;
            }
            return false;
        });

        if (listaFiltrada.length === 0) {
            cardsGrid.innerHTML = `<p style="grid-column: 1/-1; color: #888; text-align: center; margin-top: 20px;">No hay perfiles activos en esta categoría.</p>`;
            return;
        }

        listaFiltrada.forEach((m, index) => {
            const indexReal = musicos.findIndex(original => original.nombre === m.nombre && original.bio === m.bio);
            const idParaAccion = indexReal !== -1 ? indexReal : index;

            let puedeEditar = false;
            let puedeBorrar = false;
            let mostrarControlSuscripcion = false;

            if (usuarioActivo) {
                if (usuarioActivo.role === "admin") {
                    puedeEditar = true;
                    puedeBorrar = true;
                    mostrarControlSuscripcion = true;
                } else if (usuarioActivo.role === "musico" && m.owner === usuarioActivo.email) {
                    puedeEditar = true;  
                    puedeBorrar = false; 
                }
            }

            const card = document.createElement('div');
            card.className = 'musician-card';
            
            card.innerHTML = `
                ${m.aprobado === false ? `<div class="card-status-badge"><i class="fas fa-clock"></i> Perfil Inactivo / Revisión</div>` : ''}
                
                <div class="card-photo" style="background-image: url('${m.foto || ''}')"></div>
                <span class="card-role">${m.rol}</span>
                <h3>${m.nombre}</h3>
                <div class="card-bio-container"><p class="card-bio">${m.bio || ''}</p></div>
                <div class="card-social-links">
                    ${m.ig ? `<a href="${m.ig}" target="_blank"><i class="fab fa-instagram"></i></a>` : ''}
                    ${m.sp ? `<a href="${m.sp}" target="_blank"><i class="fab fa-spotify"></i></a>` : ''}
                    ${m.yt ? `<a href="${m.yt}" target="_blank"><i class="fab fa-youtube"></i></a>` : ''}
                </div>
                
                ${puedeEditar || puedeBorrar || mostrarControlSuscripcion ? `
                <div class="card-actions">
                    ${mostrarControlSuscripcion ? (
                        m.aprobado ? 
                        `<button class="btn-status-deactivate" onclick="alternarEstadoMusico(${idParaAccion})"><i class="fas fa-user-slash"></i> Deshabilitar</button>` :
                        `<button class="btn-status-activate" onclick="alternarEstadoMusico(${idParaAccion})"><i class="fas fa-user-check"></i> Habilitar</button>`
                    ) : ''}
                    
                    ${puedeEditar ? `<button class="btn-edit-card" onclick="prepararEdicion(${idParaAccion})">Editar</button>` : ''}
                    ${puedeBorrar ? `<button class="btn-delete-card" onclick="eliminarMusico(${idParaAccion})"><i class="fas fa-trash"></i></button>` : ''}
                </div>` : ''}
            `;
            cardsGrid.appendChild(card);
        });
    };

    // --- GUARDAR MÚSICO ---
    window.guardarMusico = () => {
        const nombreInput = document.getElementById('name').value.trim();
        if (!nombreInput) {
            alert("Por favor, ingresa al menos el nombre.");
            return;
        }

        const corregirUrl = (url) => {
            if (!url) return "";
            if (!url.startsWith("http://") && !url.startsWith("https://")) return "https://" + url;
            return url;
        };

        let data = JSON.parse(localStorage.getItem('backstage_pro_data')) || [];
        const idx = parseInt(document.getElementById('edit-index').value);

        let dueñoTarjeta = "admin@backstage.com"; 
        let estadoInicialAprobado = true; 

        if (usuarioActivo && usuarioActivo.role === "musico") {
            dueñoTarjeta = usuarioActivo.email;
            estadoInicialAprobado = false; 
        }

        const m = {
            nombre: nombreInput,
            rol: document.getElementById('role').value,
            bio: document.getElementById('experience').value.trim(),
            ig: corregirUrl(document.getElementById('link-instagram').value.trim()),
            sp: corregirUrl(document.getElementById('link-spotify').value.trim()),
            yt: corregirUrl(document.getElementById('link-youtube').value.trim()),
            foto: fotoBase64,
            owner: idx === -1 ? dueñoTarjeta : data[idx].owner,
            aprobado: idx === -1 ? estadoInicialAprobado : data[idx].aprobado
        };

        if (idx === -1) {
            data.push(m);
            if (usuarioActivo && usuarioActivo.role === "musico") {
                alert("¡Tu perfil profesional ha sido guardado exitosamente!\n\nRecuerda realizar tu pago y confirmar el comprobante a nuestro WhatsApp XXXXXX para que el administrador active tu tarjeta en el Lineup Oficial.");
            }
        } else {
            if (!fotoBase64) m.foto = data[idx].foto; 
            data[idx] = m;
        }
        
        try {
            localStorage.setItem('backstage_pro_data', JSON.stringify(data));
            cerrarModal();
            renderDirectorio();
        } catch (e) {
            alert("¡Error de almacenamiento! Limpia el espacio del navegador.");
        }
    };

    // --- INTERRUPTOR DE ESTADO MENSUAL (HABILITAR / DESHABILITAR) ---
    window.alternarEstadoMusico = (index) => {
        let data = JSON.parse(localStorage.getItem('backstage_pro_data')) || [];
        if (data[index]) {
            const nuevoEstado = !data[index].aprobado;
            data[index].aprobado = nuevoEstado;
            
            localStorage.setItem('backstage_pro_data', JSON.stringify(data));
            
            if (nuevoEstado) {
                alert(`¡Suscripción renovada! El perfil de "${data[index].nombre}" ha sido HABILITADO y ya es visible públicamente.`);
            } else {
                alert(`¡Suscripción pausada! El perfil de "${data[index].nombre}" ha sido DESHABILITADO y se ocultó del directorio público.`);
            }
            
            renderDirectorio();
        }
    };

    window.prepararEdicion = (i) => {
        const data = JSON.parse(localStorage.getItem('backstage_pro_data'));
        const m = data[i];
        
        abrirModal();
        
        document.getElementById('edit-index').value = i;
        document.getElementById('modal-titulo').innerText = "Editar Perfil Profesional";
        document.getElementById('name').value = m.nombre;
        document.getElementById('role').value = m.rol;
        document.getElementById('experience').value = m.bio || '';
        document.getElementById('link-instagram').value = m.ig || '';
        document.getElementById('link-spotify').value = m.sp || '';
        document.getElementById('link-youtube').value = m.yt || '';
        
        if (m.foto) {
            fotoBase64 = m.foto;
            photoPreview.style.backgroundImage = `url('${m.foto}')`;
            photoPreview.style.display = 'block';
        }
    };

    window.eliminarMusico = (i) => {
        if (confirm("¿Seguro que deseas eliminar este perfil profesional?")) {
            let data = JSON.parse(localStorage.getItem('backstage_pro_data'));
            data.splice(i, 1);
            localStorage.setItem('backstage_pro_data', JSON.stringify(data));
            renderDirectorio();
        }
    };

    window.filtrarLineup = (f) => {
        renderDirectorio(f);
        const seccionObjetivo = document.getElementById('explorar-seccion');
        if (seccionObjetivo) seccionObjetivo.scrollIntoView({ behavior: 'smooth' });
    };

    // Ejecuciones de inicialización obligatorias al cargar el documento
    inicializarDatosPorDefecto();
    actualizarInterfazSegunRol();
});