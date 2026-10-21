
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// ========================================
// MIDDLEWARES
// ========================================
app.use(cors({ origin: "*" }));
app.use(express.json());

// ========================================
// CONEXIÓN A AIVEN MYSQL
// Variables configuradas en Render
// ========================================
const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 22812),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    ca: process.env.DB_SSL_CA,
    rejectUnauthorized: true
  },
  connectTimeout: 20000
});

// ========================================
// CONECTAR Y CREAR TABLA
// ========================================
conexion.connect((error) => {
  if (error) {
    console.error("❌ Error MySQL:", error.message);
    return;
  }

  console.log("✅ MySQL conectado correctamente a Aiven");

  const sqlTabla = `
    CREATE TABLE IF NOT EXISTS productos (
      id_producto INT AUTO_INCREMENT PRIMARY KEY,
      nombre_producto VARCHAR(150) NOT NULL,
      precio DECIMAL(10,2) NOT NULL DEFAULT 0,
      stock INT NOT NULL DEFAULT 0,
      categoria VARCHAR(100),
      fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  conexion.query(sqlTabla, (errorTabla) => {
    if (errorTabla) {
      console.error(
        "❌ Error al crear/verificar la tabla:",
        errorTabla.message
      );
      return;
    }

    console.log("✅ Tabla productos lista");
  });
});

// ========================================
// RUTA PRINCIPAL
// ========================================
app.get("/", (req, res) => {
  res.json({
    mensaje: "Servidor PaperSoft funcionando",
    baseDatos: "Aiven MySQL"
  });
});

// ========================================
// CONSULTAR TODOS LOS PRODUCTOS
// ========================================
app.get("/productos", (req, res) => {
  const sql = `
    SELECT *
    FROM productos
    ORDER BY id_producto DESC
  `;

  conexion.query(sql, (error, resultados) => {
    if (error) {
      console.error("❌ Error al consultar productos:", error.message);

      return res.status(500).json({
        mensaje: "Error al consultar productos"
      });
    }

    res.json(resultados);
  });
});

// ========================================
// AGREGAR PRODUCTO
// ========================================
app.post("/agregar", (req, res) => {
  const {
    nombre_producto,
    precio,
    stock,
    categoria
  } = req.body;

  if (
    !nombre_producto ||
    precio === undefined ||
    stock === undefined
  ) {
    return res.status(400).json({
      mensaje: "Nombre, precio y stock son obligatorios"
    });
  }

  const sql = `
    INSERT INTO productos
      (nombre_producto, precio, stock, categoria)
    VALUES (?, ?, ?, ?)
  `;

  const valores = [
    nombre_producto,
    Number(precio),
    Number(stock),
    categoria || null
  ];

  conexion.query(sql, valores, (error, resultado) => {
    if (error) {
      console.error("❌ Error al agregar producto:", error.message);

      return res.status(500).json({
        mensaje: "Error al guardar producto",
        error: error.message
      });
    }

    res.status(201).json({
      mensaje: "Producto agregado correctamente",
      id_producto: resultado.insertId
    });
  });
});

// ========================================
// EDITAR PRODUCTO
// ========================================
app.put("/editar/:id", (req, res) => {
  const id = Number(req.params.id);

  const {
    nombre_producto,
    precio,
    stock,
    categoria
  } = req.body;

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !nombre_producto ||
    precio === undefined ||
    stock === undefined
  ) {
    return res.status(400).json({
      mensaje: "Datos del producto no válidos"
    });
  }

  const sql = `
    UPDATE productos
    SET nombre_producto = ?,
        precio = ?,
        stock = ?,
        categoria = ?
    WHERE id_producto = ?
  `;

  const valores = [
    nombre_producto,
    Number(precio),
    Number(stock),
    categoria || null,
    id
  ];

  conexion.query(sql, valores, (error, resultado) => {
    if (error) {
      console.error("❌ Error al editar producto:", error.message);

      return res.status(500).json({
        mensaje: "Error al editar producto"
      });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    res.json({
      mensaje: "Producto actualizado correctamente"
    });
  });
});

// ========================================
// ELIMINAR PRODUCTO
// ========================================
app.delete("/eliminar/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      mensaje: "ID de producto no válido"
    });
  }

  const sql = "DELETE FROM productos WHERE id_producto = ?";

  conexion.query(sql, [id], (error, resultado) => {
    if (error) {
      console.error("❌ Error al eliminar producto:", error.message);

      return res.status(500).json({
        mensaje: "Error al eliminar producto"
      });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    res.json({
      mensaje: "Producto eliminado correctamente"
    });
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor PaperSoft en puerto ${PORT}`);
});
