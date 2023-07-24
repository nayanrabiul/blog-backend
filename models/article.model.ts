import { model, Schema } from 'mongoose';

const commentSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        comment: String,
    });

const schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        key:{
            type: String,
            unique: true,
        },
        title: String,
        image: String,
        content: String,
        comments: [commentSchema],
        topic: {
            type: Schema.Types.ObjectId,
            ref: 'topic',
        },

    },
    { timestamps: true },
);

const Article = model('article', schema);
export default Article;

