// to handle async errors 

module.exports = func => {
    // returns a new func that has the given func executed and catches any errs
    // and passes it to next if there is any errs
    return (req, res, next) => {
        func(req, res, next).catch(next); 
    }
}