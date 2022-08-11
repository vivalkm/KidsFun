const User = require('../models/user');

// form to register
module.exports.renderRegisterFrom = (req, res) => {
    res.render('users/register');
}

// register a user
module.exports.register = async (req, res, next) => {
    try {
        // get user inputs
        const { username, password, email } = req.body;
        // create a new User instance
        const user = new User({ email, username });
        // register the user with password, which is enabled by passport plugin
        const registeredUser = await User.register(user, password);
        // login the user after register
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to kidsfun');
            res.redirect('./activities');
        })
    } catch (e) {
        // rather than showing the error page, redirect to register and shows the error msg as flash
        req.flash('error', e.message);
        res.redirect('./register');
    }
}

// form to login
module.exports.renderLoginFrom = (req, res) => {
    res.render('users/login');
}

// login
module.exports.login = async (req, res, next) => {
    req.flash('success', 'Welcome back to kidsfun');
    // get the url that triggers login if exists, this is what we stored in session via isLoggedIn middleware
    const redirectUrl = req.session.returnTo || './activities';
    // remove the url from session
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

// logout
module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You have successfully logged out');
    res.redirect('./activities');
}