const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const PORT = 3000;
const app = express();
const api = require('./routes/api')

app.use(bodyParser.json())
app.use(cors());
app.use('/api', api)
app.get('/', function(req,res) {
    res.send("hello from server")
})

app.listen(PORT, function(req,res) {
    console.log("Server is running on:" + PORT)
})