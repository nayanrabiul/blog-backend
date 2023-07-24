import { Router } from 'express';
const userRoutes = Router();

import {
    userRegistration,
    userLogin,
    userVerify,
    verifyGoogleUser, AddToReadingList, getReadingList, removeFromReadingList,
} from '../../controllers/user.controller';
import { auth } from '../../helper/auth.healper';

userRoutes.post('/registration', userRegistration);
userRoutes.post('/login', userLogin);
userRoutes.get('/verify', auth({ isAuth: true }), userVerify);
userRoutes.post('/verify-google-user', verifyGoogleUser);

//reading list
userRoutes.get('/reading-list', auth({ isAuth: true }), getReadingList);
userRoutes.post('/reading-list', auth({ isAuth: true }), AddToReadingList);
userRoutes.delete('/reading-list', auth({ isAuth: true }), removeFromReadingList);
export default userRoutes;
