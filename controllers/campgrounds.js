const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
const { cloudinary } = require('../cloudinary/config');

// show all campgrounds
module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds });
}

// form to create a campground
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

// create a campground
module.exports.create = async (req, res, next) => {
    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    const newCamp = new Campground(req.body.campground);
    newCamp.author = req.user._id;
    newCamp.geometry = geodata.body.features[0].geometry;
    newCamp.images = req.files.map(img => ({ url: img.path, filename: img.filename }));

    await newCamp.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCamp._id}`);
}

// show detail of a given campground
module.exports.show = async (req, res, next) => {
    // populate across multiple levels
    // a campground has an author and multiple reviews, each review has author
    const camp = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!camp) {
        req.flash("error", "Campground not found!");
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { camp });
}

// form to edit a given campground
module.exports.renderEditForm = async (req, res, next) => {
    const camp = await Campground.findById(req.params.id);
    if (!camp) {
        req.flash("error", "Campground not found!");
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { camp });
}

// edit a given campground
module.exports.edit = async (req, res, next) => {
    if (!req.body) {
        throw new ExpressError("Invalid campground data", 400);
    } else {
        // find the camp
        let camp = await Campground.findById(req.params.id);
        // return to campgrounds if the given camp id does not exsit
        if (!camp) {
            req.flash("error", "Campground not found!");
            return res.redirect('/campgrounds');
        }
        camp = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
        if (req.body.deleteImgs && req.body.deleteImgs.length > 0) {
            for (let filename of req.body.deleteImgs) {
                await cloudinary.uploader.destroy(filename);
            }
            camp.images = camp.images.filter(img => !req.body.deleteImgs.includes(img.filename));
        }
        const imgs = req.files.map(img => ({ url: img.path, filename: img.filename }));
        camp.images.push(...imgs);
        await camp.save();
        req.flash('success', 'Successfully updated campground!');
        res.redirect(`/campgrounds/${req.params.id}`);
    }
}

// delete a given campground
module.exports.delete = async (req, res, next) => {
    const camp = await Campground.findById(req.params.id);
    if (!camp) {
        req.flash("error", "Campground not found!");
        return res.redirect('/campgrounds');
    }
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted a campground!');
    res.redirect(`/campgrounds`);
}