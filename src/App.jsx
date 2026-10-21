
import { useState, useEffect } from "react";

function App() {
  // BACKEND PUBLICADO EN RENDER
  const API = "https://papersoft-backend.onrender.com";

  const [productos, setProductos] = useState([]);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: "",
    precio: "",
    stock: "",
    categoria: ""
  });

  const [editando, setEditando] = useState(false);
  const [idEditar, setIdEditar] = useState(null);
  const [cargando, setCargando] = useState(false);

  // =========================
  // OBTENER PRODUCTOS
  // =========================
  const obtenerProductos = async () => {
    try {
      const respuesta = await fetch(`${API}/productos`);

      if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}`);
      }

      const datos = await respuesta.json();

      if (!Array.isArray(datos)) {
        throw new Error("La respuesta del servidor no es una lista");
      }

      setProductos(datos);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      alert(
        "No se pudieron consultar los productos. Revisa la conexión con el servidor."
      );
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  // =========================
  // MANEJAR INPUTS
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setNuevoProducto((anterior) => ({
      ...anterior,
      [name]: value
    }));
  };

  // =========================
  // LIMPIAR FORMULARIO
  // =========================
  const limpiarFormulario = () => {
    setNuevoProducto({
      nombre_producto: "",
      precio: "",
      stock: "",
      categoria: ""
    });

    setEditando(false);
    setIdEditar(null);
  };

  // =========================
  // GUARDAR O ACTUALIZAR
  // =========================
  const guardarProducto = async (e) => {
    e.preventDefault();

    if (cargando) return;

    if (
      !nuevoProducto.nombre_producto.trim() ||
      nuevoProducto.precio === "" ||
      nuevoProducto.stock === "" ||
      !nuevoProducto.categoria.trim()
    ) {
      alert("Completa todos los campos.");
      return;
    }

    const precio = Number(nuevoProducto.precio);
    const stock = Number(nuevoProducto.stock);

    if (!Number.isFinite(precio) || precio < 0) {
      alert("Ingresa un precio válido.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      alert("El stock debe ser un número entero igual o mayor que cero.");
      return;
    }

    const productoEnviar = {
      nombre_producto: nuevoProducto.nombre_producto.trim(),
      precio,
      stock,
      categoria: nuevoProducto.categoria.trim()
    };

    try {
      setCargando(true);

      const url = editando
        ? `${API}/editar/${idEditar}`
        : `${API}/agregar`;

      const method = editando ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productoEnviar)
      });

      const texto = await respuesta.text();
      let datos = {};

      try {
        datos = texto ? JSON.parse(texto) : {};
      } catch {
        datos = { mensaje: texto || "Respuesta no válida del servidor" };
      }

      if (!respuesta.ok) {
        console.error(
          "Error al guardar:",
          respuesta.status,
          datos
        );

        alert(
          `Error HTTP ${respuesta.status}: ${
            datos.error ||
            datos.mensaje ||
            "No se pudo guardar el producto."
          }`
        );

        return;
      }

      alert(
        datos.mensaje ||
        (editando
          ? "Producto actualizado correctamente."
          : "Producto guardado correctamente.")
      );

      limpiarFormulario();
      await obtenerProductos();
    } catch (error) {
      console.error("Error de conexión al guardar:", error);

      alert(
        "No se pudo conectar con el backend. Verifica que el servicio de Render esté activo."
      );
    } finally {
      setCargando(false);
    }
  };

  // =========================
  // PREPARAR EDICIÓN
  // =========================
  const editarProducto = (producto) => {
    setNuevoProducto({
      nombre_producto: producto.nombre_producto ?? "",
      precio: String(producto.precio ?? ""),
      stock: String(producto.stock ?? ""),
      categoria: producto.categoria ?? ""
    });

    setEditando(true);
    setIdEditar(producto.id_producto);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // =========================
  // ELIMINAR PRODUCTO
  // =========================
  const eliminarProducto = async (id) => {
    const confirmar = window.confirm(
      "¿Deseas eliminar este producto? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(`${API}/eliminar/${id}`, {
        method: "DELETE"
      });

      const texto = await respuesta.text();
      let datos = {};

      try {
        datos = texto ? JSON.parse(texto) : {};
      } catch {
        datos = { mensaje: texto };
      }

      if (!respuesta.ok) {
        console.error("Error al eliminar:", respuesta.status, datos);

        alert(
          `Error HTTP ${respuesta.status}: ${
            datos.error || datos.mensaje || "No se pudo eliminar el producto."
          }`
        );

        return;
      }

      alert(datos.mensaje || "Producto eliminado correctamente.");

      await obtenerProductos();
    } catch (error) {
      console.error("Error de conexión al eliminar:", error);

      alert("No se pudo conectar con el servidor para eliminar el producto.");
    }
  };

  // =========================
  // INTERFAZ
  // =========================
  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand fw-bold">
            PaperSoft
          </span>
        </div>
      </nav>

      <div className="container text-center mt-4">
        <h1 className="text-primary">Sistema PaperSoft</h1>
        <p>Gestión de productos</p>
      </div>

      {/* FORMULARIO */}
      <div className="container mt-4">
        <div className="card p-3 shadow-sm">
          <h5 className="mb-3">
            {editando ? "Editar producto" : "Registrar producto"}
          </h5>

          <form onSubmit={guardarProducto} className="row g-3">
            <div className="col-12 col-md-6 col-lg">
              <label className="form-label">Producto</label>
              <input
                className="form-control"
                type="text"
                placeholder="Nombre del producto"
                name="nombre_producto"
                value={nuevoProducto.nombre_producto}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg">
              <label className="form-label">Precio</label>
              <input
                className="form-control"
                type="number"
                placeholder="0.00"
                name="precio"
                value={nuevoProducto.precio}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg">
              <label className="form-label">Stock</label>
              <input
                className="form-control"
                type="number"
                placeholder="Cantidad"
                name="stock"
                value={nuevoProducto.stock}
                onChange={handleChange}
                min="0"
                step="1"
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg">
              <label className="form-label">Categoría</label>
              <input
                className="form-control"
                type="text"
                placeholder="Categoría"
                name="categoria"
                value={nuevoProducto.categoria}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>

            <div className="col-12 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-success"
                disabled={cargando}
              >
                {cargando
                  ? "Procesando..."
                  : editando
                  ? "Actualizar producto"
                  : "Guardar producto"}
              </button>

              {editando && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={limpiarFormulario}
                  disabled={cargando}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="container mt-4 pb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Inventario de productos</h4>

          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={obtenerProductos}
          >
            Actualizar lista
          </button>
        </div>

        <div className="table-responsive shadow-sm">
          <table className="table table-striped table-hover table-bordered align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No hay productos registrados.
                  </td>
                </tr>
              ) : (
                productos.map((p) => (
                  <tr key={p.id_producto}>
                    <td>{p.id_producto}</td>
                    <td>{p.nombre_producto}</td>
                    <td>
                      $
                      {Number(p.precio || 0).toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td>{p.stock}</td>
                    <td>{p.categoria}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() => editarProducto(p)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => eliminarProducto(p.id_producto)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-muted small mt-2">
          Productos registrados: {productos.length}
        </p>
      </div>
    </div>
  );
}

export default App;
