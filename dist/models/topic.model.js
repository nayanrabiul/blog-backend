"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const schema = new mongoose_1.Schema({
    name: String,
    image: String,
    sub_categories: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'sub_category',
        }]
}, { timestamps: true });
//restrict delete if topic has articles
// schema.pre(
//     // @ts-ignore
//     ['findOneAndRemov', 'findOneAndDelete', 'deleteOne', 'deleteMany'],
//     async function(next, opts) {
//         //get this topic id
//         const categoryId = this._conditions._id;
//         //find all sub_category that have this topic
//         try {
//             //find at least one product with this topic
//             const sub_category = await SubTopic.findOne({ topic: categoryId });
//             !!sub_category ? next(new Error('Cannot delete topic while sub_category exist.')) : next();
//         } catch (e) {
//             next(e);
//         }
//     },
// );
schema.plugin(mongoose_paginate_v2_1.default);
const Topic = (0, mongoose_1.model)('topic', schema);
exports.default = Topic;
//# sourceMappingURL=topic.model.js.map
