import mongoose from 'mongoose';

export interface UserType {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    photoURL: string;
    role: {
        type: string;
        enum: ['user', 'admin'];
        default: 'user';
    };
    auth_type: string;
    password: string;
    otp: string;
    verified: boolean;
}

export interface verifyGoogleBodyType {
    name: string | null;
    email: string | null;
    phone: string | null;
    photoURL: string | null;
    access_token: string | null;
    auth_type: string;
}
