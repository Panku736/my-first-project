const jwt = require('jsonwebtoken');
const personSchema = require('../models/person.js');
const { startsWith, replace } = require('lodash');

module.exports.verifyToken = async (req, res, next) => {
    try {
        let cookiesToken = req.headers.Cookie;
        console.log("line 8 cookies token",cookiesToken)
        if (cookiesToken && cookiesToken.startsWith('jwt=')) {
            const cookiesToken = cookiesToken.replace('jwt=', '');}
        const testToken = req.headers.authorization || cookiesToken;

        let token;

        if (testToken && testToken.startsWith('Bearer')) {
            token = testToken.split(' ')[1];

            const tokenDecode = jwt.verify(token, process.env.SECRET_KEY);
            

            if (tokenDecode) {
                const user = await personSchema.findOne({ _id: tokenDecode.userId });

                if (user) {
                    req.userId = tokenDecode.userId;
                    next();
                    
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'User not found',
                    });
                }
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Verify failed token',
                });
            } 
        } else {
            return res.status(401).json({
                success: false,
                message: 'Wrong token',
            });
        }
    } catch (error) {
        // Handle JWT verification errors
        console.error('JWT Verification Error:', error);
        return res.status(401).json({
            success: false,
            message: 'Failed to verify token',
        });
    }
};
 