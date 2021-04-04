const User = require('../models/user'); 

// Create users 
module.exports.renderRegister = (req, res) => {
    res.render('users/register'); 
}
module.exports.register = async (req, res, next) => {
    try{                                                                
        const { email, username, password } = req.body; 
        const user = new User({ email: email, username: username });    // create new user 
        const registeredUser = await User.register(user, password);     // save new user to the database & hash the password
        
        // can't use req.authenticate because you can't authenticate someone until we've created a user, that's why we use login after we created the user
        req.login(registeredUser, err => {                              // log that user in using req.login
            // function requires a callback so we can't await it
            if(err) {
                return next(err);   // if err, go to the next err route
            }
            req.flash('success', 'Welcome to Yelp camp!');              // flash & redirect the user
            res.redirect('/campgrounds'); 
        });  
    } catch(e){
        req.flash('error', e.message);      // user with the given username is already registered
        res.redirect('register'); 
    }
}


// User Login 
module.exports.renderLogin = (req, res) => {    // get form to login 
    res.render('users/login'); 
}
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!'); 
    const redirectUrl = req.session.returnTo || '/campgrounds'; // if the user was redirected from a url || they just clicked login, no redirect   
    delete req.session.returnTo;                                // remove the original url before we redirect to it    
    res.redirect(redirectUrl); 
}


// User Logout 
module.exports.logout = (req, res) => {
    req.logout(); 
    req.flash('success', 'Goodbye!'); 
    res.redirect('/campgrounds'); 
}