const express = require('express');
const app = express();
const route = require('./routes/route');
const cors = require("cors");
var cron = require("node-cron");
const mongoose = require('mongoose');
const router = require('./routes/route');
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use('/api/v1', route);


mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true })
    .then(() => {
        console.log("MongoDB connected")

    })
    .catch((err) => console.log(err));

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Express App running on ${port}`);
});