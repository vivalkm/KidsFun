const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const activity = require('../controllers/campgrounds');
const { isLoggedIn, isCampAuthor, validateCampground } = require('../middleware');

const multer = require('multer');
const { storage } = require('../cloudinary/config');
const upload = multer({ storage });

router.route('/')
    // index to show all campgrounds
    .get(catchAsync(activity.index))
    // handles the route for creating a activity
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(activity.create));

// form to create a activity
router.get('/new', isLoggedIn, activity.renderNewForm);

router.route('/:id')
    // show detail of a given activity
    .get(catchAsync(activity.show))
    // edit a given activity
    .put(isLoggedIn, isCampAuthor, upload.array('image'), validateCampground, catchAsync(activity.edit))
    // delete a given activity
    .delete(isLoggedIn, isCampAuthor, catchAsync(activity.delete));

// form to edit a given activity
router.get('/:id/edit', isLoggedIn, isCampAuthor, catchAsync(activity.renderEditForm));

module.exports = router;