import jwt, { Secret } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { inflate } from 'zlib';

const secret: Secret = process.env.JWT_SECRET as Secret;
export const decodeToken = (req: Request, res: Response, next: NextFunction): void => {
    try {
        if (req.headers?.authorization === undefined) {
            return next();
        } else {
            const token = req.headers?.authorization?.split(' ')[1];
            if (secret) {
                const decodedToken = jwt.verify(token, secret);
                if (typeof decodedToken === 'object') {
                    res.locals.user = decodedToken;
                }
            }
            next();
        }
    } catch (err) {
        next();
    }
};

type decodedToken = {
    _id: string;
    role: string;
    email: string;
};

export const auth =
    ({ isAdmin = false, isUser = false, isAuth = false }) =>
    (req: Request, res: Response, next: NextFunction): void => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!!token) {
            try {
                const decodedToken: decodedToken = jwt.verify(token, secret) as decodedToken;

                if (isAdmin && decodedToken.role === 'admin') {
                    User.findOne({ _id: decodedToken._id }).then((user) => {
                        if (user) {
                            res.locals.user = user;
                            next();
                        } else {
                            res.status(401).send({
                                error: true,
                                msg: 'User not found',
                            });
                        }
                    });
                } else if (isUser && decodedToken.role === 'user') {
                    User.findOne({ _id: decodedToken._id }).then((user) => {
                        if (user) {
                            res.locals.user = user;
                            next();
                        } else {
                            res.status(401).send({
                                error: true,
                                msg: 'User not found',
                            });
                        }
                    });
                } else if (isAuth) {

                    User.findOne({ _id: decodedToken._id }).then((user) => {
                        if (user) {
                            res.locals.user = user;
                            next();
                        } else {
                            res.status(401).send({
                                error: true,
                                msg: 'User not found',
                            });
                        }
                    });
                }
            } catch (e) {
                console.log(e);
                res.status(500).send({
                    error: true,
                    msg: 'Something went wrong',
                });
            }
        } else {
            res.status(401).send({
                error: true,
                msg: 'Unauthorized',
            });
        }
    };

// initialize firebase admin sdk
import admin from 'firebase-admin';
import jsonConfig from './blog-7885a-firebase-adminsdk-8s7go-6ca33d7df8.json';

export const firebaseAdmin = admin.initializeApp({
    //@ts-ignore
    credential: admin.credential.cert(jsonConfig),
});

export const isAdmin = async (req) => {
    const token = req.headers?.authorization?.split(' ')[1];
    if (!!token) {
        try {
            const decodedToken: decodedToken = (await jwt.verify(token, secret)) as decodedToken;
            return decodedToken.role === 'admin';
        } catch (e) {
            console.log(e);
            return false;
        }
    } else {
        return false;
    }
};
