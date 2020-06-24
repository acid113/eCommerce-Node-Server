const Category = require('../models/category');
const {errorHandler} = require('../helpers/dbErrorHandler');

exports.findCategoryById = (req, res, next, id) => {
    console.log('finding category ID: ', id);
    Category.findById(id).exec((err, category) => {
        if (err || !category) {
            console.log('error finding category');
            // console.log(errorHandler(err));
            return res.status(400).json({
                error: 'category not found'
            });
        }

        console.log('found category:', category.name);
        req.category = category;
        next();
    });
};

exports.read = (req, res) => {
    return res.json(req.category);
};

exports.list = (req, res) => {
    console.log('getting list categories');
    Category.find().exec((err, data) => {
        if (err) {
            console.log('error finding categories');
            return res.status(400).json({
                error: 'error getting categories'
            });
        }

        console.log('success getting list of categories');
        res.json(data);
    });
};

exports.remove = (req, res) => {
    console.log('removing category: ', req.category.name);
    const category = req.category;

    category.remove((err, deletedCategory) => {
        if (err) {
            console.log('error deleting category');
            // console.log(errorHandler(err));
            return res.status(400).json({
                error: 'category could not be deleted'
            });
        }

        console.log('success deleting category: ', deletedCategory.name);
        return res.json({
            message: 'category deleted',
            category: deletedCategory.name
        });
    });
};

exports.create = (req, res) => {
    console.log('Category req.body: ', req.body);
    const category = new Category(req.body);
    console.log('creating new category');

    category.save((err, data) => {
        if (err) {
            // console.log(errorHandler(err));
            console.log('error creating category');
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        console.log(`success creating category: ${data.name}`);
        res.json({data});
    });
};

exports.update = (req, res) => {
    console.log('Category req.body: ', req.body);
    console.log('category update param', req.params.categoryId);
    let category = req.category;
    category.name = req.body.name;

    console.log('updating new category');
    category.save((err, data) => {
        if (err) {
            // console.log(errorHandler(err));
            console.log('error updating category');
            return res.status(400).json({
                error: 'error updating category'
            });
        }

        console.log(`success updating category: ${data.name}`);
        res.json({data});
    });
};
