const express = require('express')
const cors = require('cors')
const { MongoClient } = require('mongodb');
const objectId = require('mongodb').ObjectId;
require('dotenv').config()
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aobjx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("services");
        const serviceCollection = database.collection("service");
        const orderCollection = database.collection("placeOrders");

        // get services
        app.get("/allServices", async (req, res) => {
            const result = await serviceCollection.find({}).toArray();
            res.send(result)
        })

        // get single service
        app.get(`/bookingDetail/:id`, async (req, res) => {
            const id = req.params.id;
            const item = { _id: objectId(id) };
            const result = await serviceCollection.findOne(item);
            res.send(result)
        })

        // post place order
        app.post("/placeOrder", async (req, res) => {
            const data = req.body;
            const result = await orderCollection.insertOne(data)
            res.send(result)
        })

        // get my order 
        app.get('/myorder/:email', async (req, res) => {
            // const id = req.params.email;
            // const item = { _id: objectId(id) };
            const result = await orderCollection.find({ email: req.params.email }).toArray();
            res.send(result)
        })

        // delete order
        app.delete('/deleteOrder/:deleteId', async (req, res) => {
            const id = req.params.deleteId;
            const item = { _id: objectId(id) };
            const result = await orderCollection.deleteOne(item)
            res.send(result)
        })

        // get all booking
        app.get('/allBooking', async (req, res) => {
            const result = await orderCollection.find({}).toArray();
            res.send(result)
        })

        // update status
        app.put(`/updateStatus/:id`, async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;
            const filter = { _id: objectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateData.status = "approved"
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)

        })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello World")
})

app.listen(port, () => {
    console.log("listening to port", port);
})