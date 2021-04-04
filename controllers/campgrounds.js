const Campground = require('../models/campground'); 
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); 
const mapBoxToken = process.env.MAPBOX_TOKEN; 
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

// Show all campgrounds 
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds }); 
}


// Create new campground
module.exports.renderNewForm = (req, res) => {                  // get form 
    res.render('campgrounds/new'); 
}

module.exports.createCampground = async (req, res, next) => {   // pass in validateCampground middleware, if it passes, this callback will run
    const geoData = await geocoder.forwardGeocode({             // from geocoding api for the map 
        query: req.body.campground.location,                    // query the location of our campground
        limit: 1                                                // 1 result
    }).send()                                                   // send the query after calling forwardGeocode 
    
    const campground = new Campground(req.body.campground);     // make a new campground with the id submitted
    campground.geometry = geoData.body.features[0].geometry;    // add on geometry for the map 
    campground.author = req.user._id;                           // add the current logged in user as the author for the new campground
    campground.images = req.files.map(file => ({ url: file.path, filename: file.filename })); // add the image files 
    
    await campground.save();                                    // save to db
    console.log(campground); 
    req.flash('success', 'Successfully made a new campground'); // flashes success message after making a new campground
    res.redirect(`/campgrounds/${campground._id}`);             // then redirect user to that campground
}


// Show a campground 
module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
                                       .populate({ path:'reviews', // populate all the reviews & on each one, populate their author 
                                                   populate: { 
                                                       path:'author'
                                                   } 
                                                 }) 
                                       .populate('author');     // populate to have access to the nested fields of reviews and authors
    if(!campground){                                            // if mongoose couldn't find the campground with that ID
        req.flash('error', 'Cannot find that campground');      // flash error message
        res.redirect('/campgrounds');                           // redirect back to all campgrounds
    }
    res.render('campgrounds/show', { campground }); 
}


// Update a campground 
module.exports.renderEditForm = async (req, res) => {           // get form 
    const { id } = req.params; 
    const campground = await Campground.findById(id);
    if(!campground){                                            // if mongoose couldn't find the campground with that ID
        req.flash('error', 'Cannot find that campground');      
        res.redirect('/campgrounds');                           // redirect back to all campgrounds
    }
    res.render('campgrounds/edit', { campground }); 
}
module.exports.updateCampground = async (req, res) => {         // update
    const { id } = req.params; 
    console.log(req.body); 
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}); 
    const imgs = req.files.map(file => ({ url: file.path, filename: file.filename }));  // update images
    campground.images.push(...imgs);            // push new images if any, don't push an arr onto an arry, just take each data and push each
    
    if(req.body.deleteImages) {                 // delete images if any  
        // delete from cloudinary
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);    // deletes the given filename 
        }
        // delete from campground object, pull from images every filename that is in deleteImages & delete it 
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }

    await campground.save(); 
    req.flash('success', 'Successfully updated campground!'); 
    res.redirect(`/campgrounds/${campground._id}`);
}


// Delete a campground 
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params; 
    await Campground.findByIdAndDelete(id); 
    req.flash('success', 'Successfully deleted campground');    // flash delete message
    res.redirect('/campgrounds'); 
}