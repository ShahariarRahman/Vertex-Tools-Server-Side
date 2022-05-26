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

app.get('/', (req, res) => {
    res.send('Vertex Tools Server Is Running')
});

app.listen(port, () => console.log('Listening Port', port));