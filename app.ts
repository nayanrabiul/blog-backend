import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import compression from 'compression';
import morgan from 'morgan';
import fileUpload from 'express-fileupload';


const app = express();
dotenv.config();
const PORT = process.env.PORT || 5900;

const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    },
});

import { decodeToken } from './helper/auth.healper';
import apiRouters from './routes/api';

// database connection
mongoose
    .connect(process.env.DATABASE_URL)
    .then((response) => {
        console.log('MongoDB Connected Successfully.');
    })
    .catch((err) => {
        console.log('Database connection failed.');
    });

// morgan routes view
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('tiny'));
    console.log('Morgan connected..');
}

// middleware
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); //* will allow from all cross domain
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.locals.socket = io;
    next();
});
app.use(cors());

app.use(decodeToken);
app.use('/api', apiRouters);

// server welcome message
app.use('/', (req, res, next) => {
    return res.status(200).json({
        status: true,
        message: 'Welcome to Article-site',
    });
});

//file upload
app.use(fileUpload({
    debug: true,
}));


// server listening
http.listen(PORT, () => console.log(`Port is listening ${PORT}`));
