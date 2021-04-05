const mongoose = require('mongoose'); 
const Schema = mongoose.Schema; 
const Review = require('./review'); 

const ImageSchema = new Schema({
    url: String, 
    filename: String, 
})

// set a virtual property called 'thumbnail' on the image schema for every image
ImageSchema.virtual('thumbnail').get(function(){
    // we don't need to store this on our model or in the db as an actual property because it's just derived
    // from the information we're already storing, so we can just make a virtual property 
    return this.url.replace('/upload', '/upload/w_200');   // insert w_200 into the url so it will resize
});

const opts = { toJSON: { virtuals: true } };    // to get mongoose virtual properties added on the res object
const TrailSchema = new Schema({
    title: String, 
    images: [ ImageSchema ],                // array for multiple images
    geometry: {
        type: {
            type: String,       // don't do '{ location: { type: String } }'
            enum: ['Point'],    // 'location type' must be 'Point' 
            required: true 
        }, 
        coordinates: {
            type: [ Number ], 
            required: true 
        }
    },
    // price: Number, 
    description: String, 
    location: String, 
    author: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,    // ObjectId from a 'review' model
            ref: 'Review'
        }
    ], 
}, opts);

// virtual property for clustermap 
TrailSchema.virtual('properties.popUpMarkup').get(function() {                 // adds a property of 'properties: { popUpMarkup: '...' }'
    // for the popup link when you click on a circle on the map     
    return `<strong><a href="/trails/${this._id}">${this.title}</a></strong>
            <p>${this.description.substring(0, 25)}...</p>`; 
}); 


// post query middleware after a trail model calls findOneAndDelete
TrailSchema.post('findOneAndDelete', async function(doc) { // we have access to whatever has been deleted through doc
    // delete all reviews associated with a trail that was deleted
    if(doc){                        // if the deleted item was found and deleted
        await Review.deleteMany({   // pass in a query where we delete all reviews where their id field is in our doc.review array
            _id: {                  
                $in: doc.reviews    
            }
        })
        console.log(doc); 
        console.log("Deleted!"); 
    }
}); 


// compile model and export it 
module.exports = mongoose.model('Trail', TrailSchema); 