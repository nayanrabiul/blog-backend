"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
let schema = new mongoose_1.Schema({
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
    reading_list: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'article',
        },
    ],
    auth_type: String,
}, { timestamps: true });
const User = (0, mongoose_1.model)('user', schema);
exports.default = User;
//# sourceMappingURL=user.model.js.map
