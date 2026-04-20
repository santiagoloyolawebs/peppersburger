// --- CONFIGURACIÓN REAL DE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyA8lOB2niy4NFETfZK6nXU2Ls82lo8hhVQ",
    authDomain: "peppersburgerandcompany.firebaseapp.com",
    projectId: "peppersburgerandcompany",
    storageBucket: "peppersburgerandcompany.firebasestorage.app",
    messagingSenderId: "692265593199",
    appId: "1:692265593199:web:64ea770615566834aaa09a",
    measurementId: "G-HSXZ5TNY17"
};

const IMGBB_API_KEY = "edcff8440811eab2aca7a73212a3dece";

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

let usuarioPendiente = null;
let productosEnMemoria = {};
let productosArray = []; 
let filtroCategoriaActual = 'todos';

// ================= NOTIFICACIONES TOAST =================
function mostrarNotificacion(mensaje, tipo = 'success') {
    const toast = document.getElementById('toast-admin');
    toast.innerText = mensaje;
    
    toast.className = 'toast-admin show'; 
    if (tipo === 'error') {
        toast.classList.add('toast-error');
    } else {
        toast.classList.add('toast-success');
    }

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ================= NAVEGACIÓN Y RESPONSIVE =================
function cambiarTab(tabId, elementoClicheado) {
    const itemsMenu = document.querySelectorAll('.sidebar-nav .nav-item');
    itemsMenu.forEach(item => item.classList.remove('active'));
    elementoClicheado.classList.add('active');

    const secciones = document.querySelectorAll('.content-section');
    secciones.forEach(sec => sec.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');

    const titulos = { 'productos': 'Menú y Productos', 'ajustes': 'Ajustes del Sistema' };
    document.getElementById('header-title').innerText = titulos[tabId];

    if(window.innerWidth <= 768) toggleMenu();
}

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('open');
}

function cambiarTipoPrecio() {
    const cat = document.getElementById('p-categoria').value;
    if(cat === 'burgers') {
        document.getElementById('grupo-precio-unico').style.display = 'none';
        document.getElementById('grupo-variantes').style.display = 'block';
    } else {
        document.getElementById('grupo-precio-unico').style.display = 'block';
        document.getElementById('grupo-variantes').style.display = 'none';
    }
}

document.addEventListener('click', e => {
    if(e.target.classList.contains('btn-dia')) {
        e.target.classList.toggle('active');
    }
});

function generarOpcionesHora() {
    let horas = '';
    for(let i=0; i<24; i++) {
        let h = i.toString().padStart(2, '0');
        horas += `<option value="${h}">${h}</option>`;
    }
    
    let minutos = '';
    let opcionesMin = ['00', '15', '30', '45'];
    opcionesMin.forEach(m => {
        minutos += `<option value="${m}">${m}</option>`;
    });

    document.getElementById('hora-inicio-h').innerHTML = horas;
    document.getElementById('hora-inicio-m').innerHTML = minutos;
    document.getElementById('hora-fin-h').innerHTML = horas;
    document.getElementById('hora-fin-m').innerHTML = minutos;

    document.getElementById('hora-inicio-h').value = '20';
    document.getElementById('hora-inicio-m').value = '00';
    document.getElementById('hora-fin-h').value = '23';
    document.getElementById('hora-fin-m').value = '00';
}

// ================= AUTENTICACIÓN =================
function loginGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(err => alert("Error: " + err.message));
}

auth.onAuthStateChanged(user => {
    const pantallaCarga = document.getElementById('pantalla-carga');
    if(pantallaCarga) pantallaCarga.style.display = 'none';

    if (user) {
        db.collection("usuarios").doc(user.email).get().then((doc) => {
            if (doc.exists) {
                const datosUsuario = doc.data();
                if (datosUsuario.rango === "Admin") {
                    mostrarPanel(user, datosUsuario.nombre);
                } else {
                    alert("Tu cuenta no tiene rango Admin.");
                    auth.signOut();
                }
            } else {
                usuarioPendiente = user;
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('registro-section').style.display = 'block';
                document.getElementById('auth-container').style.display = 'flex';
                
                if(user.displayName) document.getElementById('r-nombre').value = user.displayName;
            }
        }).catch(err => auth.signOut());
    } else {
        document.getElementById('dashboard-container').style.display = 'none';
        document.getElementById('auth-container').style.display = 'flex'; 
        document.getElementById('registro-section').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
        usuarioPendiente = null;
    }
});

function completarRegistro() {
    const nombreIngresado = document.getElementById('r-nombre').value.trim();
    if (!nombreIngresado) return alert("Ingresa tu Nombre.");
    if (!usuarioPendiente) return alert("Error de sesión.");

    const nuevoUsuario = { nombre: nombreIngresado, email: usuarioPendiente.email, rango: "Usuario", fechaRegistro: firebase.firestore.FieldValue.serverTimestamp() };

    db.collection("usuarios").doc(usuarioPendiente.email).set(nuevoUsuario).then(() => {
        alert("¡Registro exitoso! Pide rango Admin.");
        auth.signOut();
    });
}

function cancelarRegistro() { auth.signOut(); }

function mostrarPanel(user, nombreReal) {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'flex';
    document.getElementById('user-display').innerHTML = `<span>Hola, <strong>${nombreReal}</strong></span><img src="${user.photoURL}" style="width: 35px; height: 35px; border-radius: 50%;">`;
    
    cambiarTipoPrecio();
    generarOpcionesHora(); 
    cargarProductosAdmin();
    cargarAjustesAdmin(); 
}

function logout() { auth.signOut().then(() => location.reload()); }

// ================= CRUD AJUSTES =================
function cargarAjustesAdmin() {
    db.collection("configuracion").doc("general").get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('ajuste-whatsapp').value = data.whatsapp || '541122454518';
        }
    });
}

function guardarHorarios() {
    const diasActivosRaw = Array.from(document.querySelectorAll('.btn-dia.active')).map(b => b.dataset.dia);
    const inicioH = document.getElementById('hora-inicio-h').value;
    const inicioM = document.getElementById('hora-inicio-m').value;
    const finH = document.getElementById('hora-fin-h').value;
    const finM = document.getElementById('hora-fin-m').value;

    if(diasActivosRaw.length === 0) return mostrarNotificacion("Seleccioná al menos un día de atención.", "error");

    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const diasActivos = diasActivosRaw.sort((a, b) => diasSemana.indexOf(a) - diasSemana.indexOf(b));

    let rangos = [];
    let rangoActual = [];

    for (let i = 0; i < diasActivos.length; i++) {
        if (rangoActual.length === 0) {
            rangoActual.push(diasActivos[i]);
        } else {
            let diaAnterior = rangoActual[rangoActual.length - 1];
            if (diasSemana.indexOf(diasActivos[i]) === diasSemana.indexOf(diaAnterior) + 1) {
                rangoActual.push(diasActivos[i]);
            } else {
                rangos.push(rangoActual);
                rangoActual = [diasActivos[i]];
            }
        }
    }
    if (rangoActual.length > 0) rangos.push(rangoActual);

    let partesTexto = rangos.map(rango => {
        if (rango.length === 1) return rango[0];
        if (rango.length === 2) return `${rango[0]} y ${rango[1]}`;
        return `${rango[0]} a ${rango[rango.length - 1]}`;
    });

    let textoDias = "";
    if (partesTexto.length > 1) {
        textoDias = partesTexto.slice(0, -1).join(', ') + ' y ' + partesTexto.slice(-1);
    } else {
        textoDias = partesTexto[0] || "";
    }
    
    const horarioFinal = `${textoDias} ${inicioH}:${inicioM} - ${finH}:${finM}`;

    db.collection("configuracion").doc("general").set({
        horarios: horarioFinal
    }, { merge: true }).then(() => {
        mostrarNotificacion("¡Horarios guardados con éxito!", "success");
    }).catch(err => mostrarNotificacion("Error al guardar.", "error"));
}

function guardarWhatsapp() {
    const ws = document.getElementById('ajuste-whatsapp').value.trim();
    if(!ws) return mostrarNotificacion("Ingresá un número válido.", "error");

    db.collection("configuracion").doc("general").set({
        whatsapp: ws
    }, { merge: true }).then(() => {
        mostrarNotificacion("¡WhatsApp actualizado con éxito!", "success");
    }).catch(err => mostrarNotificacion("Error al guardar.", "error"));
}

// ================= GESTIÓN DE IMÁGENES CON IMGBB =================
function previsualizarImagen(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('img-preview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

async function subirAImgBB(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            return data.data.url;
        } else {
            console.error("Error devuelto por ImgBB:", data);
            return null;
        }
    } catch (error) {
        console.error("Fallo de red al subir a ImgBB:", error);
        return null;
    }
}

// ================= CRUD PRODUCTOS =================
async function guardarProducto() {
    const id = document.getElementById('edit-id').value;
    const nombre = document.getElementById('p-nombre').value.trim();
    const categoria = document.getElementById('p-categoria').value;
    const desc = document.getElementById('p-desc').value;
    
    const fileInput = document.getElementById('p-img-file');
    let imgUrl = document.getElementById('p-img-url').value; 

    if(!nombre) return mostrarNotificacion("El nombre es obligatorio.", "error");

    const btn = document.getElementById('btn-guardar');
    const textoOriginal = btn.innerText; 
    
    btn.innerText = "Procesando..."; 
    btn.disabled = true;

    if (fileInput.files.length > 0) {
        const urlSubida = await subirAImgBB(fileInput.files[0]);
        if (!urlSubida) {
            mostrarNotificacion("Error al procesar la imagen.", "error");
            btn.innerText = textoOriginal; 
            btn.disabled = false;
            return;
        }
        imgUrl = urlSubida; 
    }

    if (!imgUrl) {
        mostrarNotificacion("Falta subir una imagen.", "error");
        btn.innerText = textoOriginal; 
        btn.disabled = false;
        return;
    }

    let data = { 
        nombre: nombre, 
        categoria: categoria, 
        desc: desc, 
        imagen: imgUrl,
        fechaModificacion: Date.now() 
    };

    if (categoria === 'burgers') {
        let variantes = [];
        let pDoble = document.getElementById('p-precio-doble').value;
        let pTriple = document.getElementById('p-precio-triple').value;
        let pX4 = document.getElementById('p-precio-x4').value;

        if(pDoble) variantes.push({ nombre: "Doble", precio: parseInt(pDoble) });
        if(pTriple) variantes.push({ nombre: "Triple", precio: parseInt(pTriple) });
        if(pX4) variantes.push({ nombre: "X4", precio: parseInt(pX4) });

        if(variantes.length === 0) {
            mostrarNotificacion("Falta el tamaño y precio.", "error");
            btn.innerText = textoOriginal; 
            btn.disabled = false;
            return;
        }
        
        data.variantes = variantes;
        data.precio = variantes[0].precio;
    } else {
        let pUnico = document.getElementById('p-precio').value;
        if(!pUnico) {
            mostrarNotificacion("Ingresá el precio final.", "error");
            btn.innerText = textoOriginal; 
            btn.disabled = false;
            return;
        }
        data.precio = parseInt(pUnico);
        data.variantes = firebase.firestore.FieldValue.delete(); 
    }

    if (id) {
        db.collection("productos").doc(id).update(data).then(() => {
            cancelarEdicion(); 
            cargarProductosAdmin();
            mostrarNotificacion("¡Producto actualizado!", "success");
        }).finally(() => { 
            btn.innerText = "Guardar Producto"; 
            btn.disabled = false; 
        });
    } else {
        db.collection("productos").add(data).then(() => {
            limpiarForm(); 
            cargarProductosAdmin();
            mostrarNotificacion("¡Producto creado con éxito!", "success");
        }).finally(() => { 
            btn.innerText = "Guardar Producto"; 
            btn.disabled = false; 
        });
    }
}

function cargarProductosAdmin() {
    db.collection("productos").get().then((querySnapshot) => {
        productosArray = [];
        productosEnMemoria = {};
        
        querySnapshot.forEach((doc) => {
            const p = doc.data();
            p.id = doc.id;
            p.fechaModificacion = p.fechaModificacion || 0; 
            
            productosEnMemoria[doc.id] = p;
            productosArray.push(p);
        });

        renderizarListaProductos();
    });
}

function filtrarCategoria(cat, elemento) {
    filtroCategoriaActual = cat;
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active'));
    elemento.classList.add('active');
    renderizarListaProductos();
}

function renderizarListaProductos() {
    const lista = document.getElementById('lista-admin');
    const terminoBusqueda = document.getElementById('buscador-productos').value.toLowerCase();
    
    let filtrados = productosArray.filter(p => {
        const coincideCat = filtroCategoriaActual === 'todos' || p.categoria === filtroCategoriaActual;
        const coincideTexto = p.nombre.toLowerCase().includes(terminoBusqueda);
        return coincideCat && coincideTexto;
    });

    filtrados.sort((a, b) => b.fechaModificacion - a.fechaModificacion);

    lista.innerHTML = '';
    
    if(filtrados.length === 0) {
        lista.innerHTML = '<div class="loading-text" style="color: #666;">No se encontraron productos.</div>';
        return;
    }

    filtrados.forEach(p => {
        let precioMostrar = p.variantes && p.variantes.length > 0 ? `Desde $${p.variantes[0].precio.toLocaleString('es-AR')}` : `$${p.precio.toLocaleString('es-AR')}`;
        let catNombre = p.categoria === 'burgers' ? 'Hamburguesa' : (p.categoria === 'extras' ? 'Extra' : 'Bebida');

        lista.innerHTML += `
            <div class="product-item">
                <div class="product-details">
                    <strong>${p.nombre}</strong>
                    <div>
                        <span>${catNombre}</span>
                        <span class="product-price">${precioMostrar}</span>
                    </div>
                </div>
                <div class="actions">
                    <div class="btn-icon edit" onclick="prepararEdicion('${p.id}')"><i class="fa-solid fa-pen"></i></div>
                    <div class="btn-icon delete" onclick="eliminarProducto('${p.id}')"><i class="fa-solid fa-trash"></i></div>
                </div>
            </div>
        `;
    });
}

function prepararEdicion(id) {
    const p = productosEnMemoria[id];
    document.getElementById('edit-id').value = id;
    document.getElementById('p-nombre').value = p.nombre;
    document.getElementById('p-categoria').value = p.categoria;
    document.getElementById('p-desc').value = p.desc || '';
    
    document.getElementById('p-img-url').value = p.imagen; 
    document.getElementById('p-img-file').value = ""; 
    const preview = document.getElementById('img-preview');
    
    // ARREGLO PARA QUE LAS FOTOS VIEJAS CARGUEN BIEN EN LA RAÍZ
    preview.src = p.imagen;
    preview.style.display = 'block';
    
    cambiarTipoPrecio();

    if(p.categoria === 'burgers') {
        document.getElementById('p-precio-doble').value = '';
        document.getElementById('p-precio-triple').value = '';
        document.getElementById('p-precio-x4').value = '';
        
        if(p.variantes) {
            p.variantes.forEach(v => {
                if(v.nombre === 'Doble') document.getElementById('p-precio-doble').value = v.precio;
                if(v.nombre === 'Triple') document.getElementById('p-precio-triple').value = v.precio;
                if(v.nombre === 'X4') document.getElementById('p-precio-x4').value = v.precio;
            });
        }
    } else {
        document.getElementById('p-precio').value = p.precio;
    }

    document.getElementById('form-title').innerHTML = '<i class="fa-solid fa-pen icon-rojo"></i> Editando Producto';
    document.getElementById('btn-guardar').innerText = "Actualizar Cambios";
    document.getElementById('btn-cancelar').style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicion() {
    limpiarForm();
    document.getElementById('form-title').innerHTML = '<i class="fa-solid fa-plus icon-rojo"></i> Nuevo Producto';
    document.getElementById('btn-guardar').innerText = "Guardar Producto";
    document.getElementById('btn-cancelar').style.display = "none";
}

function limpiarForm() {
    document.getElementById('edit-id').value = "";
    document.getElementById('p-nombre').value = "";
    document.getElementById('p-desc').value = "";
    document.getElementById('p-precio').value = "";
    document.getElementById('p-precio-doble').value = "";
    document.getElementById('p-precio-triple').value = "";
    document.getElementById('p-precio-x4').value = "";
    
    document.getElementById('p-img-file').value = "";
    document.getElementById('p-img-url').value = "";
    document.getElementById('img-preview').style.display = "none";
    document.getElementById('img-preview').src = "";
}

function eliminarProducto(id) {
    if(confirm("¿Estás seguro que querés eliminar este producto?")) {
        db.collection("productos").doc(id).delete().then(() => {
            cargarProductosAdmin();
            mostrarNotificacion("Producto eliminado correctamente.", "error");
        });
    }
}