const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// define schema
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

// export the model
module.exports = mongoose.model('Review', reviewSchema);