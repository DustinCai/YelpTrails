if(process.env.NODE_ENV !== "production"){
    require('dotenv').config(); 
}

const express = require('express'); 
const path = require('path'); 
const mongoose = require('mongoose'); 
const methodOverride = require('method-override'); 
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError'); 
const flash = require('connect-flash'); 
const User = require('./models/user');
const helmet = require('helmet');                           // for xss security
const mongoSanitize = require('express-mongo-sanitize');    // for sql injections

// Storing session on mongo 
const session = require('express-session'); 
const MongoStore = require('connect-mongo'); 

// Authentication 
const passport = require('passport'); 
const LocalStrategy = require('passport-local'); 

// routes 
const campgroundRoutes = require('./routes/campgrounds'); 
const reviewRoutes = require('./routes/reviews'); 
const userRoutes = require('./routes/users'); 

// databases 
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';   // process.env.DB_URL for production, localhost for develpoment 


mongoose.connect(dbUrl, {  // first parameter is the db to connect to, use dbUrl for mongodb altas (production), developmentUrl for localhost (development)  
    userNewUrlParser: true, 
    useCreateIndex: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false, 
}); 

const db = mongoose.connection; 
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected"); 
}); 

const app = express();

app.engine('ejs', ejsMate); 
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views')); 

app.use(express.urlencoded({ extended: true }));            // to parse req.body for post method
app.use(methodOverride('_method'));                         // pass in the string we want to use for our query string, doesn't have to be _method
app.use(express.static(path.join(__dirname, 'public')));    // to serve our static files
app.use(mongoSanitize()); 



// session 
const secret = process.env.SECRET || 'developmentBackupSecret'; 

const store = MongoStore.create({                       // create the store
    mongoUrl: dbUrl,                           
    touchAfter: 24 * 60 * 60,                           // referring to unnecessary saves, don't continuously update after each refresh, update one a day (in seconds)
    crypto: {
        secret: secret, 
    }
}); 
store.on('error', function(e){
    console.log('Session store error', e);
})

const sessionConfig = {
    store: store,                                       // pass the store obj, should now use mongo to store our data
    name: 'session',                                    // rename the connect.sid cookie so bad actors don't know the session cookie name other than the default connect.sid 
    secret: secret, 
    resave: false, 
    saveUninitialized: true, 
    cookie: {
        httpOnly: true,                                 // cookie cannot be accessed through client side script, the browser will not reveal the cookie to a 3rd party
        // secure: true,                                   // so users can only access our site over http / cookies can only be configured over secure connections
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  // expires a week from now
        maxAge: 1000 * 60 * 60 * 24 * 7, 
    }
}
app.use(session(sessionConfig));                        // session
app.use(flash());                                       // flash

app.use(passport.initialize());                         // passport for authentication 
app.use(passport.session());                            // middleware if you want persistent login sessions, call this after app.use(session())
passport.use(new LocalStrategy(User.authenticate()));   // tell passport to use localStrategy & the auth method to use is on our user model

passport.serializeUser(User.serializeUser());           // tell passport how to serialize a user 
passport.deserializeUser(User.deserializeUser());       // both User methods are defined from the plugin



// for xss security measures, only allow fetching data from these resources  
// if you would like to include a script from another url, add it here
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",             // for minified bootstrap cdn 
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(helmet());                          // automatically enables all 11 of the middleware that helmet comes with
app.use(
    helmet.contentSecurityPolicy({          // configure helmet to allow the urls 
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dpdjxknhv/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



// middleware before our route handlers, on every single request, we have access to the properties in locals
app.use((req, res, next) => {
    res.locals.currentUser = req.user;          // have access to the logged in user from any template
    res.locals.success = req.flash('success');  // always have access to success
    res.locals.error = req.flash('error');      // flash error if there's anything stored in the flash under the key of error
    next(); 
})



// routes 
app.use('/', userRoutes); 
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes); 

app.get('/', (req, res) => {
    res.render('home'); 
}); 

app.listen(3000, () => {
    console.log('Serving on port 3000'); 
});



// Error Handling 

// This will only run if anything else is matched, if one of the earlier routes throws an err, this route will obviously be skipped
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})
// Error handler 
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err; 
    if(!err.message) {                                  
        err.message = 'Oh no, something went wrong!'; 
    }
    res.status(statusCode).render('error', { err });    // render err page & pass the err
})