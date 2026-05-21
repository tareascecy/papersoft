import { useState, useEffect } from "react";

function App() {

  // ESTADOS
  const [productos, setProductos] = useState([]);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    stock: "",
    categoria: ""
  });

  const [editando, setEditando] = useState(false);

  const [idEditar, setIdEditar] = useState(null);

  // OBTENER PRODUCTOS
  const obtenerProductos = async () => {

    try {

      const respuesta = await fetch(
        "https://papersoft.infinityfreeapp.com/api/obtener_productos.php"
      );

      const datos = await respuesta.json();

      console.log(datos);

      setProductos(datos);

    } catch (error) {

      console.log(error);

      alert("Error al obtener productos");

    }

  };

  // CARGAR PRODUCTOS
  useEffect(() => {

    obtenerProductos();

  }, []);

  // CAPTURAR INPUTS
  const handleChange = (e) => {

    setNuevoProducto({

      ...nuevoProducto,
      [e.target.name]: e.target.value

    });

  };

  // AGREGAR Y EDITAR
  const agregarProducto = async (e) => {

    e.preventDefault();

    try {

      const formData = new FormData();

      formData.append("nombre", nuevoProducto.nombre);
      formData.append("precio", nuevoProducto.precio);
      formData.append("stock", nuevoProducto.stock);
      formData.append("categoria", nuevoProducto.categoria);

      // EDITAR
      if (editando) {

        formData.append("id", idEditar);

        const respuesta = await fetch(
          "https://papersoft.infinityfreeapp.com/api/editar_producto.php",
          {
            method: "POST",
            body: formData
          }
        );

        const datos = await respuesta.json();

        alert(datos.mensaje);

        setEditando(false);

        setIdEditar(null);

      } else {

        // AGREGAR
        const respuesta = await fetch(
          "https://papersoft.infinityfreeapp.com/api/agregar_producto.php",
          {
            method: "POST",
            body: formData
          }
        );

        const datos = await respuesta.json();

        alert(datos.mensaje);

      }

      // RECARGAR PRODUCTOS
      obtenerProductos();

      // LIMPIAR FORMULARIO
      setNuevoProducto({

        nombre: "",
        precio: "",
        stock: "",
        categoria: ""

      });

    } catch (error) {

      console.log(error);

      alert("Error al guardar producto");

    }

  };

  // ELIMINAR
  const eliminarProducto = async (id) => {

    // CONFIRMAR
    const confirmar = window.confirm(
      "¿Desea eliminar este producto?"
    );

    if (!confirmar) {
      return;
    }

    try {

      const formData = new FormData();

      formData.append("id", id);

      const respuesta = await fetch(
        "https://papersoft.infinityfreeapp.com/api/eliminar_producto.php",
        {
          method: "POST",
          body: formData
        }
      );

      const datos = await respuesta.json();

      console.log(datos);

      alert(datos.mensaje);

      // ACTUALIZAR TABLA
      obtenerProductos();

    } catch (error) {

      console.log(error);

      alert("Error al eliminar producto");

    }

  };

  // EDITAR
  const editarProducto = (producto) => {

    setNuevoProducto({

      nombre: producto.nombre_producto,
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria

    });

    setEditando(true);

    setIdEditar(producto.id_producto);

  };

  return (

    <div className="bg-light min-vh-100">

      {/* NAVBAR */}

      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">

        <div className="container">

          <a className="navbar-brand fw-bold" href="#">

            <i className="bi bi-shop me-2"></i>

            PaperSoft

          </a>

        </div>

      </nav>

      {/* TITULO */}

      <div className="container mt-5">

        <div className="text-center mb-5">

          <h1 className="text-primary fw-bold display-5">
            Sistema PaperSoft
          </h1>

          <p className="lead text-secondary">
            Gestión Profesional de Papelería
          </p>

        </div>

      </div>

      {/* FORMULARIO */}

      <div className="container mt-5">

        <div className="card shadow border-0">

          <div className="card-header bg-primary text-white">

            <h4 className="mb-0">

              <i className="bi bi-pencil-square me-2"></i>

              {editando ? "Editar Producto" : "Registrar Producto"}

            </h4>

          </div>

          <div className="card-body">

            <form onSubmit={agregarProducto}>

              <div className="row g-3">

                {/* NOMBRE */}

                <div className="col-md-4">

                  <label className="form-label fw-bold">
                    Producto
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ingrese producto"
                    name="nombre"
                    value={nuevoProducto.nombre}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* PRECIO */}

                <div className="col-md-2">

                  <label className="form-label fw-bold">
                    Precio
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    placeholder="$"
                    name="precio"
                    value={nuevoProducto.precio}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* STOCK */}

                <div className="col-md-2">

                  <label className="form-label fw-bold">
                    Stock
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    name="stock"
                    value={nuevoProducto.stock}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* CATEGORIA */}

                <div className="col-md-2">

                  <label className="form-label fw-bold">
                    Categoría
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Categoría"
                    name="categoria"
                    value={nuevoProducto.categoria}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* BOTON */}

                <div className="col-md-2 d-flex align-items-end">

                  <button className="btn btn-success w-100 fw-bold">

                    <i className="bi bi-floppy me-2"></i>

                    {editando ? "Actualizar" : "Guardar"}

                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>

      </div>

      {/* TABLA */}

      <div className="container mt-5 pb-5">

        <div className="card shadow border-0">

          <div className="card-header bg-success text-white">

            <h4 className="mb-0">

              <i className="bi bi-table me-2"></i>

              Productos Registrados

            </h4>

          </div>

          <div className="card-body">

            <div className="table-responsive">

              <table className="table table-hover align-middle">

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

                  {Array.isArray(productos) &&
                    productos.map((producto) => (

                      <tr key={producto.id_producto}>

                        <td>
                          {producto.id_producto}
                        </td>

                        <td className="fw-bold">
                          {producto.nombre_producto}
                        </td>

                        <td className="text-success fw-bold">
                          ${producto.precio}
                        </td>

                        <td>
                          {producto.stock}
                        </td>

                        <td>

                          <span className="badge bg-primary">

                            {producto.categoria}

                          </span>

                        </td>

                        <td>

                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => editarProducto(producto)}
                          >

                            <i className="bi bi-pencil-square me-1"></i>

                            Editar

                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              eliminarProducto(producto.id_producto)
                            }
                          >

                            <i className="bi bi-trash me-1"></i>

                            Eliminar

                          </button>

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default App;