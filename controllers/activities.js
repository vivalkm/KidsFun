const Activity = require('../models/activity');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
const { cloudinary } = require('../cloudinary/config');

// show all activities
module.exports.index = async (req, res, next) => {
    const activities = await Activity.find();
    res.render('activities/index', { activities });
}

// form to create a activity
module.exports.renderNewForm = (req, res) => {
    res.render('activities/new')
}

// create a activity
module.exports.create = async (req, res, next) => {
    const geodata = await geocoder.forwardGeocode({
        query: req.body.activity.location,
        limit: 1
    }).send();

    const newActivity = new Activity(req.body.activity);
    newActivity.author = req.user._id;
    newActivity.geometry = geodata.body.features[0].geometry;
    newActivity.images = req.files.map(img => ({ url: img.path, filename: img.filename }));

    await newActivity.save();
    req.flash('success', 'Successfully made a new activity!');
    res.redirect(`/activities/${newActivity._id}`);
}

// show detail of a given activity
module.exports.show = async (req, res, next) => {
    // populate across multiple levels
    // a activity has an author and multiple reviews, each review has author
    const activity = await Activity.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!activity) {
        req.flash("error", "Activity not found!");
        return res.redirect('/activities');
    }
    res.render('activities/show', { activity });
}

// form to edit a given activity
module.exports.renderEditForm = async (req, res, next) => {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
        req.flash("error", "Activity not found!");
        return res.redirect('/activities');
    }
    res.render('activities/edit', { activity });
}

// edit a given activity
module.exports.edit = async (req, res, next) => {
    if (!req.body) {
        throw new ExpressError("Invalid activity data", 400);
    } else {
        // find the activity
        let activity = await Activity.findById(req.params.id);
        // return to activities if the given activity id does not exsit
        if (!activity) {
            req.flash("error", "Activity not found!");
            return res.redirect('/activities');
        }
        activity = await Activity.findByIdAndUpdate(req.params.id, { ...req.body.activity });
        if (req.body.deleteImgs && req.body.deleteImgs.length > 0) {
            for (let filename of req.body.deleteImgs) {
                await cloudinary.uploader.destroy(filename);
            }
            activity.images = activity.images.filter(img => !req.body.deleteImgs.includes(img.filename));
        }
        const imgs = req.files.map(img => ({ url: img.path, filename: img.filename }));
        activity.images.push(...imgs);
        await activity.save();
        req.flash('success', 'Successfully updated activity!');
        res.redirect(`/activities/${req.params.id}`);
    }
}

// delete a given activity
module.exports.delete = async (req, res, next) => {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
        req.flash("error", "Activity not found!");
        return res.redirect('/activities');
    }
    await Activity.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted a activity!');
    res.redirect(`/activities`);
}