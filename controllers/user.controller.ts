import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { verifyGoogleBodyType } from '../helper/types';
import { getAuth } from 'firebase-admin/auth';
import { firebaseAdmin } from '../helper/auth.healper';


const secret = process.env.JWT_SECRET;

// user signup
export const userRegistration = async (req, res, next) => {
    try {
        let { body } = req;
        const exitUser = await User.findOne({ email: body.email });
        if (!!exitUser) {
            return res.status(400).send({
                error: true,
                msg: 'An account with this email has already existed',
            });
        }

        let hashedPassword: string = '';
        if (!!body.password) {
            hashedPassword = await bcrypt.hash(body.password, 8);
        } else {
            return res.status(400).send({
                error: true,
                msg: 'Password required',
            });
        }
        let user = new User({
            name: body.name,
            email: body.email,
            image: body.image,
            phone: body.phone,
            password: hashedPassword,
        });
        await user.save();
        let token = jwt.sign({ _id: user?._id }, secret, { expiresIn: '15 days' });
        return res.status(200).send({
            error: false,
            msg: 'Successfully registered',
            token,
        });
    } catch (e) {
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

// user login
export const userLogin = async (req, res) => {
    try {
        const email = req.body.email.trim().toLowerCase();
        const password = String(req.body.password);
        if (email && password) {
            const user = await User.findOne(
                { $or: [{ email: email }, { phone: email }] },
                'name email phone image role password role',
            );
            if (user) {
                let auth = await bcrypt.compare(password, user.password);
                if (auth) {
                    let token = await jwt.sign({ _id: user._id, role: user.role }, secret, {
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
                } else {
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
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed',
        });
    }
};

export const userVerify = async (req, res) => {
    try {
        if (res.locals?.user?._id) {
            let user = await User.findById(res.locals?.user?._id, [
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
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed',
        });
    }
};

export const verifyGoogleUser = async (req, res, next) => {
    try {
        let body: verifyGoogleBodyType = req.body;
        //get user from firebase.
        let decodedToken = await getAuth(firebaseAdmin).verifyIdToken(body.access_token);
        //check if id-token valid
        if (!decodedToken.email) {
            res.status(401).sned({
                error: true,
                msg: 'Wrong Token',
            });
        }
        //else find user from database if user exist
        let user: any = await User.findOne({ email: decodedToken?.email });
        //if not found,create user

        if (!user) {
            user = new User({
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
        let token = jwt.sign({ _id: user?._id, email: user?.email, role: 'user' }, secret, {
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
    } catch (e) {
        console.log(e);
        return res.status(500).send({
            error: true,
            msg: 'Login failed! Try again',
        });
    }
};


//................Reading list.....................
export const AddToReadingList = async (req, res) => {
    let _id = req.body._id;
    let user = await User.findById(res.locals?.user?._id);
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
    } else {
        return res.status(404).send({
            error: true,
            msg: 'User not found',
        });
    }
};

export const getReadingList = async (req, res) => {
    try {
        let user = await User.findById(res.locals?.user?._id).populate('reading_list');
        if (user) {
            let readingList = user.reading_list;
            return res.status(200).send({
                error: false,
                msg: 'Successfully fetched',
                data: readingList,
            });
        } else {
            return res.status(404).send({
                error: true,
                msg: 'User not found',
            });
        }
    } catch (e) {
        return res.status(500).send({
                error: true,
                msg: e.message,
            },
        );
    }
};


export const removeFromReadingList = async (req, res) => {
    let _id = req.query._id;
    let user = await User.findById(res.locals?.user?._id);
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
    } else {
        return res.status(404).send({
            error: true,
            msg: 'User not found',
        });
    }
};
