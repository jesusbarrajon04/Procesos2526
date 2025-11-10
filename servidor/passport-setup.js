const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GoogleOneTapStrategy = require("passport-google-one-tap").GoogleOneTapStrategy;

passport.serializeUser(function(user, done) {
    done(null, user); 
}); 
passport.deserializeUser(function(user, done) {
    done(null, user);
});
passport.use(new GoogleStrategy({ 
    clientID: "817150573239-cuh0jcfurue2dgt6qk04leuca4ph83pb.apps.googleusercontent.com", 
    clientSecret: "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", 
    callbackURL: "http://localhost:3000/google/callback" 
},function(accessToken, refreshToken, profile, done) {
    return done(null, profile); 
} 
));
passport.use(new GoogleOneTapStrategy({
      clientID: "817150573239-cuh0jcfurue2dgt6qk04leuca4ph83pb.apps.googleusercontent.com",
      clientSecret: "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",
      verifyCsrfToken: false, // Desactivar validación CSRF para desarrollo
    },function (profile, done) {
      // El profile de One Tap viene en formato diferente
      return done(null, profile);
    }
));