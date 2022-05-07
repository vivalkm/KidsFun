const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

// register
router.route('/register')
    .get(users.renderRegisterFrom)
    .post(catchAsync(users.register));

// login
router.route('/login')
    .get(users.renderLoginFrom)
    .post(
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        catchAsync(users.login)
    );

// logout
router.get('/logout', users.logout);

module.exports = router;