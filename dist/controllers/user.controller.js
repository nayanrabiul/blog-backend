"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromReadingList = exports.getReadingList = exports.AddToReadingList = exports.verifyGoogleUser = exports.userVerify = exports.userLogin = exports.userRegistration = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const auth_1 = require("firebase-admin/auth");
const auth_healper_1 = require("../helper/auth.healper");
const secret = process.env.JWT_SECRET;
// user signup
const userRegistration = async (req, res, next) => {
    try {
        let { body } = req;
        const exitUser = await user_model_1.default.findOne({ email: body.email });
        if (!!exitUser) {
            return res.status(400).send({
                error: true,
                msg: 'An account with this email has already existed',
            });
        }
        let hashedPassword = '';
        if (!!body.password) {
            hashedPassword = await bcrypt_1.default.hash(body.password, 8);
        }
        else {
            return res.status(400).send({
                error: true,
                msg: 'Password required',
            });
        }
        let user = new user_model_1.default({
            name: body.name,
            email: body.email,
            image: body.image,
            phone: body.phone,
            password: hashedPassword,
        });
        await user.save();
        let token = jsonwebtoken_1.default.sign({ _id: user?._id }, secret, { expiresIn: '15 days' });
        return res.status(200).send({
            error: false,
            msg: 'Successfully registered',
            token,
        });
    }
    catch (e) {
        if (e?.code === 11000) {
            return res.status(406).send({
                error: true,
                msg: 'An account with this credential has already existed',
            });
        }
        return res.status(500).send({
            error: true,
            msg: 'Server failed',
        });
    }
};
exports.userRegistration = userRegistration;
// user login
const userLogin = async (req, res) => {
    try {
        const email = req.body.email.trim().toLowerCase();
        const password = String(req.body.password);
        if (email && password) {
            const user = await user_model_1.default.findOne({ $or: [{ email: email }, { phone: email }] }, 'name email phone image role password role');
            if (user) {
                let auth = await bcrypt_1.default.compare(password, user.password);
                if (auth) {
                    let token = await jsonwebtoken_1.default.sign({ _id: user._id, role: user.role }, secret, {
                        expiresIn: '999d',
                    });
                    return res.status(200).send({
                        error: false,
                        msg: 'Login successful',
                        token,
                        data: {
                            _id: user?._id,
                            name: user?.name,
                            email: user?.email,
                            phone: user?.phone,
                            image: user?.image,
                            role: user?.role,
                        },
                        role: user?.role,
                    });
                }
                else {
                    return res.status(401).send({
                        error: true,
                        msg: 'Invalid credentials',
                    });
                }
            }
            return res.status(404).json({
                error: true,
                msg: 'User not found',
            });
        }
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed',
        });
    }
};
exports.userLogin = userLogin;
const userVerify = async (req, res) => {
    try {
        if (res.locals?.user?._id) {
            let user = await user_model_1.default.findById(res.locals?.user?._id, [
                'name',
                'username',
                'username',
                'image',
                'email',
                'role',
                'reading_list',
            ]);
            if (user) {
                return res.status(200).send({
                    error: false,
                    msg: 'Successfully verified',
                    data: user,
                });
            }
        }
        res.status(404).json({
            error: true,
            msg: 'User not found',
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed',
        });
    }
};
exports.userVerify = userVerify;
const verifyGoogleUser = async (req, res, next) => {
    try {
        let body = req.body;
        //get user from firebase.
        let decodedToken = await (0, auth_1.getAuth)(auth_healper_1.firebaseAdmin).verifyIdToken(body.access_token);
        //check if id-token valid
        if (!decodedToken.email) {
            res.status(401).sned({
                error: true,
                msg: 'Wrong Token',
            });
        }
        //else find user from database if user exist
        let user = await user_model_1.default.findOne({ email: decodedToken?.email });
        //if not found,create user
        if (!user) {
            user = new user_model_1.default({
                name: decodedToken.name,
                username: decodedToken.email?.split('@')[0],
                email: decodedToken.email?.toLowerCase(),
                image: decodedToken.picture,
                role: 'user',
                auth_type: 'google',
            });
            await user.save();
        }
        //sign jwt
        const secret = process.env.JWT_SECRET;
        let token = jsonwebtoken_1.default.sign({ _id: user?._id, email: user?.email, role: 'user' }, secret, {
            expiresIn: '999d',
        });
        const data = {
            _id: user?._id,
            name: user?.name,
            email: user?.email,
            image: user?.image,
            phone: user?.phone || '',
            role: user?.role,
            reading_list: user?.reading_list || [],
            auth_type: user?.auth_type || 'google',
        };
        return res.status(200).send({
            error: false,
            msg: 'Login successful',
            token,
            data,
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500).send({
            error: true,
            msg: 'Login failed! Try again',
        });
    }
};
exports.verifyGoogleUser = verifyGoogleUser;
//................Reading list.....................
const AddToReadingList = async (req, res) => {
    let _id = req.body._id;
    let user = await user_model_1.default.findById(res.locals?.user?._id);
    if (user) {
        let readingList = user.reading_list;
        if (readingList.includes(_id)) {
            return res.status(200).send({
                error: false,
                msg: 'Already added to reading list',
            });
        }
        readingList.push(_id);
        await user.save();
        return res.status(200).send({
            error: false,
            msg: 'Successfully added to reading list',
        });
    }
    else {
        return res.status(404).send({
            error: true,
            msg: 'User not found',
        });
    }
};
exports.AddToReadingList = AddToReadingList;
const getReadingList = async (req, res) => {
    try {
        let user = await user_model_1.default.findById(res.locals?.user?._id).populate('reading_list');
        if (user) {
            let readingList = user.reading_list;
            return res.status(200).send({
                error: false,
                msg: 'Successfully fetched',
                data: readingList,
            });
        }
        else {
            return res.status(404).send({
                error: true,
                msg: 'User not found',
            });
        }
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: e.message,
        });
    }
};
exports.getReadingList = getReadingList;
const removeFromReadingList = async (req, res) => {
    let _id = req.query._id;
    let user = await user_model_1.default.findById(res.locals?.user?._id);
    console.log(user.reading_list.includes(_id));
    if (user) {
        let readingList = user.reading_list;
        if (!readingList.includes(_id)) {
            return res.status(200).send({
                error: false,
                msg: 'Already removed from reading list',
            });
        }
        readingList = readingList.filter((item) => item.toString() !== _id);
        user.reading_list = readingList;
        await user.save();
        return res.status(200).send({
            error: false,
            msg: 'Successfully removed from reading list',
        });
    }
    else {
        return res.status(404).send({
            error: true,
            msg: 'User not found',
        });
    }
};
exports.removeFromReadingList = removeFromReadingList;
//# sourceMappingURL=user.controller.js.map
