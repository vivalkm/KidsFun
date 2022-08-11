const Activity = require('../models/activity');
const Review = require('../models/review');

// create review for a given activity
module.exports.create = async (req, res, next) => {
    if (!req.body) {
        throw new ExpressError("Invalid review data", 400);
    } else {
        const activity = await Activity.findById(req.params.id);
        const review = new Review(req.body.review);
        review.author = req.user._id;
        activity.reviews.push(review);
        await review.save();
        await activity.save();
        req.flash('success', 'Successfully made a review!');
        res.redirect(`/activities/${req.params.id}`);
    }
}

// delete a given review
module.exports.delete = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    const activity = await Activity.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    activity.save();
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/activities/${id}`);
}