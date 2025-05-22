const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        console.log('Received token:', token);
        
        if (!token) {
            console.error('No token provided in request');
            return res.status(401).json({ message: 'No token provided' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        console.log('Verifying token with secret:', process.env.JWT_SECRET);
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        
        if (!decoded.pasajeroId) {
            console.error('Token does not contain pasajeroId');
            return res.status(401).json({ message: 'Invalid token structure' });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        console.error('Error stack:', error.stack);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = auth; 