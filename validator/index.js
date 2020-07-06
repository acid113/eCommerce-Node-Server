exports.userSignUpValidator = (req, res, next) => {
    console.log('inside validator => userSignUpValidator()');
    console.log('req.body', req.body);

    req.check('name', 'Name is required').notEmpty();
    req.check('email', 'Email must be between 3 to 32 characters')
        .matches(/.+\@.+\..+/)
        .withMessage('Email must contain @ sign')
        .isLength({
            min: 4,
            max: 32
        });
    req.check('password', 'Password is required').notEmpty();
    req.check('password').isLength({min: 6}).withMessage('Password must be at least 6 characters');

    const errors = req.validationErrors();
    if (errors) {
        const firstError = errors.map((error) => error.msg)[0];
        return res.status(400).json({
            error: firstError
        });
    }

    next(); // ? add this so the application will not stop
};

exports.userSignInValidator = (req, res, next) => {
    console.log('inside validator => userSignValidator()');
    console.log('req.body', req.body);

    req.check('email', 'Email is required').notEmpty();
    req.check('password', 'Password is required').notEmpty();

    const errors = req.validationErrors();
    if (errors) {
        const firstError = errors.map((error) => error.msg)[0];
        return res.status(400).json({
            error: firstError
        });
    }

    next();
};
