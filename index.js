const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
require('dotenv').config();
const port = process.env.PORT || 4000;


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Auto Accord server');
});

//     AutoAccord
//    65TvtWdj2UfVbdov


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f3est.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run(){
    try{
        await client.connect();

        const expertsCollection = client.db('AutoAccord').collection('experts');

        //  load experts from database
        app.get('/experts', async(req, res) => {
            const query = {};

            const cursor = expertsCollection.find(query);
            const experts = await cursor.toArray();

            res.send(experts);
        });
    }
    finally{

    }

}


run().catch(console.dir);










app.listen(port, () => {
    console.log('CURD server is listenning, ', port);
});