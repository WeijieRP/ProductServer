const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// ✅ Create Pool Properly
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
});

// ================== GET ALL ==================
app.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM product");
    if (rows.length === 0)
      return res.json({ message: "No products found" });

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== GET BY ID ==================
app.get("/product/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [rows] = await db.execute(
      "SELECT * FROM product WHERE id = ?",
      [id]
    );

    if (rows.length === 0)
      return res.json({ message: `Product ID ${id} not found` });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== INSERT ==================
app.post("/product", async (req, res) => {
  try {
    const { productname, price, qty } = req.body;

    const [result] = await db.execute(
      "INSERT INTO product (productname, price, qty) VALUES (?, ?, ?)",
      [productname, price, qty]
    );

    res.json({
      message: "Product inserted successfully",
      insertId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== DELETE ==================
app.delete("/product/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [result] = await db.execute(
      "DELETE FROM product WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0)
      return res.json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== UPDATE ==================
app.put("/product/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { productname, price, qty } = req.body;

    const [result] = await db.execute(
      "UPDATE product SET productname=?, price=?, qty=? WHERE id=?",
      [productname, price, qty, id]
    );

    if (result.affectedRows === 0)
      return res.json({ message: "Product not found" });

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== 404 ==================
app.use((req, res) => {
  res.status(404).json({ message: "404 route not found" });
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
