import { Router } from 'express';
import {
    delTopic, deleteArticle,
    fetchAllArticlesLink,
    fetchTopics,
    fetchTopic,
    fetchArticle,
    fetchArticles,
    paginatedFetchArticles,
    postTopic,
    postArticle, fetchFeatureArticle, searchArticle, fetchTopicsPerUser,

} from '../../controllers/article.controller';
import { auth } from '../../helper/auth.healper';

const ArticleRoutes = Router();

ArticleRoutes.get('/topic', fetchTopic);
ArticleRoutes.get('/topics', fetchTopics);
ArticleRoutes.get('/topics-per-user',auth({isAuth:true}), fetchTopicsPerUser);
ArticleRoutes.post('/topic', postTopic);
ArticleRoutes.delete('/topic', delTopic);


ArticleRoutes.get('/', fetchArticle);
ArticleRoutes.get('/search', searchArticle);
ArticleRoutes.get('/featured', fetchFeatureArticle);
ArticleRoutes.get('/all_article_link', fetchAllArticlesLink);
ArticleRoutes.get('/list-by-user', fetchArticles);
ArticleRoutes.get('/paginated-list', paginatedFetchArticles);
ArticleRoutes.post('/', auth({ isAuth: true }), postArticle);
ArticleRoutes.delete('/', auth({ isAuth: true }), deleteArticle);



export default ArticleRoutes;
