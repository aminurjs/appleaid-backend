const express = require("express");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const port = process.env.port || 5000;

//MiddleWare
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sz2xe62.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = client.db("appleAid");

const usersCollection = db.collection("users");
const postCollection = db.collection("posts");

app.post("/api/sign-in", async (req, res) => {
  const data = req.body;
  const user = { ...data, role: "user" };
  const result = await usersCollection.insertOne(user);
  res.send(result);
});
app.post("/api/google-login", async (req, res) => {
  const data = req.body;
  const existingUser = await usersCollection.findOne({ email: data.email });
  if (!existingUser) {
    const user = { ...data, role: "user" };
    const result = await usersCollection.insertOne(user);
    return res.send(result);
  } else {
    res.send({ message: "user is available" });
  }
});
app.get("/api/user/:email", async (req, res) => {
  const { email } = req.params;
  const result = await usersCollection.findOne({ email });
  console.log(result);
  if (result) {
    return res.send(result);
  }
  res.send({ message: null });
});
app.post("/api/post", async (req, res) => {
  const data = req.body;
  const result = await postCollection.insertOne(data);
  res.send(result);
});
app.get("/api/all-posts", async (req, res) => {
  const result = await postCollection.find().sort({ _id: -1 }).toArray();

  res.send(result);
});
app.get("/api/post/:id", async (req, res) => {
  const { id } = req.params;
  const query = { _id: new ObjectId(id) };
  const result = await postCollection.findOne(query);
  res.send(result);
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server running in the port: ${port}`);
});
