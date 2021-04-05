const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// configure the cloudinary instance
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET
});

// create an instance of cloudinarystorage
// our cloud storage is now configured so that it has the credentials 
// for our particular cloudinary account 
const storage = new CloudinaryStorage({
    cloudinary: cloudinary, 
    params: {
        folder: 'YelpTrail', // the folder IN cloudinary that we should store things in    
        allowed_formats: ['jpeg', 'png', 'jpg']
    }
}); 

module.exports = {
    cloudinary, 
    storage, 
}