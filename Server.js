const express = require("express");
const mysql2 = require("mysql2/promise");
const app = express();
const cors = require("cors");
require("dotenv").config()
app.use(express.json());

const PORT = process.env.DB_PORT ||3000;
const dbConfig = mysql2.createPool({
    DB_HOST : process.env.DB_HOST,
    DB_PASSWORD:process.env.DB_PASSWORD,
    DB_PORT:process.env.DB_PORT,
    DB_USER:process.env.DB_USER,
    DB_NAME:process.env.DB_NAME, 
    connectTimeout:1000,
})
// -------------------- CORS --------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.REACT_APP_API_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      // school deployment: allow all
      return cb(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// get all the proeducts list back 

app.get("/", async(req , res)=>{
    const connections = await mysql2.createConnection(dbConfig);
    const [rows]= await connections.execute("SELECT * FROM products");
    if(rows.length===0) return res.json({message :"There is nth in the database"});
    return res.json(rows);// return the json data 
})

//get the details for each products detaols 

app.get("/product/:id", async(req , res)=>{
    const {id} = req.params;
    const connections = await mysql2.createConnection(dbConfig);
    const [rows] = await connections.execute("SELECT * FROM products WHERE productID = ?", [Number(id)]);
    if(rows.length===0) return res.json({message :"Product ID with " + id + "is not found in the database"});
    return res.json(rows)
})

app.post("/product", async(req , res)=>{
    const {productname , price , qty } = req.body;
    // const{ ids} = req.params;
    const connections = await mysql2.createConnection(dbConfig);
    const [rows] = await connections.execute("INSERT INTO product (productname , price , qty) VALUES(?,?,?)", [productname , price ,qty]);
    if(rows.affectedRows===0) return res.json({message:"Product Insertion operation failed"});
    return res.json(rows) // return  back he reson the insert res
    // const [findexistproduct] = await connections.execute("SELECT * FROM product WHERE pr")
})

///app

app.delete("/product/:id", async(req , res)=>{
    const {ids} = Number(req.params);
    const connections = await mysql2.createConnection(dbConfig);
    const [rows] = await connections.execute("DELETE * FROM product WHERE productID=?", [ids]);
    if(rows.affectedRows===0) return res.json({message : "Product Deletion operation failed"});
    return res.json(rows) /// 
    // returnn the json respoje
})
// update the prodycy with the ids

app.put("/product/:id",async(req , res)=>{
    const {id}=Number(req.params);
    const {productname , price , qty} = req.body;
    const connections = await mysql2.createConnection(dbConfig);
    const [rows] = await connections.execute("UPDATE FROM product productname =? , price=? , qty=? WHERE productID=?",[productname , price , qty , id]);
    if(rows.affectedRows===0) return res.json({message:"Product Update operation failed"});
    return res.json(rows);// return the reponse 
})


// 404 routes is the last routes 
app.use((req , res , next)=>{
    res.status(404).json({message:"404 error routes "})
})
app.listen(PORT , ()=>{
    console.log("Server runing at ", PORT)
})