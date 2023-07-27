"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const app = (0, express_1.default)();
dotenv_1.default.config();
const PORT = process.env.PORT || 5900;
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    },
});
const auth_healper_1 = require("./helper/auth.healper");
const api_1 = __importDefault(require("./routes/api"));
// database connection
mongoose_1.default
    .connect(process.env.DATABASE_URL)
    .then((response) => {
    console.log('MongoDB Connected Successfully.');
})
    .catch((err) => {
    console.log('Database connection failed.');
});
// morgan routes view
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('tiny'));
    console.log('Morgan connected..');
}
// middleware
app.use((0, compression_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); //* will allow from all cross domain
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.locals.socket = io;
    next();
});
app.use((0, cors_1.default)());
app.use(auth_healper_1.decodeToken);
app.use('/api', api_1.default);
// server welcome message
app.use('/', (req, res, next) => {
    return res.status(200).json({
        status: true,
        message: 'Welcome to Article-site',
    });
});
//file upload
app.use((0, express_fileupload_1.default)({
    debug: true,
}));
// server listening
http.listen(PORT, () => console.log(`Port is listening ${PORT}`));
//# sourceMappingURL=app.js.map
