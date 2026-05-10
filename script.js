let modoBusqueda = false;
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
let productos = [];
let cantidad = 1;

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

let stockData = JSON.parse(localStorage.getItem("stock")) || {};
if (!stockData) {
  stockData = {};
}

fetch("productos.json")
  .then(res => res.json())
  .then(data => {
    let cambios = JSON.parse(localStorage.getItem("adminProductos")) || [];
let extras = JSON.parse(localStorage.getItem("productosExtra")) || [];
let eliminados = JSON.parse(localStorage.getItem("productosEliminados")) || [];

productos = [...data, ...extras]
  .filter(p => !eliminados.includes(p.id))
  .map(p => {
    let mod = cambios.find(c => c.id === p.id);
    return mod ? { ...p, ...mod } : p;
  });
    renderProductos();
    actualizarCarrito();
  })
  .catch(error => {
    console.error("Error cargando productos:", error);
  });

function toggleFavorito(id, btn) {
  const index = favoritos.indexOf(id);

  if (index > -1) {
    favoritos.splice(index, 1);
    btn.classList.remove("activo");
  } else {
    favoritos.push(id);
    btn.classList.add("activo");
  }

  // 🔥 actualizar contador
  document.getElementById("contador-fav").innerText = favoritos.length;

  // 💾 guardar
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

function renderProductos() {
  const contenedor = document.getElementById("contenedor-productos");

  contenedor.innerHTML = "";

  productos.forEach(p => {

  let precioHTML = "";

  if (p.oferta) {
    precioHTML = `
      <p style="color:red; font-weight:bold;">
        $${p.precio.toLocaleString("es-CL")}
      </p>
      <p style="text-decoration: line-through; color:gray; font-size:13px;">
        $${p.precioAnterior.toLocaleString("es-CL")}
      </p>
    `;
  } else {
    precioHTML = `
      <p>$${p.precio.toLocaleString("es-CL")}</p>
    `;
  }

  contenedor.innerHTML += `
  <div class="producto">

    <div class="fav-btn ${favoritos.includes(p.id) ? 'activo' : ''}" 
     onclick="toggleFavorito(${p.id}, this)">
  ❤️
</div>

    <img src="${(p.imagenes || [p.imagen])[0] || 'imagenes/no-image.png'}" class="img-producto">
    <h3>${p.nombre}</h3>
    <p>$${p.precio.toLocaleString("es-CL")}</p>

    <button onclick="verProducto(${p.id})">
      Ver producto
    </button>

    <button onclick="agregarCarrito(${p.id},'${p.nombre}',${p.precio},'${(p.imagenes || [p.imagen])[0]}')">
      Agregar al Carrito
    </button>
  </div>
`;
});
}
function mostrarInicio(btn) {
  document.getElementById("inicio").style.display = "block";
  document.getElementById("contenedor-productos").style.display = "none";

  document.querySelectorAll(".categorias button").forEach(b => {
    b.classList.remove("activo");
  });

  btn.classList.add("activo");
}

function filtrarCategoria(categoria, btn) {
  const inicio = document.getElementById("inicio");
  const contenedor = document.getElementById("contenedor-productos");

  inicio.style.display = "none";
  contenedor.style.display = "grid";

  document.querySelectorAll(".categorias button").forEach(b => {
    b.classList.remove("activo");
  });

  btn.classList.add("activo");

  const filtrados = productos.filter(p => p.categoria === categoria);

  contenedor.innerHTML = "";

  filtrados.forEach(p => {

  let precioHTML = "";

  if (p.oferta) {
    precioHTML = `
      <p style="color:red; font-weight:bold;">
        $${p.precio.toLocaleString("es-CL")}
      </p>
      <p style="text-decoration: line-through; color:gray; font-size:13px;">
        $${p.precioAnterior.toLocaleString("es-CL")}
      </p>
    `;
  } else {
    precioHTML = `
      <p>$${p.precio.toLocaleString("es-CL")}</p>
    `;
  }

  contenedor.innerHTML += `
  <div class="producto">

    <div class="fav-btn ${favoritos.includes(p.id) ? 'activo' : ''}" 
         onclick="toggleFavorito(${p.id}, this)">
      ❤️
    </div>

    ${p.oferta ? '<span class="badge-oferta">🔥 OFERTA</span>' : ''}

    <img src="${(p.imagenes || [p.imagen])[0] || 'imagenes/no-image.png'}" class="img-producto">
    <h3>${p.nombre}</h3>

    ${precioHTML}

    <button onclick="verProducto(${p.id})">
      Ver producto
    </button>

    <button onclick="agregarCarrito(${p.id},'${p.nombre}',${p.precio},'${(p.imagenes || [p.imagen])[0]}')">
      Agregar al Carrito
    </button>

  </div>
`;
});
}

function mostrarFavoritos() {
  const contenedor = document.getElementById("contenedor-productos");
  const inicio = document.getElementById("inicio");

  inicio.style.display = "none";
  contenedor.style.display = "grid";

  const filtrados = productos.filter(p => favoritos.includes(p.id));

  contenedor.innerHTML = "";

if (filtrados.length === 0) {
  contenedor.innerHTML = `
    <div style="
      text-align:center;
      padding:60px 20px;
      color:#aaa;
    ">
      <h2>💔 No tienes favoritos aún</h2>
      <p>Agrega productos tocando el corazón ❤️</p>
      <button onclick="mostrarInicio()" style="
        margin-top:15px;
        padding:10px 20px;
        border:none;
        border-radius:8px;
        background:#00a650;
        color:white;
        cursor:pointer;
      ">
        Volver al inicio
      </button>
    </div>
  `;
  return;
}

  filtrados.forEach(p => {

    let precioHTML = p.oferta ? `
      <p style="color:red; font-weight:bold;">
        $${p.precio.toLocaleString("es-CL")}
      </p>
      <p style="text-decoration: line-through; color:gray; font-size:13px;">
        $${p.precioAnterior.toLocaleString("es-CL")}
      </p>
    ` : `
      <p>$${p.precio.toLocaleString("es-CL")}</p>
    `;

    contenedor.innerHTML += `
      <div class="producto">

        <div class="fav-btn activo"
             onclick="toggleFavorito(${p.id}, this)">
          ❤️
        </div>

        ${p.oferta ? '<span class="badge-oferta">🔥 OFERTA</span>' : ''}

        <img src="${(p.imagenes || [p.imagen])[0] || 'imagenes/no-image.png'}" class="img-producto">
        <h3>${p.nombre}</h3>

        ${precioHTML}

        <button onclick="verProducto(${p.id})">
          Ver producto
        </button>

        <button onclick="agregarCarrito(${p.id},'${p.nombre}',${p.precio},'${(p.imagenes || [p.imagen])[0]}')">
          Agregar al Carrito
        </button>

      </div>
    `;
  });
}

function verProducto(id) {
  window.location.href = "producto.html?id=" + id;
}

function generarEstrellas(rating) {
  let estrellas = "";

  for (let i = 1; i <= 5; i++) {
    estrellas += i <= rating ? "⭐" : "☆";
  }

  return estrellas;
}
function agregarCarrito(id, nombre, precio, imagen) {

  // 🔄 SIEMPRE sincronizar carrito
  carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  let producto = productos.find(p => p.id === id);

  // 🔥 stock real
  let stockActual = stockData[id] ?? producto?.stock ?? 0;

  if (stockActual <= 0) {
    alert("❌ Sin stock disponible");
    return;
  }

  // 🔥 restar stock
  stockData[id] = stockActual - 1;
  localStorage.setItem("stock", JSON.stringify(stockData));

  let existente = carrito.find(p => p.id === id);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ id, nombre, precio, imagen, cantidad: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));

  actualizarCarrito();

  // 💥 feedback visual (pro)
  console.log("✔ Producto agregado:", nombre);
}

function actualizarCarrito() {
  let lista = document.getElementById("lista");
  let total = 0;

  lista.innerHTML = "";

  carrito.forEach((p, index) => {
    let subtotal = p.precio * p.cantidad;

    lista.innerHTML += `
      <li>
        <img src="${(p.imagenes || [p.imagen])[0]}" class="mini-img">
        <div>
          <p>${p.nombre}</p>

          <strong>$${p.precio} x ${p.cantidad}</strong>
          <p>Subtotal: $${subtotal.toLocaleString("es-CL")}</p>

          <button onclick="eliminarProducto(${index})" class="btn-eliminar">
            Eliminar
          </button>
        </div>
      </li>
    `;

    total += subtotal; // ✅ AHORA SÍ SUMA
  });

  document.getElementById("total").innerText =
  "Total: $" + total.toLocaleString("es-CL");

  document.getElementById("total-header").innerText =
  "$" + total.toLocaleString("es-CL");

// 🔥 CONTADOR CORRECTO
let totalItems = carrito.reduce((sum, p) => sum + p.cantidad, 0);
document.getElementById("contador").innerText = totalItems > 0 ? totalItems : "";

  let resumen = document.getElementById("resumen");

  resumen.innerHTML = `
    <p>🛒 Productos: ${totalItems}</p>
    <p>💵 Total: $${total.toLocaleString("es-CL")}</p>
  `;

  // 💾 GUARDAR
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function eliminarProducto(index) {

  let producto = carrito[index];

  // 🔥 devolver stock
  let stockActual = stockData[producto.id] ?? 0;

  stockData[producto.id] = stockActual + producto.cantidad;

  localStorage.setItem("stock", JSON.stringify(stockData));

  // 🗑 eliminar del carrito
  carrito.splice(index, 1);

  actualizarCarrito();
}

function mostrarCarrito() {
  let lista = document.getElementById("lista");
  let total = 0;
  lista.innerHTML = "";

  carrito.forEach(p => {
    lista.innerHTML += `<li>${p.nombre} - $${p.precio}</li>`;
    total += p.precio;
  });

  document.getElementById("total").innerText = "Total: $" + total;
}

function toggleCarrito() {
  const carrito = document.getElementById("carrito-panel");
  const overlay = document.getElementById("overlay");
  document.body.classList.toggle("no-scroll");

  carrito.classList.toggle("active");
  overlay.classList.toggle("active");
}

function buscarProducto() {
  let input = document.querySelector(".buscador").value.toLowerCase();
  let box = document.getElementById("resultados-busqueda");

  if (input === "") {
    modoBusqueda = false;
    box.style.display = "none";
    mostrarInicio(document.querySelector(".categorias button"));
    return;
  }

  // 🔥 SI ESTAMOS EN MODO BUSQUEDA FINAL → NO MOSTRAR DROPDOWN
  if (!modoBusqueda) {
  box.style.display = "block";
} else {
  box.style.display = "none";
}

  const inicio = document.getElementById("inicio");
  const contenedor = document.getElementById("contenedor-productos");

  inicio.style.display = "none";
  contenedor.style.display = "grid";

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(input)
  );

  // =========================
  // 🔥 DROPDOWN (TOP 5)
  // =========================
  box.innerHTML = "";

  filtrados.slice(0, 5).forEach(p => {
    box.innerHTML += `
      <div class="item-busqueda" onclick="verProducto(${p.id})">
        <img src="${(p.imagenes || [p.imagen])[0] || 'imagenes/no-image.png'}">
        <div>
          <p>${p.nombre}</p>
          <strong>$${p.precio.toLocaleString("es-CL")}</strong>
        </div>
      </div>
    `;
  });

  // =========================
  // 🔥 RESULTADOS GRANDES
  // =========================
  contenedor.innerHTML = "";

  filtrados.forEach(p => {

    let precioHTML = "";

    if (p.oferta) {
      precioHTML = `
        <p style="color:red; font-weight:bold;">
          $${p.precio.toLocaleString("es-CL")}
        </p>
        <p style="text-decoration: line-through; color:gray; font-size:13px;">
          $${p.precioAnterior.toLocaleString("es-CL")}
        </p>
      `;
    } else {
      precioHTML = `
        <p>$${p.precio.toLocaleString("es-CL")}</p>
      `;
    }

    contenedor.innerHTML += `
      <div class="producto">

        <div class="fav-btn ${favoritos.includes(p.id) ? 'activo' : ''}" 
             onclick="toggleFavorito(${p.id}, this)">
          ❤️
        </div>

        ${p.oferta ? '<span class="badge-oferta">🔥 OFERTA</span>' : ''}

        <img src="${(p.imagenes || [p.imagen])[0] || 'imagenes/no-image.png'}" class="img-producto">
        <h3>${p.nombre}</h3>

        ${precioHTML}

        <button onclick="verProducto(${p.id})">
          Ver producto
        </button>

        <button onclick="agregarCarrito(${p.id},'${p.nombre}',${p.precio},'${(p.imagenes || [p.imagen])[0]}')">
          Agregar al Carrito
        </button>

      </div>
    `;
  });
}

function activarBusqueda() {
  const input = document.querySelector(".buscador");
  const box = document.getElementById("resultados-busqueda");
  const contenedor = document.getElementById("contenedor-productos");

  if (input.value.trim() === "") return;

  modoBusqueda = true; // 🔥 ACTIVAMOS MODO FINAL

  box.style.display = "none";

  contenedor.scrollIntoView({
    behavior: "smooth"
  });
}

function enviarPedido() {
  let direccion = document.getElementById("direccion").value;
  let pago = document.getElementById("pago").value;
  let entrega = document.getElementById("entrega").value;

  // ✅ VALIDACIONES PRIMERO
  if (carrito.length === 0) {
    alert("Tu carrito está vacío");
    return;
  }

  if (entrega === "Delivery Gratis" && direccion.trim() === "") {
    alert("Debes ingresar una dirección");
    return;
  }

  // 🔥 MENSAJE
  let mensaje = "🛒 NUEVO PEDIDO\n\n";

  carrito.forEach(p => {
    mensaje += "- " + p.nombre + " x" + p.cantidad + 
           " - $" + (p.precio * p.cantidad).toLocaleString("es-CL") + "\n";
  });

  mensaje += "\n";
  mensaje += "🚚 Entrega: " + entrega + "\n";

  if (entrega === "Delivery Gratis") {
    mensaje += "📍 Dirección: " + direccion + "\n";
  }

  mensaje += "💰 Pago: " + pago + "\n";

  let total = carrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
  mensaje += "\n💵 Total: $" + total.toLocaleString("es-CL");

  let telefono = "+56932995927";

  let url = "https://api.whatsapp.com/send?phone=" + telefono +
            "&text=" + encodeURIComponent(mensaje);

  window.open(url, "_blank");
  const pedido = {
  productos: carrito,
  total: total,
  direccion: direccion,
  pago: pago,
  entrega: entrega,
  fecha: new Date().toISOString()
};

addDoc(collection(db, "pedidos"), pedido)
  .then(() => {
    console.log("🔥 Pedido guardado en Firebase");
  })
  .catch((error) => {
    console.error("❌ Error Firebase:", error);
  });

// ✅ GUARDAR PEDIDO FINALIZADO
let pedidos = JSON.parse(localStorage.getItem("pedidosFinalizados")) || [];

pedidos.push({
  fecha: new Date().toLocaleString(),
  productos: carrito,
  total: total
});

localStorage.setItem(
  "pedidosFinalizados",
  JSON.stringify(pedidos)
);

// 🧹 limpiar carrito
carrito = [];

localStorage.removeItem("carrito");

actualizarCarrito();
}
document.addEventListener("DOMContentLoaded", () => {

  const entrega = document.getElementById("entrega");
  const direccionInput = document.getElementById("direccion");

  if (entrega) {
    entrega.addEventListener("change", function() {
      if (this.value === "Retiro en tienda") {
        direccionInput.style.display = "none";
      } else {
        direccionInput.style.display = "block";
      }
    });

    entrega.dispatchEvent(new Event("change"));
  }

  actualizarCarrito();

  const contenedor = document.getElementById("contenedor-productos");
  if (contenedor) contenedor.style.display = "none";
});

document.addEventListener("DOMContentLoaded", () => {
  let indexSlide = 0;
  const slides = document.querySelectorAll(".slide");

  function cambiarSlide() {
    slides[indexSlide].classList.remove("activo");

    indexSlide = (indexSlide + 1) % slides.length;

    slides[indexSlide].classList.add("activo");
  }

  if (slides.length > 0) {
    setInterval(cambiarSlide, 3000);
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const fav = document.getElementById("contador-fav");
  if (fav) fav.innerText = favoritos.length;
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".contenedor-busqueda")) {
    document.getElementById("resultados-busqueda").style.display = "none";
  }
});
document.querySelector(".buscador").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
  e.preventDefault(); // 🔥 evita comportamiento duplicado
  activarBusqueda();
}
});

function cambiarCantidad(valor) {
  cantidad += valor;

  if (cantidad < 1) cantidad = 1;

  const el = document.getElementById("cantidad");
  if (el) el.innerText = cantidad;
}
function irInicio() {
  // mostrar slider
  document.getElementById("inicio").style.display = "block";

  // ocultar productos si estaban filtrados
  document.getElementById("contenedor-productos").style.display = "none";

  // limpiar buscador
  const input = document.querySelector(".buscador");
  if (input) input.value = "";

  // quitar clases activas
  document.querySelectorAll(".categorias button").forEach(b => {
    b.classList.remove("activo");
  });

  // activar botón inicio
  const btnInicio = document.querySelector(".categorias button");
  if (btnInicio) btnInicio.classList.add("activo");

  // ocultar resultados búsqueda
  const box = document.getElementById("resultados-busqueda");
  if (box) box.style.display = "none";

  // scroll arriba
  window.scrollTo({ top: 0, behavior: "smooth" });
}
let clicksLogo = 0;

function clickLogo() {

  // 🔥 comportamiento normal
  irInicio();

  // 🔐 contador secreto
  clicksLogo++;

  // 🚀 abrir admin
  if (clicksLogo >= 5) {
    window.location.href = "admin.html";
  }

  // ⏱ reset automático
  setTimeout(() => {
    clicksLogo = 0;
  }, 2000);
}