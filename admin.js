// 🔐 LOGIN
const password = prompt("🔐 Clave de administrador");

if (password !== "jamr.448") {
  alert("Acceso denegado");
  window.location.href = "index.html";
}

// 📦 DATA
let stockData = JSON.parse(localStorage.getItem("stock")) || {};
let cambios = JSON.parse(localStorage.getItem("adminProductos")) || [];
let extras = JSON.parse(localStorage.getItem("productosExtra")) || [];
let eliminados = JSON.parse(localStorage.getItem("productosEliminados")) || [];

// 🚀 CARGAR PRODUCTOS
fetch("productos.json")
  .then(res => res.json())
  .then(data => {

    let productos = [...data, ...extras]
      .filter(p => !eliminados.includes(p.id))
      .map(p => {
        let mod = cambios.find(c => c.id === p.id);
        return mod ? { ...p, ...mod } : p;
      });

    renderAdmin(productos);
    actualizarDashboard(productos);
  });

// 🧠 RENDER
function renderAdmin(productos) {
  const contenedor = document.getElementById("admin-productos");
  contenedor.innerHTML = "";

  productos.forEach(p => {

    const stockActual = stockData[p.id] ?? p.stock ?? 0;

    contenedor.innerHTML += `
      <div class="admin-card">

        <img src="${(p.imagenes || [p.imagen])[0] || 'imagenes/no-image.png'}">

        <h3>${p.nombre}</h3>

        <label>Nombre</label>
        <input id="nombre-${p.id}" value="${p.nombre}">

        <label>Precio</label>
        <input type="number" id="precio-${p.id}" value="${p.precio}">

        <label>Stock</label>
        <input type="number" id="stock-${p.id}" value="${stockActual}">

        <button class="btn-guardar" onclick="guardar(${p.id})">
        💾 Guardar
        </button>

        <button class="btn-eliminar-admin" onclick="eliminarProducto(${p.id})">
         🗑 Eliminar
        </button>

      </div>
    `;
  });
}
function guardar(id) {

  let cambios = JSON.parse(localStorage.getItem("adminProductos")) || [];
  let stockData = JSON.parse(localStorage.getItem("stock")) || {};

  const nombre = document.getElementById(`nombre-${id}`).value;
  const precio = Number(document.getElementById(`precio-${id}`).value);
  const stock = Number(document.getElementById(`stock-${id}`).value);

  let prod = cambios.find(p => p.id === id);

  if (!prod) {
    prod = { id };
    cambios.push(prod);
  }

  prod.nombre = nombre;
  prod.precio = precio;

  localStorage.setItem("adminProductos", JSON.stringify(cambios));

  stockData[id] = stock;
  localStorage.setItem("stock", JSON.stringify(stockData));

  alert("✅ Guardado");
}
function eliminarProducto(id) {

  let eliminados = JSON.parse(localStorage.getItem("productosEliminados")) || [];

  eliminados.push(id);

  localStorage.setItem("productosEliminados", JSON.stringify(eliminados));

  alert("🗑 Eliminado");
  location.reload();
}
function mostrarFormularioNuevo() {
  document.getElementById("form-nuevo").innerHTML = `
    <div class="admin-card">
      <h3>Nuevo Producto</h3>

      <input id="nuevo-nombre" placeholder="Nombre">
      <input id="nuevo-precio" type="number" placeholder="Precio">
      <input id="nuevo-stock" type="number" placeholder="Stock">
      <textarea 
  id="nuevo-descripcion"
  placeholder="Descripción del producto"
></textarea>
      <select id="nuevo-categoria">
  <option value="basquetbol">🏀 Basquetbol</option>
  <option value="beisbol">⚾ Beisbol</option>
  <option value="futbol">⚽ Futbol</option>
  <option value="gorras">🧢 Gorras</option>
  <option value="polerones">🧥 Polerones</option>
</select>

      <input type="file" id="nuevo-imagen">

      <button class="btn-crear" onclick="crearProducto()">
     ➕ Crear producto
    </button>
    </div>
  `;
}
function convertirBase64(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

async function crearProducto() {

  let extras = JSON.parse(localStorage.getItem("productosExtra")) || [];

  const nombre = document.getElementById("nuevo-nombre").value;
  const precio = Number(document.getElementById("nuevo-precio").value);
  const stock = Number(document.getElementById("nuevo-stock").value);
  const descripcion =
  document.getElementById("nuevo-descripcion").value;
  const categoria = document.getElementById("nuevo-categoria").value;

  const file = document.getElementById("nuevo-imagen").files[0];

if (!file) {
  alert("Debes subir una imagen");
  return;
}

let imagen = await convertirBase64(file);

  extras.push({
  id: Date.now(),
  nombre,
  precio,
  stock,
  descripcion,
  categoria,
  imagen
});

  localStorage.setItem("productosExtra", JSON.stringify(extras));

  alert("✅ Producto creado");
  location.reload();
}
function actualizarDashboard(productos) {

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // 💰 total ventas
  let ventas = 0;

  carrito.forEach(p => {
    ventas += p.precio * p.cantidad;
  });

  // 🛒 productos vendidos
  let vendidos = 0;

  carrito.forEach(p => {
    vendidos += p.cantidad;
  });

  // 📦 sin stock
  let sinStock = 0;

  productos.forEach(p => {
    let stock = stockData[p.id] ?? p.stock ?? 0;

    if(stock <= 0){
      sinStock++;
    }
  });

  // 📋 pedidos
  let pedidos = carrito.length;

  // 🔥 render
  document.getElementById("ventas-total").innerText =
    "$" + ventas.toLocaleString("es-CL");

  document.getElementById("productos-vendidos").innerText = vendidos;

  document.getElementById("sin-stock").innerText = sinStock;

  document.getElementById("total-pedidos").innerText = pedidos;
}