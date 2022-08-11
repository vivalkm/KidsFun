const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const activity = require('../controllers/activities');
const { isLoggedIn, isActivityAuthor, validateActivity } = require('../middleware');

const multer = require('multer');
const { storage } = require('../cloudinary/config');
const upload = multer({ storage });

router.route('/')
    // index to show all activities
    .get(catchAsync(activity.index))
    // handles the route for creating a activity
    .post(isLoggedIn, upload.array('image'), validateActivity, catchAsync(activity.create));

// form to create a activity
router.get('/new', isLoggedIn, activity.renderNewForm);

router.route('/:id')
    // show detail of a given activity
    .get(catchAsync(activity.show))
    // edit a given activity
    .put(isLoggedIn, isActivityAuthor, upload.array('image'), validateActivity, catchAsync(activity.edit))
    // delete a given activity
    .delete(isLoggedIn, isActivityAuthor, catchAsync(activity.delete));

// form to edit a given activity
router.get('/:id/edit', isLoggedIn, isActivityAuthor, catchAsync(activity.renderEditForm));

module.exports = router;