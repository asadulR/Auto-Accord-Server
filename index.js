const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
require('dotenv').config();
const port = process.env.PORT || 4000;


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Auto Accord server is running in heroku');
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f3est.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect();

        const inventoryCollection = client.db('AutoAccord').collection('InventoryItems');
        const myInventoryCollection = client.db('AutoAccord').collection('MyInventoryItems');

        //  Generating tocken from user login
        app.post('/login', (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.TOEKEN_SECRET);
            // console.log(token);
            res.send({ token })
        })

        //  load inventory items from database
        app.get('/items', async (req, res) => {
            const query = {};

            const cursor = inventoryCollection.find(query);
            const items = await cursor.toArray();

            res.send(items);
        });

        //  Load single Inventory item to update
        app.get("/items/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const item = await inventoryCollection.findOne(query);

            res.send(item);
        });

        //  updating inventory item by PUT API
        app.put("/items/:id", async (req, res) => {
            const id = req.params.id;
            const updateItem = req.body;
            const filter = { _id: ObjectId(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    quantity: updateItem.quantity
                },
            }

            const result = await inventoryCollection.updateOne(filter, updateDoc, options);

            res.send(result);
        });

        //  Inserting new item to database is protected by JWT ....  Ony Accessed email can insert an item to the database
        //  POST API for recieving inventory items from client side

        app.post('/items', async (req, res) => {
            const newItem = req.body;
            const tokenInfo = req.headers.authoraization;
            const [email, accessToken] = tokenInfo?.split(" ");

            const decoded = verifyToken(accessToken);
            // console.log(decoded);
            if (email === decoded.email) {
                const result = await inventoryCollection.insertOne(newItem);

                res.send(result);
            }else{
                res.send({success: 'UnAuthoraized access'});
            }
        });



        //  My inventory item inserting to database
        app.post('/myitems', async (req, res) => {
            const myItem = req.body;
            const tokenInfo = req.headers.authoraization;
            const [email, accessToken] = tokenInfo?.split(" ");

            const decoded = verifyToken(accessToken);
            // console.log(decoded);

            if (email === decoded.email) {
                const result = await myInventoryCollection.insertOne(myItem);

                res.send(result);
            }else{
                res.send({success: 'UnAuthoraized access'});
            }
        });


        //  Get My added Item from database 

        app.get('/myitems', async (req, res) => {
            const email = req.query.email;
            // console.log(email)

            const query = { email: email };
            const cursor = myInventoryCollection.find(query);

            const myItems = await cursor.toArray();

            res.send(myItems);

        })

        //  deleting myAdded item from MyaddedCollection database
        app.delete('/myitems/:code', async (req, res) => {
            const code = req.params.code;
            const query = { code: code };
            const result = await (myInventoryCollection.deleteOne(query));
            res.send(result);
        })

        // deleting item from inventory items collection

        app.delete('/items/:code', async (req, res) => {
            const code = req.params.code;
            const query = { code: code };
            const result = await (inventoryCollection.deleteOne(query));
            res.send(result);
        })







    }
    finally {

    }

}


run().catch(console.dir);




app.listen(port, () => {
    console.log('CURD server is listenning, ', port);
});




//  JWT verifing tocken function
function verifyToken (token){
    let email;
    jwt.verify( token, process.env.TOEKEN_SECRET, function(err, decoded) {
        if(err){
            email = 'Invalid email'
        }
        if(decoded){
            email = decoded
            console.log(decoded);
        }
    });

    return email;
}