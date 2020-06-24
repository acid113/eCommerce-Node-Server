const mongoose = require('mongoose');

const schemaDefinition = {
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    }
};

const categorySchema = new mongoose.Schema(schemaDefinition, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
