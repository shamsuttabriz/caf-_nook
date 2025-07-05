const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 3000;
const app = express();

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient( process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
    try {
        const database = client.db('coffee-store');
        const coffeesCollection = database.collection('coffees');

        app.get('/coffees', async (req, res) => {
            const allCoffees = await coffeesCollection.find().toArray();
            console.log(allCoffees);
            res.send(allCoffees);
        })

      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    }
  }
  run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Coffee Store Server!!");
});

app.listen(port, () => {
  console.log("Server runing at port - ", port);
});
