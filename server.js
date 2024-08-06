const express = require('express');
const db = require('./db.js');
require('dotenv').config();
const server = express();

const bodyParser = require('body-parser');
server.use(bodyParser.json());

// importing routes
const userRoutes = require('./routes/userRoutes.js');
const candidateRoutes = require('./routes/candidateRoutes.js');

// using routes
server.use('/user' , userRoutes);
server.use('/candidate' , candidateRoutes);

const PORT = process.env.PORT;
server.listen(PORT , (error)=>{
    if(error) console.error();
    else{
        console.log(`Listening to port ${PORT}...`);
    }
}) 