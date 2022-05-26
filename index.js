const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;


// start

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y4xsemh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden' });
        }
        req.decoded = decoded;
        next();
    });
};



const run = async () => {
    try {
        await client.connect();
        const toolCollection = client.db("vertex-tools").collection("tools");
        const orderCollection = client.db("vertex-tools").collection("orders");
        const userCollection = client.db('vertex-tools').collection('users');
        const reviewCollection = client.db("vertex-tools").collection("reviews");
        const paymentCollection = client.db('vertex-tools').collection('payments');



        app.get('/tools', async (req, res) => {
            const tools = await toolCollection.find().sort({ time: -1 }).toArray();
            res.send(tools);
        });

        app.get('/tools/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await toolCollection.findOne(query);
            res.send(tool);
        });

        app.post('/tools', verifyJWT, async (req, res) => {
            const tool = req.body;
            const result = await toolCollection.insertOne(tool);
            res.send(result);
        });

        app.delete('/tools', verifyJWT, async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) };
            const result = await toolCollection.deleteOne(query);
            res.send(result);
        });

        app.get('/orders', verifyJWT, async (req, res) => {
            const orders = await orderCollection.find().sort({ time: -1 }).toArray();
            res.send(orders);
        });

        app.get('/orders/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const orders = await orderCollection.find({ email }).sort({ time: -1 }).toArray();
            res.send(orders);
        });
        app.get('/order/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
            res.send(order);
        });


    }

    finally { }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Vertex Tools Server Is Running')
});

app.listen(port, () => console.log('Listening Port', port));