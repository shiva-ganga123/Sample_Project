import express from 'express';

import {register, login, refresh, logout, getCurrentUser} from '../controllers/auth.controller.js';
import passport from 'passport';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', getCurrentUser);

// Google OAuth
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account',
    accessType: 'offline',
    session: false
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  }),
  async (req, res) => {
    try {
      // Generate tokens
      const token = req.user.generateAuthToken();
      const refreshToken = req.user.generateRefreshToken();
      
      // Save refresh token to user in DB
      req.user.refreshToken = refreshToken;
      await req.user.save();
      
      // Redirect to frontend with tokens
      return res.redirect(
        `${process.env.CLIENT_ORIGIN}/auth/callback?token=${token}&refreshToken=${refreshToken}`
      );
    } catch (error) {
      console.error('OAuth callback error:', error);
      return res.redirect(
        `${process.env.CLIENT_ORIGIN}/login?error=authentication_failed`
      );
    }
  }
);

export default router;