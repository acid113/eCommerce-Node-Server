const formidable = require('formidable'); // ? a service focused on uploading and encoding images and videos
const lodash = require('lodash'); // ? modern JavaScript utility library delivering modularity, performance & extras
const fs = require('fs'); // ? file system
const Product = require('../models/product');
const {errorHandler} = require('../helpers/dbErrorHandler');

exports.findProductById = (req, res, next, id) => {
    console.log('finding product ID: ', id);
    Product.findById(id).exec((err, product) => {
        if (err || !product) {
            console.log('error finding product');
            // console.log(errorHandler(err));
            return res.status(400).json({
                error: 'product not found'
            });
        }

        console.log('found product ', product.name);
        req.product = product;
        next();
    });
};

exports.read = (req, res) => {
    // * Exclude the photo since it's size may be too big. A separate function to include the photo will be created
    req.product.photo = undefined;
    return res.json(req.product);
};

exports.list = (req, res) => {
    console.log('getting list of products');

    /*
     * sample URLs -> params are CASE-SENSITIVE and should match the whole word
     * http://localhost:8000/api/products
     * http://localhost:8000/api/products?sortBy=name&&orderBy=desc&limit=2
     * http://localhost:8000/api/products?sortBy=price&&orderBy=asc
     */

    // * check if url parameters exists, else use default params
    let orderBy = req.query.orderBy ? req.query.orderBy : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : 'name';
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    Product.find()
        .select('-photo') // ? exclude photo due to size issue of data
        .populate('category') // ? include Category data connected by ObjectId
        .sort([[sortBy, orderBy]]) // ? array within an array?
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                console.log('error getting list of products');
                return res.status(400).json({
                    error: 'error getting list of products'
                });
            }

            console.log('success getting list of products');
            res.json(data);
        });

    // Product.find().exec((err, data) => {
    //   if (err) {
    //     console.log("error getting list of products");
    //     return res.status(400).json({
    //       error: "error getting list of products",
    //     });
    //   }

    //   console.log("success getting list of products");
    //   let tempList = [];
    //   data.forEach((item) => {
    //     item.photo = undefined;
    //     tempList.push(item);
    //   });

    //   res.json(tempList);
    // });
};

exports.listRelated = (req, res) => {
    console.log('getting list of related products');

    let limit = req.query.limit ? parseInt(req.query.limit) : 5;

    // * getting list of other products, so exclude the passed ProductId

    Product.find({
        _id: {$ne: req.product}, // ? "$ne" = not equal in MongoDB
        category: req.product.category // ? get matching product by Category
    })
        .select('-photo') // ? exclude photo due to size issue of data
        .populate('category', 'name') // ? only display "name" but "_id" was included. Date fields were not included
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                console.log('error getting list of related products by category');
                return res.status(400).json({
                    error: 'error getting list of related products by category'
                });
            }

            console.log('success getting list of products related by category');
            res.json(data);
        });
};

exports.listCategories = (req, res) => {
    console.log('getting list of categories used by products');

    // ? this works the same as below
    // Product.distinct('category')
    //     .exec((err, data) => {
    //         .
    //         .
    //         .
    //     });

    Product.distinct('category', {}, (err, categories) => {
        if (err) {
            console.log('error getting list of categories used by product');
            return res.status(400).json({
                error: 'error getting list of categories used by product'
            });
        }

        console.log('success getting list of categories used by product');

        // * only category ids are returned, not the category object
        res.json(categories);
    });
};

exports.listBySearch = (req, res) => {
    // * params added in req.body are CASE-SENSITIVE and should match the whole word
    console.log('list products by search');
    let order = req.body.order ? req.body.order : 'desc';
    let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
    let limit = req.body.limit ? parseInt(req.body.limit) : 20;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    console.log(order, sortBy, limit, skip, req.body.filters);
    console.log('findArgs', findArgs);

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === 'price') {
                // * sample price range input -> [0, 10] with minimum = 0 and maximum = 10

                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0], // ? greater or equal to minimum
                    $lte: req.body.filters[key][1] // ? less than or equal to maximum
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    Product.find(findArgs)
        .select('-photo')
        .populate('category')
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                console.log('error listing products');
                return res.status(400).json({
                    error: 'Products not found'
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

exports.remove = (req, res) => {
    // ? req.product value taken from findProductById()
    console.log('removing product: ', req.product.name);
    let product = req.product;

    product.remove((err, deletedProduct) => {
        if (err) {
            console.log('error deleting product');
            console.log(errorHandler(err));
            return res.status(400).json({
                error: 'product could not be deleted'
            });
        }

        console.log('success deleting product: ', deletedProduct.name);
        return res.json({
            message: 'product deleted',
            product: deletedProduct.name
        });
    });
};

exports.create = (req, res) => {
    console.log('creating new product');
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        console.log('parsing product form data');
        if (err) {
            console.log('error parsing product form data');
            console.log(errorHandler(err));
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }
        // check for all fields
        const {name, description, price, category, quantity, shipping} = fields;

        if (!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        let product = new Product(fields);

        // 1kb = 1000
        // 1mb = 1000000

        if (files.photo) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size'
                });
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }

        console.log('saving product data');
        product.save((err, data) => {
            if (err) {
                console.log('PRODUCT CREATE ERROR ', err);
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            console.log('success creating new product ', data.name);
            res.json(data);
        });
    });
};

exports.update = (req, res) => {
    console.log('updating product');
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        console.log('parsing product form data');
        if (err) {
            console.log('error parsing product form data');
            console.log(errorHandler(err));
            return res.status(400).json({
                error: 'Image could not be updated'
            });
        }
        // check for all fields
        const {name, description, price, category, quantity, shipping} = fields;

        if (!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        let product = req.product;
        product = lodash.extend(product, fields);

        // 1kb = 1000
        // 1mb = 1000000

        if (files.photo) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size'
                });
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }

        console.log('updating product data');
        product.save((err, data) => {
            if (err) {
                console.log('PRODUCT UPDATE ERROR ', err);
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            console.log('success updating new product ', data.name);
            data.photo = undefined;
            res.json(data);
        });
    });
};

exports.getPhoto = (req, res, next) => {
    console.log('getting photo');
    // console.log('req.product.photo.data: ', req.product.photo.data);

    // ? req.product is populated by findProductById() since we passed "productId" param
    if (req.product.photo.data) {
        console.log('Success: photo data exists');
        // * we're returning a photo object to be displayed
        res.set('Content-Type', req.product.photo.contentType);
        return res.send(req.product.photo.data);
    } else {
        console.log('Error: no photo data');
    }

    next();
};
