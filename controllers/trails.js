const Trail = require('../models/trail'); 
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); 
const mapBoxToken = process.env.MAPBOX_TOKEN; 
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


// Show all trails 
module.exports.index = async (req, res) => {
    const trails = await Trail.find({});
    res.render('trails/index', { trails }); 
}


// Create new trail
module.exports.renderNewForm = (req, res) => {                  // get form 
    res.render('trails/new'); 
}

module.exports.createTrail = async (req, res, next) => {        // pass in validateTrail middleware, if it passes, this callback will run
    const geoData = await geocoder.forwardGeocode({             // from geocoding api for the map 
        query: req.body.trail.location,                         // query the location of our trail
        limit: 1                                                // 1 result
    }).send()                                                   // send the query after calling forwardGeocode 
    
    const trail = new Trail(req.body.trail);                    // make a new trail with the id submitted
    trail.geometry = geoData.body.features[0].geometry;         // add on geometry for the map 
    trail.author = req.user._id;                                // add the current logged in user as the author for the new trail
    trail.images = req.files.map(file => ({ url: file.path, filename: file.filename })); // add the image files 
    
    await trail.save();                                         // save to db
    console.log(trail); 
    req.flash('success', 'Successfully made a new trail');      // flashes success message after making a new trail
    res.redirect(`/trails/${trail._id}`);                       // then redirect user to that trail
}


// Show a trail 
module.exports.showTrail = async (req, res) => {
    const trail = await Trail.findById(req.params.id)
                                       .populate({ path:'reviews', // populate all the reviews & on each one, populate their author 
                                                   populate: { 
                                                       path:'author'
                                                   } 
                                                 }) 
                                       .populate('author');     // populate to have access to the nested fields of reviews and authors
    if(!trail){                                                 // if mongoose couldn't find the trail with that ID
        req.flash('error', 'Cannot find that trail');           // flash error message
        res.redirect('/trails');                                // redirect back to all trails
    }
    res.render('trails/show', { trail }); 
}


// Update a trail 
module.exports.renderEditForm = async (req, res) => {           // get form 
    const { id } = req.params; 
    const trail = await Trail.findById(id);
    if(!trail){                                            // if mongoose couldn't find the trail with that ID
        req.flash('error', 'Cannot find that trail');      
        res.redirect('/trails');                           // redirect back to all trails
    }
    res.render('trails/edit', { trail }); 
}
module.exports.updateTrail = async (req, res) => {         // update
    const { id } = req.params; 
    console.log(req.body); 
    const trail = await Trail.findByIdAndUpdate(id, {...req.body.trail}); 
    const imgs = req.files.map(file => ({ url: file.path, filename: file.filename }));  // update images
    trail.images.push(...imgs);            // push new images if any, don't push an arr onto an arry, just take each data and push each
    
    if(req.body.deleteImages) {                 // delete images if any  
        // delete from cloudinary
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);    // deletes the given filename 
        }
        // delete from trail object, pull from images every filename that is in deleteImages & delete it 
        await trail.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }

    await trail.save(); 
    req.flash('success', 'Successfully updated trail!'); 
    res.redirect(`/trails/${trail._id}`);
}


// Delete a trail 
module.exports.deleteTrail = async (req, res) => {
    const { id } = req.params; 
    await Trail.findByIdAndDelete(id); 
    req.flash('success', 'Successfully deleted trail');    // flash delete message
    res.redirect('/trails'); 
}