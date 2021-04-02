const ExpressError = require('./utils/ExpressError'); 
const { campgroundSchema, reviewSchema } = require('./schemas.js'); 
const Campground = require('./models/campground'); 
const Review = require('./models/review'); 

// campground middleware for campground validation on the server side
module.exports.validateCampground = (req, res, next) => {
    // use the schema to validate on req.body on incoming requests (new & edit) by passing this middleware to the routes
    const { error } = campgroundSchema.validate(req.body); 
    if (error) {
        const msg = error.details.map(element => element.message).join(',');    // details is an arr so map over it
        throw new ExpressError(msg, 400);   // if there is an err, throw it
    } else {
        next(); // if there is no error, next
    }
}

// middleware for any route where the user has to be logged in
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){                             // isAuthenticated() method is added to the req obj automatically from passport
        req.session.returnTo = req.originalUrl;             // 'returnTo' will be the url that we want to redirect our user back to     
        req.flash('error', 'You must be signed in first!'); // must be a user to create a campground
        return res.redirect('/login');                      // return redirect otherwise the rest of the code in the route will run
    }
    next();                                                 // else user is authenticated, move on
} 

// middleware to check if the current user is an author of a campground from a request
module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id); 
    if(!campground.author.equals(req.user._id)) {                // if the logged in user is not the author
        req.flash('error', 'You do not have permission to do that!'); 
        return res.redirect(`/campgrounds/${id}`);              // redirect back to the campground
    }
    next(); 
}


// review middleware 
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body); 
    if (error) {
        const msg = error.details.map(element => element.message).join(',');    // details is an arr so map over it
        throw new ExpressError(msg, 400);   // if there is an err, throw it
    } else {
        next(); // if there is no error, next
    }
}

// review middleware to check if the current user is an author of a review
module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId); 
    if(!review.author.equals(req.user._id)) {                           // if the logged in user is not the author
        req.flash('error', 'You do not have permission to do that!'); 
        return res.redirect(`/campgrounds/${id}`);                      // redirect back to the campground
    }
    next(); 
}

