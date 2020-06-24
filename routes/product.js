const express = require('express');
const router = express.Router();

const {requireSignIn, isAdmin, isAuthenticated} = require('../controllers/auth');
const {findUserById} = require('../controllers/user');
const {findProductById, read, create, remove, update, list, listRelated, listCategories, listBySearch, getPhoto} = require('../controllers/product');

router.get('/product/:productId', read);
router.get('/products', list);
router.get('/products/related/:productId', listRelated);
router.get('/products/categories', listCategories);
router.get('/product/photo/:productId', getPhoto);
router.delete('/product/:productId/:userId', requireSignIn, isAuthenticated, isAdmin, remove);
router.put('/product/:productId/:userId', requireSignIn, isAuthenticated, isAdmin, update);
router.post('/product/create/:userId', requireSignIn, isAuthenticated, isAdmin, create);
router.post('/products/by/search', listBySearch);

router.param('userId', findUserById);
router.param('productId', findProductById);

module.exports = router;
