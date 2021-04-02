const express = require('express'); 
const router = express.Router(); 
const catchAsync = require('../utils/catchAsync'); 
const passport = require('passport'); 
const users = require('../controllers/users');


// Create User
router.route('/register')
      .get(users.renderRegister)
      .post(catchAsync(users.register)); 


// User Login
router.route('/login')
      .get(users.renderLogin)
      .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);


// User Logout
router.get('/logout', users.logout); 


module.exports = router; 