import { model, Schema } from 'mongoose';


let schema = new Schema(
    {
        name: String,
        username: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        image: String,
        password: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        birthday: Date,
        address: {
            country: String,
            city: String,
            area: String,
            street: String,
            building: String,
            door: String,
            state: String,
            postcode: String,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        reading_list:[
            {
                type: Schema.Types.ObjectId,
                ref: 'article',
            },
        ],
        auth_type: String,
    },
    { timestamps: true },
);

const User = model('user', schema);

export default User;
