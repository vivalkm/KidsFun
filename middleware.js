const Activity = require('./models/activity');
const Review = require('./models/review');
const { activitySchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');

// check if user is logged in
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // use session to store the url that triggers login
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first.');
        return res.redirect('/login');
    }
    next();
}

// check if user is author of camp
const isCampAuthor = async (req, res, next) => {
    const camp = await Activity.findById(req.params.id);
    if (!req.user || !camp.author.equals(req.user._id)) {
        // prohibit editing/deleting if user is not the camp's author
        req.flash("error", "You are not authorized to modify this activity!");
        res.redirect(`/campgrounds/${req.params.id}`);
    } else {
        next();
    }
}

// check if user is author of review
const isReviewAuthor = async (req, res, next) => {
    const review = await Review.findById(req.params.reviewId);
    if (!req.user || !review.author.equals(req.user._id)) {
        // prohibit editing/deleting if user is not the review's author
        req.flash("error", "You are not authorized to modify this review!");
        res.redirect(`/campgrounds/${req.params.id}`);
    } else {
        next();
    }
}

// define a middleware function to validate activity form data on server-side
function validateCampground(req, res, next) {
    // The value is validated against the defined joi schema
    const { error } = activitySchema.validate(req.body);

    // throws error if there is error
    if (error) {
        // Joi returns an array of error details, each contains a message
        const message = error.details.map(ele => ele.message).join(',');
        // this will be handled by error handler
        throw new ExpressError(message, 400);
    } else {
        // if no error, then pass control to next middleware/route handler callback
        next();
    }
};

// define a middleware function to validate review form data on server-side
function validateReview(req, res, next) {
    // The value is validated against the defined joi schema
    const { error } = reviewSchema.validate(req.body);

    // throws error if there is error
    if (error) {
        // Joi returns an array of error details, each contains a message
        const message = error.details.map(ele => ele.message).join(',');
        // this will be handled by error handler
        throw new ExpressError(message, 400);
    } else {
        // if no error, then pass control to next middleware/route handler callback
        next();
    }
};

module.exports = { isLoggedIn, isCampAuthor, isReviewAuthor, validateCampground, validateReview };