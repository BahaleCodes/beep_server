const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { errorHandler } = require('../helpers/dbErrorHandler');
const User = require('../models/user');

exports.signup = (req, res) => {
    const user = new User(req.body);
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.cookie('token', token, { expire: new Date() + 99999 });
        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({
            token,
            userId: user._id,
            user
        });
    })
}
exports.signin = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist. Please signup'
            });
        }
        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: 'Email and password dont match'
            });
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.cookie('token', token, { expire: new Date() + 99999 });
        const { _id, first_name, last_name, email, role } = user;
        return res.json({ token, userId: _id, user: { _id, email, first_name, last_name, role } });
    });
};
exports.signout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Successfully Signed Out" });
};

// Middlewares
exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    userProperty: 'auth'
});
exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id;
    console.log(req.profile._id);
    console.log(req.auth._id);
    if (!user) {
        return res.status(403).json({
            error: "Access Denied. User unauthenticated!"
        });
    }
    next();
}
exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: "Admin resourse! Access denied. User not authenticated as Admin."
        });
    }
    next();
}
