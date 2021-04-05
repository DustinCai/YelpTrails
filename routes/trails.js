const express = require('express'); 
const router = express.Router();
const catchAsync = require('../utils/catchAsync'); 
const { isLoggedIn, isAuthor, validateTrail } = require('../middleware'); 
const trails = require('../controllers/trails'); 

// for image upload
const { storage } = require('../cloudinary');   // node auto looks for an index file
const multer = require('multer'); 
const upload = multer({ storage });             // tell multer to store using 'storage'


router.route('/')                                           // grouping similar routes 
      .get(catchAsync(trails.index))                   
      .post(isLoggedIn, 
            upload.array('image'),                          // upload image(s)
            validateTrail, 
            catchAsync(trails.createTrail));


router.get('/new', isLoggedIn, trails.renderNewForm);  // Create, put this route above /trails/:id or else it will treat new as an id


router.route('/:id')
      .get(catchAsync(trails.showTrail))          // show an individual trail
      .put(isLoggedIn, 
           isAuthor, 
           upload.array('image'), 
           validateTrail, 
           catchAsync(trails.updateTrail))        // update an individual trail
      .delete(isLoggedIn, 
              isAuthor, 
              catchAsync(trails.deleteTrail));    // delete an individual trail


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(trails.renderEditForm)); // update an individual 



module.exports = router; 