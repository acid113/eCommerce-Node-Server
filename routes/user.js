const express = require('express');
const router = express.Router();

const {findUserById, read, update} = require('../controllers/user');
const {requireSignIn, isAdmin, isAuthenticated} = require('../controllers/auth');

// * requireSignIn = checks if JWT token is provided
// * isAuthenticated = logged in user can only access his user profile, generated JWT token should be from correct user
// * isAdmin = check if logged in user has user role = 1
router.get('/user/test/:userId', requireSignIn, isAuthenticated, isAdmin, (req, res) => {
    console.log('req.profile: ', req.profile);
    res.json({
        user: req.profile
    });
});

router.get('/user/:userId', requireSignIn, isAuthenticated, read);
router.put('/user/:userId', requireSignIn, isAuthenticated, update);

router.param('userId', findUserById); // ? whenever "userId" param value is found, run findUserById()

module.exports = router;
