import express from 'express';
import { register, login, refresh, logout, getCurrentUser } from '../controllers/auth.controller.js';
import passport from 'passport';
import { auth } from '../middleware/auth.middleware.js';
import User from '../models/User.js';
import { signAccess, signRefresh } from '../utils/jwt.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
// Protected route - requires valid JWT token
router.get('/me', auth, getCurrentUser);

// Google OAuth
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account',
    accessType: 'offline',
    session: false,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  })
);

// Exchange Google auth code for tokens
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false,
    failureMessage: true
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        console.error('No user data from Google');
        return res.redirect(`${process.env.CLIENT_ORIGIN}/login?error=no_user_data`);
      }

      console.log('Google OAuth successful for user:', req.user.email);

      // Generate tokens
      const token = signAccess({ id: req.user._id });
      const refreshToken = signRefresh({ id: req.user._id });
      
      // Save refresh token to user in DB
      await User.findByIdAndUpdate(req.user._id, { refreshToken });
      
      // Create redirect URL with tokens
      const redirectUrl = new URL(process.env.CLIENT_ORIGIN);
      redirectUrl.pathname = '/auth/callback';
      redirectUrl.hash = new URLSearchParams({
        token,
        refreshToken,
        userId: req.user._id.toString()
      }).toString();
      
      return res.redirect(redirectUrl.toString());
      
    } catch (error) {
      console.error('Error in Google OAuth callback:', error);
      const redirectUrl = new URL(process.env.CLIENT_ORIGIN);
      redirectUrl.pathname = '/login';
      redirectUrl.search = new URLSearchParams({
        error: 'authentication_failed',
        message: error.message
      }).toString();
      
      return res.redirect(redirectUrl.toString());
    }
  }
);

export default router;