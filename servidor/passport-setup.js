const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GoogleOneTapStrategy = require("passport-google-one-tap").GoogleOneTapStrategy;

let variables = {}
variables.clientID = process.env.GOOGLE_CLIENT_ID;
variables.clientSecretID = process.env.GOOGLE_CLIENT_SECRET;
variables.url = process.env.GOOGLE_CALLBACK_URL;

passport.serializeUser(function(user, done) {
    done(null, user); 
}); 
passport.deserializeUser(function(user, done) {
    done(null, user);
});
passport.use(new GoogleStrategy({ 
    clientID: variables.clientID, 
    clientSecret: variables.clientSecretID, 
    callbackURL: variables.url 
},function(accessToken, refreshToken, profile, done) {
    return done(null, profile); 
} 
));
passport.use(new GoogleOneTapStrategy({
      clientID: variables.clientID,
      clientSecret: variables.clientSecretID,
      verifyCsrfToken: false,
    },function (profile, done) {
      return done(null, profile);
    }
));