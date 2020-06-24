const User = require('../models/user');

exports.findUserById = (req, res, next, id) => {
    console.log(`finding user id: ${id}`);
    User.findById(id).exec((err, user) => {
        if (err || !user) {
            console.log('user not found');
            return res.status(400).json({
                error: 'user not found'
            });
        }

        console.log('user found: ', user.name);
        req.profile = user;
        next();
    });
};

exports.read = (req, res) => {
    console.log('getting user profile');

    // * make sure we're not exposing sensitive information
    // ? "req.profile" data is already populated from findUserById()
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;

    return res.json(req.profile);
};

exports.update = (req, res) => {
    console.log('user body: ', req.body);

    // ! findOneAndUpdate() without 'useFindAndModify' option set to false are deprecated
    User.findOneAndUpdate({_id: req.profile._id}, {$set: req.body}, {new: true}, (err, user) => {
        if (err) {
            console.log('error updating user profile');
            return res.status(400).json({
                error: 'error updating user profile'
            });
        }

        user.hashed_password = undefined;
        user.salt = undefined;
        res.json(user);
    });
};
