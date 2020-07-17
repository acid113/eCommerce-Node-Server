const express = require('express');
const router = express.Router();

const {userSignUpValidator, userSignInValidator: userSignValidator} = require('../validator/index');
const {sendGreeting, signUp, signIn, signOut, requireSignIn} = require('../controllers/auth');

// router.get("/", (req, res) => {
//   res.send("hello from ecommerce router/user.js node");
// });

// * test API that requires user to sign in
router.get('/auth/test', requireSignIn, (req, res) => {
    res.send('auth test route');
});

// * calls sendGreeting() from controller
router.get('/user/sendgreeting', sendGreeting);

// ? added validation before signUp() is called
router.post('/auth/signup', userSignUpValidator, signUp);
router.post('/auth/signin', userSignValidator, signIn);

router.post('/auth/signout', signOut);

module.exports = router;
