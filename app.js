const express = require('express');
// create a new app
const app = express();

// the former is the connection string configured in production env (e.g. on Heroku or .env file), the later is local db
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/kidsfun'

// import and configure dotenv for development mode
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
    // development db
} else {
    // trust first proxy
    app.set('trust proxy', 1);
}

const path = require('path');
const ExpressError = require('./utils/ExpressError');
const activityRoutes = require('./routes/activities');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const User = require('./models/user');

const mongoose = require('mongoose');
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("Dababase connected"));

// set Express views location
app.set('views', path.join(__dirname, 'views'));

// set view engine to use ejs
app.set('view engine', 'ejs');

// Registers the given template engine 'ejsMate' for 'ejs' files. 
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);

// middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// middleware to override POST method
const methodOverride = require("method-override");
app.use(methodOverride('_method'));

// set static file folder to root/public
app.use(express.static(path.join(__dirname, 'public')));

// To remove data using these defaults:
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

// use helmet security package but customize the contentSecurityPolicy and crossOriginEmbedderPolicy middleware
const scriptSrcUrls = [
    "https://api.mapbox.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/vivalkm/"
];
const styleSrcUrls = [
    "https://api.mapbox.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/vivalkm/"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/vivalkm/"
];
const fontSrcUrls = [];

const helmet = require('helmet');
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: [],
                connectSrc: ["'self'", ...connectSrcUrls],
                scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
                styleSrc: ["'unsafe-inline'", "'self'", ...styleSrcUrls],
                workerSrc: ["'self'", "blob:"],
                objectSrc: [],
                imgSrc: [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/vivalkm/",
                    "https://images.unsplash.com/"
                ],
                fontSrc: ["'self'", ...fontSrcUrls],
                mediaSrc: ["https://res.cloudinary.com/vivalkm/"],
                childSrc: ["blob:"]
            }
        },
        crossOriginEmbedderPolicy: false
    })
);

// use MongoDB session store
const MongoStore = require('connect-mongo');
const store = new MongoStore({
    mongoUrl: dbUrl,
    secret: process.env.SECRET || 'thisisasecret',
    // update session only one time in a period of 24 hours if there is no change in session
    touchAfter: 24 * 60 * 60
});
store.on('error', (e) => console.log("Session store error:", e));

// session config
const sessionConfig = {
    // change the default name to something else
    name: 'status',
    secret: process.env.SECRET || 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        // JavaScript will not be able to read this authentication cookie in case of XSS exploitation
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: store
}

// use secure cookies in production, but allowing for testing in development
if (process.env.NODE_ENV !== "production") {
    // serve secure cookies, the cookie will only be sent over HTTPS, which is HTTP over SSL/TLS
    sessionConfig.cookie.secure = true;
}

// make sure to use session() before passport.session() to ensure that the login session is restored in the correct order
const session = require('express-session');
app.use(session(sessionConfig));

// configure passport
const passport = require('passport');
const LocalStrategy = require('passport-local');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware to handle flash and login status
const flash = require('connect-flash');
app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use('/activities', activityRoutes);
app.use('/activities/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('home');
});


// add 404 route handler after all other routes
app.all('*', (req, res, next) => {
    // pass the customized error object to error handler
    next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
    // get statusCode with `500` as default
    const { statusCode = 500 } = err;
    // set default error message if err contains no message
    if (!err.message) err.message = "Oh no, something went wrong!";


    if (process.env.NODE_ENV === 'production') {
        err.stack = '';
    }

    // render the error view
    res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})