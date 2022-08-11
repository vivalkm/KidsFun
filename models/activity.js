const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

// used to include virtuals when convert to JSON
const opts = { toJSON: { virtuals: true } };

// define schema
const activitySchema = new Schema({
    title: String,
    images: [
        {
            filename: String,
            url: String
        }
    ],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

activitySchema.virtual('properties.popupText')
    .get(function () {
        return `<strong><a href="/activities/${this._id}">${this.title}</a></strong>
        <br>
        <span class="text-muted">${this.location}</span>`;
    })

// define activity deletion middleware
activitySchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
})

// export the model
module.exports = mongoose.model('Activity', activitySchema);