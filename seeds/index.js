const mongoose = require('mongoose'); 
const cities = require('./cities'); 
const { places, descriptors } = require('./seedHelpers');  
const Campground = require('../models/campground'); 

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
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
    await Campground.deleteMany({});                            // delete everything in db
    for(let i = 0; i < 300; i++){                                // then seed 50 new campgrounds 
        const random1000 = Math.floor(Math.random() * 1000);    // random num to get a random city
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            author: '6061701c2e957b00e16e58fe', // random user id, check your db
            location: `${cities[random1000].city}, ${cities[random1000].state}`,    // random city 
            title: `${sample(descriptors)} ${sample(places)}`,                      // random descriptor & place
            description: "random text random text random text random text random text random text random text random text random text random text random text random text random text ",
            price: price, 
            geometry: { 
                type: 'Point', 
                coordinates: [
                    cities[random1000].longitude, 
                    cities[random1000].latitude, 
                ],     
            }, 
            images: [       // use some images we already stored in cloudinary
                {
                  url: 'https://res.cloudinary.com/dpdjxknhv/image/upload/v1617248493/YelpCamp/vhy6iy9pbd6n4306zxht.png',
                  filename: 'YelpCamp/vhy6iy9pbd6n4306zxht'
                },
                {
                  url: 'https://res.cloudinary.com/dpdjxknhv/image/upload/v1617248493/YelpCamp/zmmpm8yc18pkb6cmz6uq.jpg',
                  filename: 'YelpCamp/zmmpm8yc18pkb6cmz6uq'
                }
              ]
        })
        await camp.save();  // save the city
    }
}

// call seedDB function then close the connection to the database
// returns a promise because seedDB is an async func so we can use .then()
seedDB().then(() => {
    mongoose.connection.close(); 
}); 


// run this file on it's own separately from our node app any time we want to see our database
// not that often, really just anytime we make changes to the model or to our data