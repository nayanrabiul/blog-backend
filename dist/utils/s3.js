"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3Config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
};
const s3Client = new client_s3_1.S3Client(s3Config);
const uploadFile = async (file, folder, name = '') => {
    try {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${folder}/${file.originalname}`,
            Body: file.buffer,
        };
        const command = new client_s3_1.PutObjectCommand(params);
        await s3Client.send(command);
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${folder}/${file.originalname}`;
    }
    catch (e) {
        console.log(e);
        return null;
    }
};
exports.uploadFile = uploadFile;
//# sourceMappingURL=s3.js.map
