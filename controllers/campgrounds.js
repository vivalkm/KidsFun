const Activity = require('../models/activity');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
const { cloudinary } = require('../cloudinary/config');

// show all campgrounds
module.exports.index = async (req, res, next) => {
    const campgrounds = await Activity.find();
    res.render('campgrounds/index', { campgrounds });
}

// form to create a activity
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

// create a activity
module.exports.create = async (req, res, next) => {
    const geodata = await geocoder.forwardGeocode({
        query: req.body.activity.location,
        limit: 1
    }).send();

    const newCamp = new Activity(req.body.activity);
    newCamp.author = req.user._id;
    newCamp.geometry = geodata.body.features[0].geometry;
    newCamp.images = req.files.map(img => ({ url: img.path, filename: img.filename }));

    await newCamp.save();
    req.flash('success', 'Successfully made a new activity!');
    res.redirect(`/campgrounds/${newCamp._id}`);
}

// show detail of a given activity
module.exports.show = async (req, res, next) => {
    // populate across multiple levels
    // a activity has an author and multiple reviews, each review has author
    const camp = await Activity.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!camp) {
        req.flash("error", "Activity not found!");
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { camp });
}

// form to edit a given activity
module.exports.renderEditForm = async (req, res, next) => {
    const camp = await Activity.findById(req.params.id);
    if (!camp) {
        req.flash("error", "Activity not found!");
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { camp });
}

// edit a given activity
module.exports.edit = async (req, res, next) => {
    if (!req.body) {
        throw new ExpressError("Invalid activity data", 400);
    } else {
        // find the camp
        let camp = await Activity.findById(req.params.id);
        // return to campgrounds if the given camp id does not exsit
        if (!camp) {
            req.flash("error", "Activity not found!");
            return res.redirect('/campgrounds');
        }
        camp = await Activity.findByIdAndUpdate(req.params.id, { ...req.body.activity });
        if (req.body.deleteImgs && req.body.deleteImgs.length > 0) {
            for (let filename of req.body.deleteImgs) {
                await cloudinary.uploader.destroy(filename);
            }
            camp.images = camp.images.filter(img => !req.body.deleteImgs.includes(img.filename));
        }
        const imgs = req.files.map(img => ({ url: img.path, filename: img.filename }));
        camp.images.push(...imgs);
        await camp.save();
        req.flash('success', 'Successfully updated activity!');
        res.redirect(`/campgrounds/${req.params.id}`);
    }
}

// delete a given activity
module.exports.delete = async (req, res, next) => {
    const camp = await Activity.findById(req.params.id);
    if (!camp) {
        req.flash("error", "Activity not found!");
        return res.redirect('/campgrounds');
    }
    await Activity.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted a activity!');
    res.redirect(`/campgrounds`);
}