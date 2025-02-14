const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const app = express();
const userRoutes = require('./router');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

app.use(cors());
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.use('/api', userRoutes);


// Dead End Request!
app.use((req, res, next) => {
    return res.status(404).json({
        error: "Not Found",
    });
});


module.exports.handler = serverless(app);
