const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campground = require('../controllers/campgrounds');
const { isLoggedIn, isCampAuthor, validateCampground } = require('../middleware');

const multer = require('multer');
const { storage } = require('../cloudinary/config');
const upload = multer({ storage });

router.route('/')
    // index to show all campgrounds
    .get(catchAsync(campground.index))
    // handles the route for creating a campground
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campground.create));

// form to create a campground
router.get('/new', isLoggedIn, campground.renderNewForm);

router.route('/:id')
    // show detail of a given campground
    .get(catchAsync(campground.show))
    // edit a given campground
    .put(isLoggedIn, isCampAuthor, upload.array('image'), validateCampground, catchAsync(campground.edit))
    // delete a given campground
    .delete(isLoggedIn, isCampAuthor, catchAsync(campground.delete));

// form to edit a given campground
router.get('/:id/edit', isLoggedIn, isCampAuthor, catchAsync(campground.renderEditForm));

module.exports = router;