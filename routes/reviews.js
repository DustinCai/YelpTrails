const express = require('express'); 
const router = express.Router({ mergeParams: true });   // mergeParams to merge params between app.js & review routes
const catchAsync = require('../utils/catchAsync'); 
const Trail = require('../models/trail'); 
// const Review = require('../models/review'); 
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');    // middleware
const reviews = require('../controllers/reviews')

// Review routes 

// Create a review 
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Delete a review 
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router; 
