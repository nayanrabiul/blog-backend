import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
};

const s3Client = new S3Client(s3Config);

export const uploadFile = async (file: any, folder: string, name: String = '') => {
    try {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${folder}/${file.originalname}`,
            Body: file.buffer,
        };
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${
            process.env.AWS_REGION
        }.amazonaws.com/${folder}/${
            file.originalname
        }`;
    } catch (e) {
        console.log(e);
        return null;
    }
};
