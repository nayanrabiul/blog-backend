import { Router } from 'express';
import userRoutes from './api/user.routes';
import ArticleRoutes from './api/article.routes';

const apiRouters = Router();
apiRouters.use('/article', ArticleRoutes);
apiRouters.use('/user', userRoutes);

//file upload api
import multer from 'multer';
import { uploadFile } from '../utils/s3';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
apiRouters.post('/uploadSingleFile', upload.single('file'), async function(req, res) {
    try {
        let url = await uploadFile(req.file, 'bully-mall/files/', 't');
        res.status(200).send({ message: 'success', url, error: false });
    } catch (e) {
        console.log(e.message);
        res.status(400).send({ error: true, message: 'error', data: e.message });
    }
});

export default apiRouters;
