import { model, Schema } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema({
    name: String,
    image: String,
    sub_categories: [{
        type: Schema.Types.ObjectId,
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

schema.plugin(paginate);
const Topic = model('topic', schema);
export default Topic;
