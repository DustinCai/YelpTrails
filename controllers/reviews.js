const Campground = require('../models/campground'); 
const Review = require('../models/review'); 


module.exports.createReview = async (req, res) => {                 // creating and linking a review 
    const campground = await Campground.findById(req.params.id);    // find the campground associated with the review
    const review = new Review(req.body.review);                     // create a review obj, review has body & rating
    review.author = req.user._id;                                   // set the review author to the current logged in user
    campground.reviews.push(review);                                // push new review
    await review.save(); 
    await campground.save(); 
    req.flash('success', 'Created new review');         // flash success message
    res.redirect(`/campgrounds/${campground._id}`);
}


// need both campground & review id because we want to remove the review and
// also remove the reference to the review from the campground
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params; 
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId} }); // pull where all reviews match reviewId, from reviews array, & then remove the references
    await Review.findByIdAndDelete(reviewId);                               // delete the actual review
    req.flash('success', 'Successfully deleted review');                    // flash success review deletion
    res.redirect(`/campgrounds/${id}`);                                     // redirect back to the campground page
}