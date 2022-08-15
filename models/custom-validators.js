const validator = require('validator')
//custom email validation
//email-validator returns false if blank
const customEmailValidator = (email) => {
    if(email.length === 0){
        return true
    }

    return validator.isEmail(email)
}

//url validation
const urlValidator = (url) => {
    if(url.length === 0){
        return true
    }

    return validator.isURL(url)
}

module.exports = {
    customEmailValidator,
    urlValidator
}