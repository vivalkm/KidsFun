const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');

// create review for a given campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.create));

// delete a given review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.delete));

module.exports = router;