document.addEventListener("DOMContentLoaded", () => {
  // Selección de elementos del DOM
  const form = document.getElementById("form-transaccion");
  const tablaBody = document.querySelector("#tabla-transacciones tbody");
  const balanceSpan = document.getElementById("balance");
  const filtroTipo = document.getElementById("filtro-tipo");
  const filtroCategoria = document.getElementById("filtro-categoria");
  const formEditar = document.getElementById("form-editar");

  // Estado de la aplicación
  let transacciones = [];          // Lista de transacciones
  let transaccionEditando = null;  // Índice de la transacción en edición

  // === Función para actualizar el balance ===
  function actualizarBalance() {
    let total = 0;
    transacciones.forEach(t => {
      if (t.tipo === "Ingreso") {
        total += t.monto;
      } else {
        total -= t.monto;
      }
    });
    balanceSpan.textContent = total.toFixed(2);

    if (total < 0) {
      alert("⚠️ Tus gastos superan tus ingresos. ¡Cuidado!");
    }
  }

  // === Renderizar la tabla con filtros ===
  function renderizarTabla() {
    tablaBody.innerHTML = "";

    const tipoSeleccionado = filtroTipo ? filtroTipo.value : "";
    const categoriaSeleccionada = filtroCategoria ? filtroCategoria.value : "";

    transacciones.forEach((t, index) => {
      const coincideTipo = tipoSeleccionado === "" || t.tipo === tipoSeleccionado;
      const coincideCategoria = categoriaSeleccionada === "" || t.categoria === categoriaSeleccionada;

      if (!coincideTipo || !coincideCategoria) return;

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${t.tipo}</td>
        <td>${t.categoria}</td>
        <td>${t.descripcion}</td>
        <td>$${t.monto.toFixed(2)}</td>
        <td>${t.fecha}</td>
        <td>
          <button class="btn btn-warning btn-sm me-2" data-accion="editar" data-index="${index}">Editar</button>
          <button class="btn btn-danger btn-sm" data-accion="eliminar" data-index="${index}">Eliminar</button>
        </td>
      `;
      tablaBody.appendChild(fila);
    });
  }

  // === Delegación de eventos en la tabla ===
  tablaBody.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const accion = btn.dataset.accion;
    const index = Number(btn.dataset.index);

    if (accion === "editar") abrirModalEditar(index);
    if (accion === "eliminar") eliminarTransaccion(index);
  });

  // === Abrir modal con datos de la transacción a editar ===
  function abrirModalEditar(index) {
    transaccionEditando = index;
    const t = transacciones[index];
    if (!t) return;

    document.getElementById("editar-tipo").value = t.tipo;
    document.getElementById("editar-categoria").value = t.categoria;
    document.getElementById("editar-descripcion").value = t.descripcion;
    document.getElementById("editar-monto").value = t.monto;
    document.getElementById("editar-fecha").value = t.fecha;

    const modal = new bootstrap.Modal(document.getElementById("modalEditar"));
    modal.show();
  }

  // === Guardar cambios de edición ===
  if (formEditar) {
    formEditar.addEventListener("submit", (e) => {
      e.preventDefault();
      if (transaccionEditando === null) return;

      transacciones[transaccionEditando] = {
        tipo: document.getElementById("editar-tipo").value,
        categoria: document.getElementById("editar-categoria").value,
        descripcion: document.getElementById("editar-descripcion").value.trim(),
        monto: parseFloat(document.getElementById("editar-monto").value),
        fecha: document.getElementById("editar-fecha").value
      };

      renderizarTabla();
      actualizarBalance();

      const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditar"));
      if (modal) modal.hide();

      transaccionEditando = null;
    });
  }

  // === Agregar nueva transacción ===
  function agregarTransaccion(e) {
    e.preventDefault();

    const tipo = document.getElementById("tipo").value;
    const categoria = document.getElementById("categoria").value;
    const descripcion = document.getElementById("descripcion").value.trim();
    const monto = parseFloat(document.getElementById("monto").value);
    const fecha = document.getElementById("fecha").value;

    if (!tipo || !categoria || !descripcion || isNaN(monto) || monto <= 0 || !fecha) {
      alert("❌ Todos los campos son obligatorios y el monto debe ser mayor a 0.");
      return;
    }

    transacciones.push({ tipo, categoria, descripcion, monto, fecha });

    renderizarTabla();
    actualizarBalance();
    form.reset();
  }

  // === Eliminar una transacción ===
  function eliminarTransaccion(index) {
    if (!Number.isInteger(index)) return;
    if (confirm("¿Seguro que quieres eliminar esta transacción?")) {
      transacciones.splice(index, 1);
      renderizarTabla();
      actualizarBalance();
    }
  }

  // === Eventos principales ===
  if (form) form.addEventListener("submit", agregarTransaccion);
  if (filtroTipo) filtroTipo.addEventListener("change", renderizarTabla);
  if (filtroCategoria) filtroCategoria.addEventListener("change", renderizarTabla);

  // === Render inicial ===
  renderizarTabla();
});
