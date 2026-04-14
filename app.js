const menuBurgers = [
    {
        id: "b1", nombre: "CHEESY", ingredientes: "Medallón, Cheddar, Cebolla, Aderezo 1/4, Pepinillo",
        imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
        variantes: [{ nombre: "Doble", precio: 15500 }, { nombre: "Triple", precio: 16500 }, { nombre: "X4", precio: 18000 }]
    },
    {
        id: "b2", nombre: "CHEESEBACON", ingredientes: "Medallón, Cheddar, Bacon, Aderezo Pepper's",
        imagen: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80",
        variantes: [{ nombre: "Doble", precio: 15500 }, { nombre: "Triple", precio: 16500 }, { nombre: "X4", precio: 18000 }]
    },
    {
        id: "b3", nombre: "BIG PEPPER", ingredientes: "Medallón, Cheddar, Cebolla, Lechuga, Pepinillo, Aderezo Pepper's",
        imagen: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80",
        variantes: [{ nombre: "Doble", precio: 15500 }, { nombre: "Triple", precio: 16500 }, { nombre: "X4", precio: 18000 }]
    },
    {
        id: "b4", nombre: "SMOKE AMERICAN", ingredientes: "Medallón, Cheddar, Lechuga, Tomate, Aderezo Pepper's",
        imagen: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&q=80",
        variantes: [{ nombre: "Doble", precio: 15500 }, { nombre: "Triple", precio: 16500 }, { nombre: "X4", precio: 18000 }]
    },
    {
        id: "b5", nombre: "OKLAHOMA", ingredientes: "Medallón, Cheddar, Cebolla, Aderezo Pepper's",
        imagen: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500&q=80",
        variantes: [{ nombre: "Doble", precio: 15500 }, { nombre: "Triple", precio: 16500 }, { nombre: "X4", precio: 18000 }]
    },
    {
        id: "b6", nombre: "CHEESEMIX", ingredientes: "Medallón, Cheddar, Provolone, Cebolla Crispy, Aderezo Pepper's",
        imagen: "https://images.unsplash.com/photo-1549611016-3a70d82b5040?w=500&q=80",
        variantes: [{ nombre: "Doble", precio: 15500 }, { nombre: "Triple", precio: 16500 }, { nombre: "X4", precio: 18000 }]
    }
];

const menuExtras = [
    { id: "e1", nombre: "Papas Fritas", precio: 6500, imagen: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&q=80" },
    { id: "e2", nombre: "Menú Veggie", precio: 14500, imagen: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&q=80" },
    { id: "e3", nombre: "Nuggets + Papas", precio: 12000, imagen: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&q=80" }
];

const menuBebidas = [
    { id: "beb1", nombre: "Gaseosa", precio: 3000, imagen: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80" },
    { id: "beb2", nombre: "Cerveza", precio: 4500, imagen: "https://cervesamontseny.cat/wp-content/uploads/Ampolla-Got-Lager.jpg" },
    { id: "beb3", nombre: "Gin o Fernet", precio: 6000, imagen: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&q=80" }
];

let carrito = [];
const NUMERO_WHATSAPP = "541122454518"; 

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

function renderizarMenu() {
    menuBurgers.forEach(burger => {
        let opcionesSelect = burger.variantes.map(v => `<option value="${v.nombre}|${v.precio}">${v.nombre} - $${v.precio}</option>`).join('');
        const div = document.createElement('div');
        div.classList.add('product-card');
        div.innerHTML = `
            <img src="${burger.imagen}" alt="${burger.nombre}" class="product-img">
            <div class="product-info">
                <h3 class="product-title">${burger.nombre}</h3>
                <p class="product-desc">${burger.ingredientes}</p>
                <div class="product-actions">
                    <select id="select-${burger.id}" class="size-selector">${opcionesSelect}</select>
                    <button class="btn-add" onclick="agregarBurger('${burger.id}', '${burger.nombre}', event)">Agregar al Pedido</button>
                </div>
            </div>`;
        contenedorBurgers.appendChild(div);
    });

    [...menuExtras, ...menuBebidas].forEach(item => {
        const div = document.createElement('div');
        div.classList.add('product-card');
        const cont = item.id.startsWith('e') ? contenedorExtras : contenedorBebidas;
        div.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" class="product-img">
            <div class="product-info">
                <h3 class="product-title">${item.nombre}</h3>
                <div class="product-actions" style="margin-top: auto;">
                    <button class="btn-add" onclick="agregarItem('${item.nombre}', ${item.precio}, event)">Agregar $${item.precio}</button>
                </div>
            </div>`;
        cont.appendChild(div);
    });
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
    t.innerText = mensaje; 
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function activarSacudidaCarrito() {
    const btn = document.getElementById('btn-abrir-carrito');
    btn.classList.add('cart-animate');
    setTimeout(() => btn.classList.remove('cart-animate'), 400);
}

function agregarBurger(id, nombre, event) {
    animarVuelo(event);
    const s = document.getElementById(`select-${id}`);
    const [v, p] = s.value.split('|');
    carrito.push({ nombre: `${nombre} (${v})`, precio: parseInt(p) });
    actualizarCarrito();
    mostrarNotificacion(`¡${nombre} agregada al pedido!`);
}

function agregarItem(n, p, event) {
    animarVuelo(event);
    carrito.push({ nombre: n, precio: p });
    actualizarCarrito();
    mostrarNotificacion(`¡${n} agregado al pedido!`);
}

function eliminarItem(i) { 
    carrito.splice(i, 1); 
    actualizarCarrito(); 
}

function actualizarCarrito() {
    listaCarrito.innerHTML = ''; let t = 0;
    cartCounter.innerText = carrito.length;
    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<p style="text-align:center; padding: 20px; color:#888;">No agregaste nada todavía.</p>';
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

function abrirCarrito() { 
    cartSidebar.classList.add('active'); 
    cartOverlay.classList.add('active'); 
    document.body.classList.add('no-scroll'); 
}

function cerrarCarrito() { 
    cartSidebar.classList.remove('active'); 
    cartOverlay.classList.remove('active'); 
    document.body.classList.remove('no-scroll'); 
}

function toggleDireccion() {
    const m = document.getElementById('metodo-entrega').value;
    document.getElementById('grupo-direccion').style.display = m === 'Delivery' ? 'block' : 'none';
}

document.getElementById('btn-abrir-carrito').addEventListener('click', abrirCarrito);
document.getElementById('btn-cerrar-carrito').addEventListener('click', cerrarCarrito);
cartOverlay.addEventListener('click', cerrarCarrito);

btnWhatsApp.addEventListener('click', () => {
    let m = "¡Hola Pepper's! 🍔 Mi pedido es:\n\n"; let t = 0;
    carrito.forEach(i => { m += `- ${i.nombre}: $${i.precio}\n`; t += i.precio; });
    m += `\n💰 *Total: $${t.toLocaleString('es-AR')}*\n💳 *Pago:* ${document.getElementById('metodo-pago').value}\n🛵 *Entrega:* ${document.getElementById('metodo-entrega').value}`;
    if (document.getElementById('metodo-entrega').value === "Delivery") m += `\n📍 *Dirección:* ${document.getElementById('direccion-envio').value}`;
    if (inputNotas.value.trim() !== "") m += `\n📝 *Aclaraciones:* ${inputNotas.value.trim()}`;
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(m)}`, '_blank');
});

renderizarMenu(); 
actualizarCarrito();