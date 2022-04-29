const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 4000;


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Auto Accord server');
});























app.listen(port, () => {
    console.log('CURD server is listenning');
});