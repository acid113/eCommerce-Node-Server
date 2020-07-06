const User = require('../models/user');
const jwt = require('jsonwebtoken'); // ? to generate token
const expressJwt = require('express-jwt'); // ? for authorization
const {errorHandler} = require('../helpers/dbErrorHandler');
require('dotenv').config();

//! temp since there's an issue with 'post' in postman
const tempUser = {
    name: 'marvs',
    email: 'marvs@abc1.com',
    password: 'test123'
};

const tempUser2 = {
    name: 'marvs2',
    email: 'marvs@abc2.com',
    password: 'test1234'
};

const COOKIE_NAME = 'MyECommerceCookie';

// ? correct email, wrong password
const wrongPassUser = {
    email: 'marvs@abc1.com',
    password: 'test1234'
};

// ? wrong email, correct password
const wrongEmailUser = {
    email: 'marvs@abc2.com',
    password: 'test123'
};

exports.sendGreeting = (req, res) => {
    res.json({
        message: 'greetings from user controller!'
    });
};

exports.signUp = (req, res) => {
    // ? this works because you have body-parser installed in app.js
    console.log('user signup: ', req.body);
    const user = new User(req.body);
    // const user = new User(tempUser); // ! temp
    // const user = new User(tempUser2); // ! temp

    user.save((err, user) => {
        if (err) {
            // ? "user" object is undefined here
            // console.log(`error creating user, duplicate email exists`);

            console.log(errorHandler(err));
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        console.log(`success creating user with email ${user.email}`);
        // user.salt = undefined;
        // user.hashed_password = undefined;
        res.json({user}); // ? no need to use "return" when using GET
    });
};

exports.signIn = (req, res) => {
    console.log('sign in req.body: ', req.body);
    const {email, password} = req.body;

    // ! temp
    // const { email, password } = tempUser;
    // const { email, password } = tempUser2;
    // const { email, password } = wrongPassUser;
    // const { email, password } = wrongEmailUser;

    // * find user based on email
    User.findOne({email}, (err, user) => {
        if (err || !user) {
            console.log('user not found');
            return res.status(404).json({
                error: "User with that email doesn't exist"
            });
        }

        // if user is found, make sure email and password match
        if (!user.authenticateUser(password)) {
            return res.status(401).json({
                error: "Email and Password didn't match"
            });
        }

        const token = jwt.sign({_id: user._id}, process.env.JWT_TOKEN); // ? generate a signed token
        console.log(`token created: ${token}`);

        // ? persist token in cookie with expiry date for 15 min
        res.cookie(COOKIE_NAME, token, {
            expires: new Date(Date.now() + 900000)
            // httpOnly: true,
        });

        const {_id, name, email, role} = user; // ? destructure
        return res.json({token, user: {_id, name, email, role}});
    });
};

exports.signOut = (req, res) => {
    res.clearCookie(COOKIE_NAME);
    console.log('sign out success');
    return res.json({message: 'sign out success'});
};

exports.requireSignIn = expressJwt({
    secret: process.env.JWT_TOKEN,
    userProperty: 'auth'
});

exports.isAuthenticated = (req, res, next) => {
    console.log('authenticating user');
    // ? "auth" property taken from requireSignIn()
    let user = req.profile && req.auth && req.profile._id == req.auth._id;

    if (!user) {
        console.log(`Logged in User ID: ${req.auth._id}`);
        console.log(`UserID being searched: ${req.profile._id}`);
        console.log('access denied, user not authenticated');

        return res.status(403).json({
            error: 'access denied, user not authenticated'
        });
    }
    console.log('user is authenticated');
    next();
};

exports.isAdmin = (req, res, next) => {
    console.log('checking if user has Admin role');

    // * Admin Role = 1
    // ? req.profile came from "controllers/user.js"
    if (req.profile.role !== 1) {
        console.log('user needs to be in Admin role');
        return res.status(403).json({
            error: 'user is not admin'
        });
    }

    console.log('user is in Admin role');
    next();
};
