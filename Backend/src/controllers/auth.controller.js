import User from '../models/User.js';

import {hash, compare} from '../utils/hash.js';
import {signAccess, signRefresh} from '../utils/jwt.js';

export async function register(req, res) {
    // Input validation
    const { name, email, password } = req.body;
    
    // Check for required fields
    if (!name || !email || !password) {
        return res.status(400).json({ 
            success: false,
            message: 'All fields are required',
            fields: { 
                name: !name ? 'Name is required' : null,
                email: !email ? 'Email is required' : null,
                password: !password ? 'Password is required' : null
            }
        });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address',
            field: 'email'
        });
    }

    // Password strength validation
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long',
            field: 'password'
        });
    }
    
    try {
        // Check if user already exists (case-insensitive)
        const existing = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists',
                field: 'email'
            });
        }

        // Hash password and create user
        const passwordHash = await hash(password);
        const user = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            passwordHash
        });

        // Generate tokens
        const accessToken = signAccess({ id: user._id, email: user.email });
        const refreshToken = signRefresh({ id: user._id });
        
        // Set refresh token in HTTP-only cookie
        res.cookie('jid', refreshToken, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            accessToken
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed due to a server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function login(req, res){
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user) return res.status(401).json({error: 'Invalid credentials'});
        const valid = await compare(password, user.passwordHash);

        if(!valid) return res.status(401).json({error: 'Invalid credentials'});

        const accessToken = signAccess({id: user._id, email: user.email});
        const refreshToken = signRefresh({id: user._id});
        res.cookie('jid',refreshToken, {httpOnly: true, samesite: 'lax'})
        res.json({accessToken});
    }
    catch(e){
        res.status(500).json({error: 'Login failed'});
}
}

export async function refresh(req, res) {
    // refresh token logic
    res.json({ message: 'Refresh endpoint coming soon' });
  }
  
  export async function logout(req, res) {
    res.clearCookie('jid');
    res.json({ success: true, message: 'Logged out successfully' });
}

// Google OAuth callback
const handleGoogleCallback = async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (!user) {
            // Create new user with default life tracking data
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                provider: 'google',
                providerId: profile.id,
                avatar: profile.photos?.[0]?.value,
                // Default habits for new users
                habits: [
                    {
                        name: 'Morning Walk',
                        description: '30 minute walk in the morning',
                        frequency: 'daily',
                        category: 'health'
                    },
                    {
                        name: 'Meditation',
                        description: '10 minutes of meditation',
                        frequency: 'daily',
                        category: 'mental-health'
                    }
                ],
                // Default goals for new users
                goals: [
                    {
                        title: 'Complete 30 days of meditation',
                        description: 'Meditate for at least 10 minutes every day',
                        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                        category: 'mental-health'
                    }
                ]
            });
            await user.save();
        } else if (user.provider !== 'google') {
            // User exists but with different provider
            return done(null, false, { message: 'Email already registered with another provider' });
        }

        // Update last active time
        user.lastActive = new Date();
        await user.save();
        
        // Return user data without sensitive info
        const userData = user.toObject();
        delete userData.password;
        delete userData.tokenVersion;
        
        return done(null, userData);
    } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, false);
    }
};

export async function getCurrentUser(req, res) {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -tokenVersion -provider -providerId -__v')
            .populate('habits')
            .populate('goals');
            
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Calculate daily progress
        const today = new Date().toDateString();
        const todayMood = user.moodEntries.find(entry => 
            new Date(entry.date).toDateString() === today
        );
        
        const todayHabits = user.habits.filter(habit => 
            habit.frequency === 'daily' && 
            (!habit.lastCompleted || new Date(habit.lastCompleted).toDateString() !== today)
        );
        
        const response = {
            success: true,
            user: {
                ...user.toObject(),
                today: {
                    mood: todayMood?.mood || null,
                    pendingHabits: todayHabits.length,
                    completedGoals: user.goals.filter(g => g.isCompleted).length,
                    totalGoals: user.goals.length
                }
            }
        };
        
        res.status(200).json(response);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user data'
        });
    }
}

// Update the passport configuration to use this handler
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
}, handleGoogleCallback));