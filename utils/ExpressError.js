class ExpressError extends Error {      // inherit from error
    constructor(message, statusCode){
        super();                        // call the superclass constructor
        this.message = message; 
        this.statusCode = statusCode; 
    }
} 

module.exports = ExpressError; 