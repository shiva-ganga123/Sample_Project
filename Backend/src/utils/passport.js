import passport from 'passport';

import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import User from '../models/User';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
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