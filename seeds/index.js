const mongoose = require('mongoose'); 
const cities = require('./cities'); 
const { places, descriptors, nouns } = require('./seedHelpers');  
const Trail = require('../models/trail'); 

const dbUrl = process.env.DB_URL 
const localDB = 'mongodb://localhost:27017/yelp-trail';           // use for local seeding else process.env.DB_URL
mongoose.connect(dbUrl, {  // connect db
    userNewUrlParser: true, 
    useCreateIndex: true, 
    useUnifiedTopology: true, 
}); 

const db = mongoose.connection; 
db.on("error", console.error.bind(console, "connection error:")); // check for error 
db.once("open", () => {
    console.log("Database connected"); 
}); 


const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)]; // return a random element in array
}

const seedDB = async() => {
    await Trail.deleteMany({});                                 // delete everything in trails collection 
   
    const images = [                                            // use some default images we already stored in cloudinary
        {
            url: 'https://res.cloudinary.com/dpdjxknhv/image/upload/v1617577974/YelpTrail/defaultImages/hiking4_revuzs.jpg',
            filename: 'YelpTrail/defaultImages/hiking4_revuzs'
          },
          {
            url: 'https://res.cloudinary.com/dpdjxknhv/image/upload/v1617577974/YelpTrail/defaultImages/hiking1_q8eo72.jpg', 
            filename: 'YelpTrail/defaultImages/hiking1_q8eo72'
          }, 
          {
            url: 'https://res.cloudinary.com/dpdjxknhv/image/upload/v1617577979/YelpTrail/defaultImages/hiking2_llhdlm.jpg', 
            filename: 'YelpTrail/defaultImages/hiking2_llhdlm'
          }
    ]

    const numOfFakeTrails = 100
    for(let i = 0; i < numOfFakeTrails; i++){                   // then seed new trails 
        const random1000 = Math.floor(Math.random() * 1000);    // random num to get a random city    

        const trail = new Trail({       
            // using an already defined user for each seeded trail, switch the objectID depending on which db you are using then reseed
            // 606a63dddcdcf501ba8ab540 for development         
            // 606a509795e909012747ef89 for mongodb 
            author: '606a509795e909012747ef89',         // random user id, check your db  // colt: 6061701c2e957b00e16e58fe
            location: `${cities[random1000].city}, ${cities[random1000].state}`,    // random city 
            title: `${sample(descriptors)} ${sample(nouns)} ${sample(places)}`,  // random descriptor & place
            description: `Hiking trail by ${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: { 
                type: 'Point', 
                coordinates: [
                    cities[random1000].longitude, 
                    cities[random1000].latitude, 
                ],     
            }, 
            images: images.sort(() => Math.random() - 0.5),     // shuffle the images so the first image will be different
        })
        await trail.save();  // save the trail
    }
}

// call seedDB function then close the connection to the database
// returns a promise because seedDB is an async func so we can use .then()
seedDB().then(() => {
    mongoose.connection.close(); 
}); 


// run this file on it's own separately from our node app any time we want to see our database
// not that often, really just anytime we make changes to the model or to our data: node seeds/index.js