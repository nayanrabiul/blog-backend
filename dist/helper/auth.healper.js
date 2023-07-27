"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.firebaseAdmin = exports.auth = exports.decodeToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const secret = process.env.JWT_SECRET;
const decodeToken = (req, res, next) => {
    try {
        if (req.headers?.authorization === undefined) {
            return next();
        }
        else {
            const token = req.headers?.authorization?.split(' ')[1];
            if (secret) {
                const decodedToken = jsonwebtoken_1.default.verify(token, secret);
                if (typeof decodedToken === 'object') {
                    res.locals.user = decodedToken;
                }
            }
            next();
        }
    }
    catch (err) {
        next();
    }
};
exports.decodeToken = decodeToken;
const auth = ({ isAdmin = false, isUser = false, isAuth = false }) => (req, res, next) => {
    const token = req.headers?.authorization?.split(' ')[1];
    if (!!token) {
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, secret);
            if (isAdmin && decodedToken.role === 'admin') {
                user_model_1.default.findOne({ _id: decodedToken._id }).then((user) => {
                    if (user) {
                        res.locals.user = user;
                        next();
                    }
                    else {
                        res.status(401).send({
                            error: true,
                            msg: 'User not found',
                        });
                    }
                });
            }
            else if (isUser && decodedToken.role === 'user') {
                user_model_1.default.findOne({ _id: decodedToken._id }).then((user) => {
                    if (user) {
                        res.locals.user = user;
                        next();
                    }
                    else {
                        res.status(401).send({
                            error: true,
                            msg: 'User not found',
                        });
                    }
                });
            }
            else if (isAuth) {
                user_model_1.default.findOne({ _id: decodedToken._id }).then((user) => {
                    if (user) {
                        res.locals.user = user;
                        next();
                    }
                    else {
                        res.status(401).send({
                            error: true,
                            msg: 'User not found',
                        });
                    }
                });
            }
        }
        catch (e) {
            console.log(e);
            res.status(500).send({
                error: true,
                msg: 'Something went wrong',
            });
        }
    }
    else {
        res.status(401).send({
            error: true,
            msg: 'Unauthorized',
        });
    }
};
exports.auth = auth;
// initialize firebase admin sdk
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const blog_7885a_firebase_adminsdk_8s7go_6ca33d7df8_json_1 = __importDefault(require("./blog-7885a-firebase-adminsdk-8s7go-6ca33d7df8.json"));
exports.firebaseAdmin = firebase_admin_1.default.initializeApp({
    //@ts-ignore
    credential: firebase_admin_1.default.credential.cert(blog_7885a_firebase_adminsdk_8s7go_6ca33d7df8_json_1.default),
});
const isAdmin = async (req) => {
    const token = req.headers?.authorization?.split(' ')[1];
    if (!!token) {
        try {
            const decodedToken = (await jsonwebtoken_1.default.verify(token, secret));
            return decodedToken.role === 'admin';
        }
        catch (e) {
            console.log(e);
            return false;
        }
    }
    else {
        return false;
    }
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=auth.healper.js.map
