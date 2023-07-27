"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
    },
    comment: String,
});
const schema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
    },
    key: {
        type: String,
        unique: true,
    },
    title: String,
    image: String,
    content: String,
    comments: [commentSchema],
    topic: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'topic',
    },
}, { timestamps: true });
const Article = (0, mongoose_1.model)('article', schema);
exports.default = Article;
//# sourceMappingURL=article.model.js.map
