const express = require('express');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const morgan = require('morgan'); // ? HTTP request logger middleware for node.js
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// * import a custom router for better organization
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');

// * Environment variables - allows us to read .env file, if it exists
require('dotenv').config();

// * App - setup Express
const app = express();

// * Database - setup MongoDB Atlass connection via Mongoose
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => {
        console.log('MongoDB Atlas connection success!');
    });

mongoose.connection.on('error', (err) => {
    console.log(`MongoDB Atlas connection error: ${err.message}`);
});

// * Middleware
app.use(morgan('dev')); // ? Concise output colored by response status for development use
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator()); // ! fails if express validator is not v.5.3.1
app.use(cors());

// * Routing - when opening http://localhost:8000/ in server, this will run
// app.use(userRoutes);
app.use('/api', authRoutes); // ? adding prefix '/user' to set how http://localhost:8000/api will be routed and handled
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);

// * read 'PORT' value from .env file, if missing set to 8001
const port = process.env.PORT || 8001;
app.listen(port, () => {
    console.log(`this server is running on ${port}`);
});
