const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

// used to include virtuals when convert to JSON
const opts = { toJSON: { virtuals: true } };

// define schema
const campgroundSchema = new Schema({
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

campgroundSchema.virtual('properties.popupText')
    .get(function () {
        return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
        <br>
        <span class="text-muted">${this.location}</span>`;
    })

// define campground deletion middleware
campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
})

// export the model
module.exports = mongoose.model('Campground', campgroundSchema);