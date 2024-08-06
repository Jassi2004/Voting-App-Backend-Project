require('dotenv').config()
const jwt = require('jsonwebtoken');


// const jwtAuthMiddleware = (req,res,next)=>{
//     const token = req.header.authorization.split(' ')[1];
//     if(!token) return res.status(401).json({error: "Unauthorized"});

//     try {
//         const decoded = jwt.verify(token , process.env.JWT_SECRET)
//         req.user = decoded;
//         next();
//     } catch (error) {
//         console.error();
//         res.status(401).json({error: 'Invalid Token'});
//     }
// }
const jwtAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Token missing from header" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        res.status(401).json({ error: 'Invalid Token' });
    }
};


const generateToken = (userData)=>{
    return jwt.sign(userData , process.env.JWT_SECRET , {expiresIn: 500000});  
}

module.exports = {jwtAuthMiddleware , generateToken};