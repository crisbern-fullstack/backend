// const LocalStrategy = require('passport-local').Strategy
// const AdminModel = require("./models/AdminModel")
// const bcrypt = require("bcrypt")

// const initializePassport = (passport) => {
//     const authenticateUser = async (username, password, done) => {
//         const admin = await AdminModel.findOne({name:username})

//         if(!admin){
//             return done(null, false, {message : "Admin not found."})
//         }

//         try{
//             const same_password = await bcrypt.compare(password, admin.password)

//             if(same_password){
//                 return done(null, user)
//             }
//         }catch(err){
//             return done(err)
//         }

//     }

//     passport.use(new LocalStrategy({
//         usernameField: "username",
//         passwordField : "password"
//     }, authenticateUser))

//     passport.serializeUser((user, done) => done(null, user.id))
//     passport.deserializeUser((id, done) => {
//         return done(null, id)
//     })
// }

// module.exports = initializePassport