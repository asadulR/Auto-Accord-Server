const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
require('dotenv').config();
const port = process.env.PORT || 4000;


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Auto Accord server');
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f3est.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run(){
    try{
        await client.connect();

        const inventoryCollection = client.db('AutoAccord').collection('InventoryItems');
        const myInventoryCollection = client.db('AutoAccord').collection('MyInventoryItems');

        //  load inventory items from database
        app.get('/items', async(req, res) => {
            const query = {};

            const cursor = inventoryCollection.find(query);
            const items = await cursor.toArray();

            res.send(items);
        });

        //  Load single Inventory item to update
        app.get("/items/:id", async(req,res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};

            const item = await inventoryCollection.findOne(query);

            res.send(item);
        });

        //  updating inventory item by PUT API
        app.put("/items/:id", async (req, res) => {
            const id = req.params.id;
            const updateItem = req.body;
            const filter = {_id: ObjectId(id)};

            const options = {upsert: true};

            const updateDoc = {
                $set: {
                    quantity: updateItem.quantity
                },
            }

            const result = await inventoryCollection.updateOne(filter, updateDoc, options);

            res.send(result);
        });

        //  POST API for recieving inventory items from client side

        app.post('/items', async(req, res) => {
            const newItem = req.body;
            const result = await inventoryCollection.insertOne(newItem);

            res.send(result);
        });
        
        //  My inventory item inserting to database
        app.post('/myitems', async(req, res) => {
            const myItem = req.body;
            const result = await myInventoryCollection.insertOne(myItem);

            res.send(result);
        });


        //  Get My added Item from database 

        app.get('/myitems', async(req, res) => {
            const email = req.query.email;
            // console.log(email)


            const query = {email: email};
            const cursor = myInventoryCollection.find(query);

            const myItems = await cursor.toArray();

            res.send(myItems);

        })


    }
    finally{

    }

}


run().catch(console.dir);




app.listen(port, () => {
    console.log('CURD server is listenning, ', port);
});