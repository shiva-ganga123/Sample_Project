import User from '../models/User.js';

import {hash, compare} from '../utils/hash.js';
import {signAccess, signRefresh} from '../utils/jwt.js';

export async function register(req, res){
    const{name, email, password} = req.body;
    
    try{
        const existing = await User.findOne({email});
        if(existing) return res.status(400).json({error: 'User already exists'});

        const passwordHash = await hash(password);
        const user = await User.create({name, email, passwordHash});
        res.json({message: 'User registered successfully', user: {id: user._id, email: user.email}});
    }
    catch(e){
        res.status(500).json({error: 'Registration failed'});
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
    res.json({ message: 'Logged out' });
  }