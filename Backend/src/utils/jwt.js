import jwt from 'jsonwebtoken';

export const signAccess = (payload) => 
     jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TTL || '15m' });

export const signRefresh = (payload) => 
     jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_TTL || '7d' });

export const verifyAccess = (token) => 
     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

export const verifyRefresh = (token) => 
     jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

