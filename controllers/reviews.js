const Campground = require('../models/campground');
const Review = require('../models/review');

// create review for a given campground
module.exports.create = async (req, res, next) => {
    if (!req.body) {
        throw new ExpressError("Invalid review data", 400);
    } else {
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        review.author = req.user._id;
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        req.flash('success', 'Successfully made a review!');
        res.redirect(`/campgrounds/${req.params.id}`);
    }
}

// delete a given review
module.exports.delete = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    campground.save();
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/campgrounds/${id}`);
}