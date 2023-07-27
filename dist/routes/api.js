"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = __importDefault(require("./api/user.routes"));
const article_routes_1 = __importDefault(require("./api/article.routes"));
const apiRouters = (0, express_1.Router)();
apiRouters.use('/article', article_routes_1.default);
apiRouters.use('/user', user_routes_1.default);
//file upload api
const multer_1 = __importDefault(require("multer"));
const s3_1 = require("../utils/s3");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
apiRouters.post('/uploadSingleFile', upload.single('file'), async function (req, res) {
    try {
        // @ts-ignore
        let url = await (0, s3_1.uploadFile)(req.file, 'bully-mall/files/', 't');
        res.status(200).send({ message: 'success', url, error: false });
    }
    catch (e) {
        console.log(e.message);
        res.status(400).send({ error: true, message: 'error', data: e.message });
    }
});
exports.default = apiRouters;
//# sourceMappingURL=api.js.map
