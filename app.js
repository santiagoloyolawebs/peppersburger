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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let carrito = [];
let numeroWhatsappGlobal = "541122454518"; 

const contenedorBurgers = document.getElementById('productos-contenedor');
const contenedorExtras = document.getElementById('extras-contenedor');
const contenedorBebidas = document.getElementById('bebidas-contenedor');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const listaCarrito = document.getElementById('lista-carrito');
const precioTotalDOM = document.getElementById('precio-total');
const cartCounter = document.getElementById('cart-counter');
const btnWhatsApp = document.getElementById('btn-whatsapp');
const inputNotas = document.getElementById('pedido-notas');

// ================= ESCUCHAR AJUSTES EN TIEMPO REAL =================
function escucharAjustes() {
    db.collection("configuracion").doc("general").onSnapshot((doc) => {
        const footerHorarios = document.getElementById('footer-horarios');

        if (doc.exists) {
            const data = doc.data();
            
            // Actualizamos el WhatsApp global
            numeroWhatsappGlobal = data.whatsapp || "541122454518";

            // Actualizamos el texto del pie de página si hay horarios
            if (footerHorarios && data.horarios) {
                footerHorarios.innerHTML = `<i class="fa-regular fa-clock"></i> ${data.horarios}`;
            }
        }
    });
}

// ================= CARGAR MENÚ =================
function cargarMenuDesdeDB() {
    db.collection("productos").orderBy("categoria").get().then((querySnapshot) => {
        contenedorBurgers.innerHTML = ''; contenedorExtras.innerHTML = ''; contenedorBebidas.innerHTML = '';
        if (querySnapshot.empty) return;

        querySnapshot.forEach((doc) => {
            const p = doc.data();
            const div = document.createElement('div');
            div.classList.add('product-card');
            
            let imagenUrl = p.imagen ? p.imagen : 'assets/logo.png';
            let claseImg = imagenUrl.includes('logo.png') ? 'product-img img-contain' : 'product-img';
            let nombre = p.nombre ? p.nombre : 'Producto';
            let desc = p.desc ? p.desc : '';

            let productActions = '';

            if (p.categoria === 'burgers' && p.variantes && p.variantes.length > 0) {
                let opcionesHTML = p.variantes.map(v => `<option value="${v.nombre}|${v.precio}">${v.nombre} - $${v.precio.toLocaleString('es-AR')}</option>`).join('');
                productActions = `
                    <select id="select-${doc.id}" class="size-selector">
                        ${opcionesHTML}
                    </select>
                    <button class="btn-add" onclick="agregarBurger('${doc.id}', '${nombre}', event)">Agregar al Pedido</button>
                `;
            } else {
                let precioNum = p.precio ? parseInt(p.precio) : 0;
                productActions = `
                    <button class="btn-add" onclick="agregarItem('${nombre}', ${precioNum}, event)">Agregar $${precioNum.toLocaleString('es-AR')}</button>
                `;
            }

            div.innerHTML = `
                <img src="${imagenUrl}" alt="${nombre}" class="${claseImg}">
                <div class="product-info">
                    <h3 class="product-title">${nombre}</h3>
                    <p class="product-desc">${desc}</p>
                    <div class="product-actions">
                        ${productActions}
                    </div>
                </div>`;

            if(p.categoria === 'burgers') contenedorBurgers.appendChild(div);
            else if(p.categoria === 'extras') contenedorExtras.appendChild(div);
            else if(p.categoria === 'bebidas') contenedorBebidas.appendChild(div);
        });
    });
}

function agregarBurger(idDoc, nombreBase, event) {
    animarVuelo(event);
    const selector = document.getElementById(`select-${idDoc}`);
    const valores = selector.value.split('|');
    const varianteNombre = valores[0];
    const precio = parseInt(valores[1]);
    
    carrito.push({ nombre: `${nombreBase} (${varianteNombre})`, precio: precio });
    actualizarCarrito();
    mostrarNotificacion(`¡${nombreBase} agregada!`);
}

function animarVuelo(event) {
    const btnCarrito = document.getElementById('btn-abrir-carrito');
    const coordsCarrito = btnCarrito.getBoundingClientRect();
    const particle = document.createElement('div');
    particle.className = 'flying-item';
    particle.innerHTML = '<i class="fa-solid fa-burger"></i>';
    particle.style.left = `${event.clientX - 20}px`;
    particle.style.top = `${event.clientY - 20}px`;
    document.body.appendChild(particle);
    setTimeout(() => {
        particle.style.left = `${coordsCarrito.left + (coordsCarrito.width / 2) - 20}px`;
        particle.style.top = `${coordsCarrito.top + (coordsCarrito.height / 2) - 20}px`;
        particle.style.transform = 'scale(0.3) rotate(360deg)';
        particle.style.opacity = '0.7';
    }, 50);
    setTimeout(() => {
        particle.remove();
        activarSacudidaCarrito();
    }, 1200);
}

function mostrarNotificacion(mensaje) {
    const t = document.getElementById('notificacion');
    t.innerText = mensaje; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function activarSacudidaCarrito() {
    const btn = document.getElementById('btn-abrir-carrito');
    btn.classList.add('cart-animate');
    setTimeout(() => btn.classList.remove('cart-animate'), 400);
}

function agregarItem(n, p, event) {
    animarVuelo(event);
    carrito.push({ nombre: n, precio: p });
    actualizarCarrito();
    mostrarNotificacion(`¡${n} agregado!`);
}

function eliminarItem(i) { 
    carrito.splice(i, 1); actualizarCarrito(); 
}

function actualizarCarrito() {
    listaCarrito.innerHTML = ''; let t = 0;
    cartCounter.innerText = carrito.length;
    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<p style="text-align:center; padding: 20px; color:#888;">Vacío.</p>';
        btnWhatsApp.disabled = true;
    } else {
        btnWhatsApp.disabled = false;
        carrito.forEach((item, i) => {
            t += item.precio;
            const li = document.createElement('li');
            li.classList.add('cart-item');
            li.innerHTML = `<div class="item-details"><h4>${item.nombre}</h4><p>$${item.precio.toLocaleString('es-AR')}</p></div>
                <button class="btn-remove" onclick="eliminarItem(${i})"><i class="fa-solid fa-trash"></i></button>`;
            listaCarrito.appendChild(li);
        });
    }
    precioTotalDOM.innerText = "$" + t.toLocaleString('es-AR');
}

function abrirCarrito() { cartSidebar.classList.add('active'); cartOverlay.classList.add('active'); document.body.classList.add('no-scroll'); }
function cerrarCarrito() { cartSidebar.classList.remove('active'); cartOverlay.classList.remove('active'); document.body.classList.remove('no-scroll'); }

function toggleDireccion() {
    const m = document.getElementById('metodo-entrega').value;
    document.getElementById('grupo-direccion').style.display = m === 'Delivery' ? 'block' : 'none';
}

document.getElementById('btn-abrir-carrito').addEventListener('click', abrirCarrito);
document.getElementById('btn-cerrar-carrito').addEventListener('click', cerrarCarrito);
cartOverlay.addEventListener('click', cerrarCarrito);

btnWhatsApp.addEventListener('click', () => {
    let m = "*NUEVO PEDIDO - PEPPER'S*\n\n"; let t = 0;
    carrito.forEach(i => { m += `- ${i.nombre}: $${i.precio}\n`; t += i.precio; });
    m += `\n*Total:* $${t.toLocaleString('es-AR')}\n`;
    m += `*Pago:* ${document.getElementById('metodo-pago').value}\n`;
    m += `*Entrega:* ${document.getElementById('metodo-entrega').value}\n`;
    if (document.getElementById('metodo-entrega').value === "Delivery") {
        m += `*Dirección:* ${document.getElementById('direccion-envio').value}\n`;
    }
    if (inputNotas.value.trim() !== "") m += `*Aclaraciones:* ${inputNotas.value.trim()}`;
    
    // Usamos el WhatsApp guardado en la base de datos
    window.open(`https://wa.me/${numeroWhatsappGlobal}?text=${encodeURIComponent(m)}`, '_blank');
});

// Inicialización
escucharAjustes();
cargarMenuDesdeDB();