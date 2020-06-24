const express = require('express');
const router = express.Router();

const {userSignUpValidator} = require('../validator/index');
const {sendGreeting, signUp, signIn, signOut, requireSignIn} = require('../controllers/auth');

// router.get("/", (req, res) => {
//   res.send("hello from ecommerce router/user.js node");
// });

// * calls sendGreeting() from controller
router.get('/user/sendgreeting', sendGreeting);
// router.post("/user/signup", userSignUpValidator, signUp); // ? added validation before signUp() is called
router.post('/auth/signup', signUp); // ! temp due to POST issue with Postman
router.post('/auth/signin', signIn);
router.post('/auth/signout', signOut);

router.get('/auth/test', requireSignIn, (req, res) => {
    res.send('auth test route');
});

module.exports = router;
