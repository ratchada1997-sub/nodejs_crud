//nodemon index.js
const express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");
const multer = require("multer");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
  res.render("form");
});

app.set("view engine", "pug");

app.set("views", "./views");

// // for parsing application/json
app.use(bodyParser.json());

// // for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));

// for parsing multipart/form-data
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const { MongoClient } = require("mongodb");
const uri = "mongodb://Admin:Admin1234@localhost:27017";

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, __dirname + "/uploads");
  },

  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/products/upload", upload.single("image"), async (req, res) => {
  // console.log("imagesss", req.body); // Logs form body values
  // console.log(req.file); // Logs any files

  // res.json({ message: "File(s) uploaded successfully" });
  const products = req.file.filename;
  const client = new MongoClient(uri);
  await client.connect();
  await client.db("Stock").collection("products").insertOne({
    image: req.file.filename,
  });
  await client.close();
  res.status(200).send({
    status: "01",
    response_data: products,
  });
});

app.post("/products/create", upload.single("thumbnail"), async (req, res) => {
  const products = req.body;
  const client = new MongoClient(uri);
  await client.connect();
  await client.db("Stock").collection("products").insertOne({
    id: products.id,
    product_id: products.product_id,
    product_name: products.product_name,
    description: products.description,
    price: products.price,
    total_in: products.total_in,
    // thumbnail: req.file.filename,
    total_out: products.total_out,
  });
  await client.close();
  res.status(200).send({
    status: "01",
    response_data: products,
  });
});

// app.get("/products", async (req, res) => {
//   const client = new MongoClient(uri);
//   await client.connect();
//   const products = await client
//     .db("Stock")
//     .collection("products")
//     .find({})
//     .toArray();
//   await client.close();
//   res.status(200).send({
//     status: "01",
//     response_data: products,
//   });
// });
app.get("/products", async (req, res) => {
  const client = new MongoClient(uri);
  await client.connect();

  // You can specify the number of items per page using a query parameter, e.g., ?page=1&perPage=10
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided

  const skip = (page - 1) * limit; // Calculate the number of items to skip

  const products = await client
    .db("Stock")
    .collection("products")
    .find({})
    .skip(skip)
    .limit(limit) // Limit the number of items per page
    .toArray();

  await client.close();

  res.status(200).send({
    status: "01",
    response_data: products,
  });
});

app.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const client = new MongoClient(uri);
  await client.connect();
  const products = await client
    .db("Stock")
    .collection("products")
    .findOne({ id: id });
  await client.close();
  res.status(200).send({
    status: "01",
    response_data: [products],
  });
});

app.put("/products/update", async (req, res) => {
  const products = req.body;
  const id = products.id;
  const client = new MongoClient(uri);
  await client.connect();
  await client
    .db("Stock")
    .collection("products")
    .updateOne(
      { id: id },
      {
        $set: {
          id: parseInt(products.id),
          product_id: products.product_id,
          product_name: products.product_name,
          description: products.description,
          price: products.price,
          total_in: products.total_in,
          // thumbnail: products.thumbnail,
          total_out: products.total_out,
        },
      }
    );

  await client.close();
  res.status(200).send({
    status: "01",
    message: "product with ID = " + products.id + "update success",
    response_data: products,
  });
});

app.delete("/products/delete", async (req, res) => {
  const id = parseInt(req.body.id);
  const client = new MongoClient(uri);
  await client.connect();
  await client.db("Stock").collection("products").deleteOne({ id: id });
  await client.close();
  res.status(200).send({
    status: "01",
    message: "User with ID = " + id + "deleted success",
  });
});
