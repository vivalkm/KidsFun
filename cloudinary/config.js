// per multer-storage-cloudinary package documentation
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// setting configuration parameters globally
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// storage for a given cloudinary account
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        // folder name where the uploaded asset will be stored
        folder: 'YelpCamp',
        // formats that are allowed for uploading
        allowed_formats: ['jpeg', 'png', 'jpg']
    },
});

module.exports = { cloudinary, storage }