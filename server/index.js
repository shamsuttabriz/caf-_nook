const express = require("express");
require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const admin = require("firebase-admin");
const decoded = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf-8');
const serviceAccount = JSON.parse(decoded);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;
const app = express();
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// JWT Middleware
const verifyToken = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1];
  // const token = req?.cookies?.token
  console.log("neo token: ", token);
  if (!token) return res.status(401).send({ message: "Unauthorized Access1!" });
  // verify token using firebase admin sdk
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.tokenEmail = decoded.email;
    console.log(decoded);
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).send({ message: "Unauthorized Access1!" });
  }

  // jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
  //   if (err) {
  //     console.log(err);
  //     return res.status(401).send({ message: "Unauthorized Access2!" });
  //   }
  //   req.tokenEmail = decoded.email;
  //   next();
  // });
};

async function run() {
  try {
    const database = client.db("coffee-store");
    const coffeesCollection = database.collection("coffees");
    const ordersCollection = database.collection("orders");

    // Generate jwt
    app.post("/jwt", (req, res) => {
      const user = { email: req.body.email };
      console.log(user);
      // token creation
      // require('crypto').randomBytes(64).toString('hex') : make secret key command;
      const token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d",
      });

      // sedn token in response for cookies method
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ message: "JWT Created Successfully!" });

      // send token in response for localstorage method
      // res.send({ token: token, message: "JWT Created Successfully!" });
    });

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
    app.get("/my-orders/:email", verifyToken, async (req, res) => {
      const decodedToken = req.tokenEmail;
      const email = req.params.email;

      if (decodedToken !== email) {
        return res.status(403).send({ message: "Forbidden Access!" });
      }

      const filter = { customerEmail: email };
      const allOrders = await ordersCollection.find(filter).toArray();
      // allOrders.forEach(async (order) => {
      //   const coffeeId = order.coffeeId;
      //   const fullCoffeeData = await coffeesCollection.findOne({
      //     _id: new ObjectId(coffeeId)
      //   });
      //   order.name = fullCoffeeData.name;
      //   console.log(order);
      // });

      for (const order of allOrders) {
        const coffeeId = order.coffeeId;
        const fullCoffeeData = await coffeesCollection.findOne({
          _id: new ObjectId(coffeeId),
        });
        order.name = fullCoffeeData.name;
        order.photo = fullCoffeeData.photo;
        order.price = fullCoffeeData.price;
        order.quantity = fullCoffeeData.quantity;
      }
      res.send(allOrders);
    });

    // Delete a single order from my orders
    app.delete("/my-orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const { coffeeId } = await ordersCollection.findOne(query);
      const result = await ordersCollection.deleteOne(query, {
        new: true,
      });
      console.log(result);
      if (result.acknowledged) {
        // update quantity from coffee collection
        const hello = await coffeesCollection.updateOne(
          { _id: new ObjectId(coffeeId) },
          {
            $inc: {
              quantity: 1,
            },
          }
        );
      }
      res.send(result);
    });

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
