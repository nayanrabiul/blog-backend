"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRoutes = (0, express_1.Router)();
const user_controller_1 = require("../../controllers/user.controller");
const auth_healper_1 = require("../../helper/auth.healper");
userRoutes.post('/registration', user_controller_1.userRegistration);
userRoutes.post('/login', user_controller_1.userLogin);
userRoutes.get('/verify', (0, auth_healper_1.auth)({ isAuth: true }), user_controller_1.userVerify);
userRoutes.post('/verify-google-user', user_controller_1.verifyGoogleUser);
//reading list
userRoutes.get('/reading-list', (0, auth_healper_1.auth)({ isAuth: true }), user_controller_1.getReadingList);
userRoutes.post('/reading-list', (0, auth_healper_1.auth)({ isAuth: true }), user_controller_1.AddToReadingList);
userRoutes.delete('/reading-list', (0, auth_healper_1.auth)({ isAuth: true }), user_controller_1.removeFromReadingList);
exports.default = userRoutes;
//# sourceMappingURL=user.routes.js.map
