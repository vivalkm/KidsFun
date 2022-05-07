const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("Dababase connected"));

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});


    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const randomPrice = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: { "type": "Point", "coordinates": [cities[random1000].longitude, cities[random1000].latitude] },
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero, itaque delectus aliquam perspiciatis possimus fugiat fugit rem illo earum praesentium expedita sit nesciunt obcaecati quasi quod laborum, necessitatibus voluptatibus unde.',
            price: randomPrice,
            author: '62721faaa32108a1d67fa4fa',
            images: [
                {
                    filename: 'YelpCamp/scott-goodwill-y8Ngwq34_Ak-unsplash_m4kwp9',
                    url: 'https://res.cloudinary.com/vivalkm/image/upload/v1651732273/YelpCamp/scott-goodwill-y8Ngwq34_Ak-unsplash_m4kwp9.jpg',
                },
                {
                    filename: 'YelpCamp/tegan-mierle-fDostElVhN8-unsplash_jagnpm',
                    url: 'https://res.cloudinary.com/vivalkm/image/upload/v1651732273/YelpCamp/tegan-mierle-fDostElVhN8-unsplash_jagnpm.jpg',
                },
                {
                    filename: 'YelpCamp/pars-sahin-V7uP-XzqX18-unsplash_rwpsa3',
                    url: 'https://res.cloudinary.com/vivalkm/image/upload/v1651732273/YelpCamp/pars-sahin-V7uP-XzqX18-unsplash_rwpsa3.jpg',
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});