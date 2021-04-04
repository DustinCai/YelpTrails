const mongoose = require('mongoose'); 
const Schema = mongoose.Schema; 
const passportLocalMongoose = require('passport-local-mongoose'); 

const UserSchema = new Schema({
    email: {
        type: String, 
        required: true, 
        unique: true        // not considered a validation
    }
}); 

UserSchema.plugin(passportLocalMongoose);  // adds a username & password field to user schema & other methods

module.exports = mongoose.model('User', UserSchema); 