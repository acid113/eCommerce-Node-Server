const express = require('express');
const router = express.Router();

const {requireSignIn, isAdmin, isAuthenticated} = require('../controllers/auth');
const {findUserById} = require('../controllers/user');
const {findCategoryById, read, create, remove, update, list} = require('../controllers/category');

router.get('/category/:categoryId', read);
router.get('/categories', list);
router.delete('/category/:categoryId/:userId', requireSignIn, isAuthenticated, isAdmin, remove);
router.put('/category/:categoryId/:userId', requireSignIn, isAuthenticated, isAdmin, update);
router.post('/category/create/:userId', requireSignIn, isAuthenticated, isAdmin, create);

// ? whenever "userId" param value is found, run findUserById() so we can get user's Role
router.param('userId', findUserById);
router.param('categoryId', findCategoryById);

module.exports = router;
