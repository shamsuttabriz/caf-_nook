const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("coffee-store");
    const coffeesCollection = database.collection("coffees");
    const ordersCollection = database.collection("orders");

    app.get("/coffees", async (req, res) => {
      const allCoffees = await coffeesCollection.find().toArray();
      // console.log(allCoffees);
      res.send(allCoffees);
    });

    // Get a single coffee by id
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const coffee = await coffeesCollection.findOne(filter);
      // console.log(coffee);
      res.send(coffee);
    });

    // Get coffees by individual user
    app.get("/my-added-coffees/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email };
      const myCoffees = await coffeesCollection.find(filter).toArray();
      // console.log(myCoffees);
      res.send(myCoffees);
    });

    // handle like toggle
    app.patch("/like/:coffeeId", async (req, res) => {
      const id = req.params.coffeeId;
      const email = req.body.email;
      console.log(email);
      const filter = { _id: new ObjectId(id) };
      const coffee = await coffeesCollection.findOne(filter);
      // check if the user has already liked the coffee or not;
      const alreadyLiked = coffee?.likeBy.includes(email);
      const updateDoc = alreadyLiked
        ? {
            $pull: {
              // dislike coffee (pop email from likeBy array)
              likeBy: email,
            },
          }
        : {
            $addToSet: {
              // Like coffee (push email in likeBy array)
              likeBy: email,
            },
          };
      await coffeesCollection.updateOne(filter, updateDoc);
      res.send({
        message: alreadyLiked ? "Dislike Successfull" : "Like Successful",
        liked: !alreadyLiked,
      });
    });

    // save a coffee data in database through post request
    app.post("/add-coffee", async (req, res) => {
      const coffeeData = req.body;
      // convert string quantity to number type value
      const quantity = coffeeData.quantity;
      coffeeData.quantity = parseInt(quantity);
      const result = await coffeesCollection.insertOne(coffeeData);
      // console.log(result);
      res
        .status(201)
        .send({ ...result, message: "Data Paichi vai, Thank you" });
    });

    // save a coffee order data in database through post request
    app.post("/place-order/:coffeeId", async (req, res) => {
      const id = req.params.coffeeId;
      const orderData = req.body;
      console.log("Order data", orderData);
      const result = await ordersCollection.insertOne(orderData);
      if (result.acknowledged) {
        // update quantity from coffee collection
        await coffeesCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $inc: {
              quantity: -1,
            },
          }
        );
      }

      res.status(201).send(result);
    });

    // get all orders by customer email
    app.get('/my-order/:email', async (req, res) => {
      const email = req.params.email;
      const filter = {customerEmail : email};
      const allOrders = await ordersCollection.find(filter).toArray();
      res.send(allOrders)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
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
