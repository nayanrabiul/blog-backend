"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArticle = exports.postArticle = exports.fetchAllArticlesLink = exports.fetchFeatureArticle = exports.searchArticle = exports.fetchArticle = exports.paginatedFetchArticles = exports.fetchArticles = exports.delTopic = exports.postTopic = exports.fetchTopicsPerUser = exports.fetchTopics = exports.fetchTopic = void 0;
const article_model_1 = __importDefault(require("../models/article.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const topic_model_1 = __importDefault(require("../models/topic.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const fetchTopic = async (req, res, next) => {
    try {
        const { query } = req;
        const topic = await topic_model_1.default.findOne({ _id: query._id });
        return res.status(200).json({
            error: false,
            data: topic,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed',
        });
    }
};
exports.fetchTopic = fetchTopic;
const fetchTopics = async (req, res, next) => {
    try {
        let data = {};
        data = await topic_model_1.default.find({}, ['name']);
        return res.status(200).json({
            error: false,
            msg: 'Successfully gets topics',
            data,
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500).send({
            error: true,
            msg: 'Server failed',
        });
    }
};
exports.fetchTopics = fetchTopics;
const fetchTopicsPerUser = async (req, res, next) => {
    let { user } = res.locals;
    try {
        //find all articles by user and get the topics
        let data = await article_model_1.default.aggregate([
            { $match: { user: user._id } },
            {
                $project: {
                    topic: 1,
                },
            },
            { $group: { _id: '$topic', count: { $sum: 1 } } },
            {
                $lookup: {
                    from: 'topics',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'topic',
                },
            },
            { $unwind: '$topic' },
            { $project: { _id: 0, name: '$topic.name', count: 1 } },
        ]);
        return res.status(200).json({
            error: false,
            msg: 'Successfully gets topics',
            data,
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500).send({
            error: true,
            msg: 'Server failed',
        });
    }
};
exports.fetchTopicsPerUser = fetchTopicsPerUser;
const postTopic = async (req, res) => {
    try {
        let { body } = req;
        if (!!body._id) {
            await topic_model_1.default.findOneAndUpdate({ _id: body._id }, body);
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated topic',
            });
        }
        else {
            await topic_model_1.default.create(body);
            return res.status(200).send({
                error: false,
                msg: 'Successfully added topic',
            });
        }
    }
    catch (e) {
        console.log(e);
        if (e?.code === 11000) {
            return res.status(406).send({
                error: true,
                msg: 'Topic name already exists',
            });
        }
    }
    return res.status(500).send({
        error: true,
        msg: 'Server failed',
    });
};
exports.postTopic = postTopic;
const delTopic = async (req, res, next) => {
    try {
        const { query } = req;
        await topic_model_1.default.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: 'Deleted successfully',
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed',
        });
    }
};
exports.delTopic = delTopic;
const fetchArticles = async (req, res, next) => {
    try {
        //check if user authenticated
        let { query } = req;
        let username = query.username;
        let user = await user_model_1.default.findOne({ username });
        if (!user?._id) {
            console.log('user not found');
            return res.status(401).send({
                error: true,
                msg: 'Unauthorized',
            });
        }
        //extract data for pagination
        const page = query.page ? query.page : 1;
        const size = Number(query.size ? query.size : 2 ** 53 - 1); //max size for each page, (2 ** 53 - 1) means get all users
        const skip = Number((page - 1) * size);
        const created_by = new mongoose_1.default.Types.ObjectId(user._id);
        const matchStage = {
            $match: {
                user: created_by,
            },
        };
        let data = await article_model_1.default.aggregate([
            matchStage,
            {
                $facet: {
                    docs: [
                        {
                            $lookup: {
                                from: 'topics',
                                localField: 'topic',
                                foreignField: '_id',
                                as: 'topic',
                            },
                        },
                        {
                            $unwind: {
                                path: '$topic',
                            },
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user',
                                foreignField: '_id',
                                as: 'user',
                            },
                        },
                        {
                            $unwind: {
                                path: '$user',
                            },
                        },
                        {
                            //only include these fields
                            $project: {
                                title: 1,
                                key: 1,
                                image: 1,
                                content: 1,
                                topic: 1,
                                brand: 1,
                                user: {
                                    _id: 1,
                                    username: 1,
                                    email: 1,
                                    image: 1,
                                },
                                updatedAt: 1,
                            },
                        },
                        { $skip: skip },
                        { $limit: size },
                    ],
                    totalDocs: [
                        {
                            $count: 'createdAt',
                        },
                    ],
                },
            },
            {
                $project: {
                    docs: 1,
                    totalPages: {
                        $ceil: {
                            $divide: [{ $first: '$totalDocs.createdAt' }, size],
                        },
                    },
                    hasPrevPage: {
                        $cond: [{ $gt: [page, 1] }, true, false],
                    },
                    hasNextPage: {
                        $cond: [
                            {
                                $lt: [
                                    page,
                                    {
                                        $ceil: {
                                            $divide: [{ $first: '$totalDocs.createdAt' }, size],
                                        },
                                    },
                                ],
                            },
                            true,
                            false,
                        ],
                    },
                    totalDocs: { $first: '$totalDocs.createdAt' },
                },
            },
            {
                $addFields: {
                    page: Number(page),
                    limit: size,
                },
            },
        ]);
        return res.status(200).send({
            error: false,
            msg: 'Fetch Successful',
            data: data[0],
        });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).send({
            error: true,
            msg: 'Server Error ',
        });
    }
};
exports.fetchArticles = fetchArticles;
//paginated fetch for Articles
const paginatedFetchArticles = async (req, res, next) => {
    try {
        const { query } = req;
        const page = query.page ? query.page : 1;
        const size = Number(query.size ? query.size : 2 ** 53 - 1); //max size for each page, (2 ** 53 - 1) means get all users
        const skip = Number((page - 1) * size);
        //define match stage
        const matchStage = {};
        const topic_id = query.topic_id ? query.topic_id : null;
        if (topic_id) {
            matchStage.topic = new mongoose_1.default.Types.ObjectId(topic_id);
        }
        //define search stage
        const searchStage = query.search
            ? {
                $or: [
                    { name: { $regex: query.search, $options: 'i' } },
                    { email: { $regex: query.search, $options: 'i' } },
                ],
            }
            : {};
        let users = await article_model_1.default.aggregate([
            {
                $match: matchStage,
            },
            {
                $match: searchStage,
            },
            {
                $facet: {
                    docs: [
                        {
                            //populate the user field
                            $lookup: {
                                from: 'users',
                                localField: 'user',
                                foreignField: '_id',
                                as: 'user',
                            },
                        },
                        {
                            $unwind: '$user',
                        },
                        {
                            $lookup: {
                                from: 'topics',
                                localField: 'topic',
                                foreignField: '_id',
                                as: 'topic',
                            },
                        }, {
                            $unwind: '$topic',
                        },
                        {
                            //only include these fields
                            $project: {
                                title: 1,
                                key: 1,
                                image: 1,
                                content: 1,
                                user: {
                                    _id: 1,
                                    name: 1,
                                    username: 1,
                                    image: 1,
                                },
                                topic: {
                                    _id: 1,
                                    name: 1,
                                },
                                updatedAt: 1,
                            },
                        },
                        { $skip: skip },
                        { $limit: size },
                    ],
                    totalDocs: [
                        {
                            $count: 'createdAt',
                        },
                    ],
                },
            },
            {
                $project: {
                    docs: 1,
                    totalPages: {
                        $ceil: {
                            $divide: [{ $first: '$totalDocs.createdAt' }, size],
                        },
                    },
                    hasPrevPage: {
                        $cond: [{ $gt: [page, 1] }, true, false],
                    },
                    hasNextPage: {
                        $cond: [
                            {
                                $lt: [
                                    page,
                                    {
                                        $ceil: {
                                            $divide: [{ $first: '$totalDocs.createdAt' }, size],
                                        },
                                    },
                                ],
                            },
                            true,
                            false,
                        ],
                    },
                    totalDocs: { $first: '$totalDocs.createdAt' },
                },
            },
            {
                $addFields: {
                    page: Number(page),
                    limit: size,
                },
            },
        ]);
        return res.status(200).send({
            error: false,
            msg: 'Fetch Successful',
            data: users[0],
        });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).send({
            error: true,
            msg: 'Server Error ',
        });
    }
};
exports.paginatedFetchArticles = paginatedFetchArticles;
//comapare two ids
const comapareId = (id1, id2) => {
    return id1.toString() === id2.toString();
};
const fetchArticle = async (req, res, next) => {
    try {
        const { query } = req;
        console.log(query);
        if (!!query._id) {
            let data = await article_model_1.default.findById(query._id)
                .populate('topic')
                .populate('user', 'name username email ');
            return res.status(200).json({
                error: false,
                data: data,
            });
        }
        if (!!query.key) {
            let data = await article_model_1.default.findOne({ key: query.key })
                .populate('topic')
                .populate('user', 'name username email');
            return res.status(200).json({
                error: false,
                data: data,
            });
        }
        return res.status(400).json({
            error: true,
            msg: 'Bad Red',
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            msg: 'Server failed',
        });
    }
};
exports.fetchArticle = fetchArticle;
const searchArticle = async (req, res) => {
    try {
        const { query } = req;
        const page = query.page ? query.page : 1;
        const size = Number(query.size ? query.size : (2 ** 53 - 1)); //max size for each page, (2 ** 53 - 1) means get all users
        const skip = Number((page - 1) * size);
        let search = query.search;
        console.log(search);
        let filter = query.filter || 'Article';
        if (filter === 'Article') {
            //define match stage
            const matchStage = {};
            //define search stage
            const searchStage = query.search ? {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                ],
            } : {};
            let data = await article_model_1.default.aggregate([
                {
                    $match: matchStage,
                },
                {
                    $match: searchStage,
                },
                {
                    $facet: {
                        docs: [
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'user',
                                    foreignField: '_id',
                                    as: 'user',
                                },
                            }, {
                                $unwind: '$user',
                            },
                            {
                                $lookup: {
                                    from: 'topics',
                                    localField: '_id',
                                    foreignField: '_id',
                                    as: 'topic',
                                },
                            },
                            { $unwind: '$topic' },
                            {
                                //only include these fields
                                $project: {
                                    title: 1,
                                    key: 1,
                                    image: 1,
                                    content: 1,
                                    topic: 1,
                                    user: {
                                        _id: 1,
                                        name: 1,
                                        username: 1,
                                        image: 1,
                                        email: 1,
                                    },
                                },
                            },
                            { $skip: skip },
                            { $limit: size },
                        ],
                        totalDocs: [{
                                $count: 'createdAt',
                            }],
                    },
                },
                {
                    $project: {
                        docs: 1,
                        totalPages: {
                            $ceil: {
                                $divide: [
                                    { $first: '$totalDocs.createdAt' },
                                    size,
                                ],
                            },
                        },
                        totalDocs: { $first: '$totalDocs.createdAt' },
                    },
                },
                {
                    $addFields: {
                        page: page,
                        limit: size,
                    },
                },
            ]);
            console.log(data);
            return res.status(200).send({
                error: false,
                msg: 'Fetch Successful',
                data: data[0],
            });
        }
        else if (filter === 'Topic') {
            //define match stage
            const matchStage = {};
            //define search stage
            const searchStage = query.search ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                ],
            } : {};
            let data = await topic_model_1.default.aggregate([
                {
                    $match: matchStage,
                },
                {
                    $match: searchStage,
                },
                {
                    $facet: {
                        docs: [
                            //find from article collection where topic is equal to topic id
                            {
                                $lookup: {
                                    from: 'articles',
                                    localField: '_id',
                                    foreignField: 'topic',
                                    as: 'articles',
                                },
                            },
                            //unwind the articles array
                            {
                                $unwind: '$articles',
                            },
                            {
                                //only include these fields
                                $project: {
                                    title: '$articles.title',
                                    key: '$articles.key',
                                    image: '$articles.image',
                                    content: '$articles.content',
                                    user: '$articles.user',
                                    topic: {
                                        name: '$name',
                                    },
                                },
                            },
                            { $skip: skip },
                            { $limit: size },
                        ],
                        totalDocs: [{
                                $count: 'createdAt',
                            }],
                    },
                },
                {
                    $project: {
                        docs: 1,
                        totalPages: {
                            $ceil: {
                                $divide: [
                                    { $first: '$totalDocs.createdAt' },
                                    size,
                                ],
                            },
                        },
                        totalDocs: { $first: '$totalDocs.createdAt' },
                    },
                },
                {
                    $addFields: {
                        page: page,
                        limit: size,
                    },
                },
            ]);
            console.log(data);
            return res.status(200).send({
                error: false,
                msg: 'Fetch Successful',
                data: data[0],
            });
        }
        else if (filter === 'User') {
        }
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).send({
            error: true,
            msg: 'Server Error ',
        });
    }
};
exports.searchArticle = searchArticle;
const fetchFeatureArticle = async (req, res, next) => {
    let topic_id = req.query.topic_id;
    try {
        let data = null;
        if (topic_id) {
            data = await article_model_1.default.findOne({ topic: topic_id });
        }
        else {
            data = await article_model_1.default.findOne();
        }
        return res.status(200).json({
            error: false,
            data: data,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed',
        });
    }
};
exports.fetchFeatureArticle = fetchFeatureArticle;
const fetchAllArticlesLink = async (req, res, next) => {
    try {
        //fetch all Articles id
        const data = await article_model_1.default.aggregate([
            {
                $project: {
                    link: {
                        $concat: [
                            //merger topic name and article key
                            { $toLower: '$key' },
                        ],
                    },
                    updatedAt: 1,
                    _id: 0,
                },
            },
        ]);
        return res.status(200).json({
            error: false,
            data: data,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed',
        });
    }
};
exports.fetchAllArticlesLink = fetchAllArticlesLink;
let keyGenerator = (title) => {
    //remove all special characters
    title = title.replace(/[^a-zA-Z0-9 ]/g, '');
    //replace all spaces with hyphen
    title = title.replace(/\s+/g, '-').toLowerCase();
    //add a 4ch random string to the end
    title = title + '-' + Math.random().toString(36).substring(2, 6);
    return title;
};
const postArticle = async (req, res) => {
    try {
        let { body } = req;
        if (!!body._id) {
            let title = body.title;
            let content = body.content;
            let image = body.image;
            let topic = body.topic;
            await article_model_1.default.findOneAndUpdate({ _id: body._id }, {
                title, content, image, topic, key: keyGenerator(title),
            });
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated article',
            });
        }
        else {
            delete body._id;
            await article_model_1.default.create({
                ...body,
                key: keyGenerator(body.title),
                user: res.locals?.user?._id,
            });
            return res.status(200).send({
                error: false,
                msg: 'Successfully added article',
            });
        }
    }
    catch (e) {
        console.log(e.message);
        return res.status(500).send({
            error: true,
            msg: 'Server failed',
        });
    }
};
exports.postArticle = postArticle;
const deleteArticle = async (req, res) => {
    try {
        const _id = req.query._id;
        if (!_id) {
            return res.status(400).send({
                error: true,
                msg: 'Bad request',
            });
        }
        const data = await article_model_1.default.findByIdAndDelete(_id);
        if (!data) {
            return res.status(400).send({
                error: true,
                msg: 'Article not found',
            });
        }
        else {
            return res.status(200).send({
                error: false,
                msg: 'Successfully deleted article',
            });
        }
    }
    catch (e) {
        console.log(e.message);
        return res.status(500).send({
            error: true,
            msg: 'Server failed',
        });
    }
};
exports.deleteArticle = deleteArticle;
//# sourceMappingURL=article.controller.js.map
