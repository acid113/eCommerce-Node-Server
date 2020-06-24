const mongoose = require('mongoose');
const crypto = require('crypto');
const {v1: uuidv1} = require('uuid');

const schemaDefinition = {
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    hashed_password: {
        type: String,
        required: true
    },
    about: {
        type: String,
        trim: true
    },
    salt: String,
    role: {
        type: Number,
        default: 0
    },
    history: {
        type: Array,
        default: []
    }
};

const userSchema = new mongoose.Schema(schemaDefinition, {timestamps: true});

// * virtual fields
userSchema
    .virtual('password')
    .set(function (password) {
        console.log('inside set virtual');
        this._password = password;
        this.salt = uuidv1();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });

userSchema.methods = {
    authenticateUser: function (password) {
        console.log(`password used: ${password}`);
        console.log(`current hashed password: ${this.hashed_password}`);
        const isPasswordMatch = this.encryptPassword(password) === this.hashed_password;
        console.log(`Is password match: ${isPasswordMatch}`);
        return isPasswordMatch;
    },

    encryptPassword: function (password) {
        console.log('encrypting password');
        if (!password) {
            console.log('password not included');
            return '';
        }
        try {
            return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
        } catch (err) {
            console.error('error hashing password');
            return '';
        }
    }
};

module.exports = mongoose.model('User', userSchema);
