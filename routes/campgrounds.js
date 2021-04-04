const express = require('express'); 
const router = express.Router();
const catchAsync = require('../utils/catchAsync'); 
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware'); 
const campgrounds = require('../controllers/campgrounds'); 

// for image upload
const { storage } = require('../cloudinary');   // node auto looks for an index file
const multer = require('multer'); 
const upload = multer({ storage });       // tell multer to store using 'storage'


router.route('/')                                           // grouping similar routes 
      .get(catchAsync(campgrounds.index))                   
      .post(isLoggedIn, 
            upload.array('image'),                          // upload image(s)
            validateCampground, 
            catchAsync(campgrounds.createCampground));


router.get('/new', isLoggedIn, campgrounds.renderNewForm);  // Create, put this route above /campgrounds/:id or else it will treat new as an id


router.route('/:id')
      .get(catchAsync(campgrounds.showCampground))          // show an individual campground
      .put(isLoggedIn, 
           isAuthor, 
           upload.array('image'), 
           validateCampground, 
           catchAsync(campgrounds.updateCampground))        // update an individual campground
      .delete(isLoggedIn, 
              isAuthor, 
              catchAsync(campgrounds.deleteCampground));    // delete an individual campground


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm)); // update an individual 



module.exports = router; 