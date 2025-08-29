import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import config from '../config/index.js';

passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
}, async (accessToken, refreshToken, profile, done) => {
    try{
        let user = await User.findOne({googleId: profile.id});
        if(!user){
            user = await User.findOne({email: profile.emails?.[0]?.value});
        }
        if(!user){
            user = await User.create({
                name: profile.displayName || 'Google User',
                email: profile.emails?.[0]?.value,
                provider: 'google',
                googleId: profile.id
            });
        }
        else if(!user.googleId){
            user.googleId = profile.id;
            user.provider = 'google';
            await user.save();
        }
        return done(null, user);
    }
    catch (e) { done(e); }
}));