"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyValuePairToObject = exports.objectToKeyValuePair = exports.passwordGen = exports.generateOTP = exports.numberGen = exports.capitalizeFirstLetter = void 0;
const capitalizeFirstLetter = (string) => {
    return string?.charAt(0).toUpperCase() + string?.slice(1);
};
exports.capitalizeFirstLetter = capitalizeFirstLetter;
function numberGen(len = 12) {
    let text = '';
    let charset = '0123456789';
    for (let i = 0; i < len; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
}
exports.numberGen = numberGen;
function generateOTP(length = 4) {
    let digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}
exports.generateOTP = generateOTP;
function passwordGen(len = 8) {
    const generator = require('generate-password');
    return generator.generate({
        length: len,
        numbers: true,
        excludeSimilarCharacters: true,
        exclude: `.\\<>/?;:'"|[{}]!~#%*90-+=`,
        symbols: true,
        strict: true,
    });
}
exports.passwordGen = passwordGen;
function objectToKeyValuePair(obj) {
    let details = [];
    const keys = Object.keys(obj);
    const values = Object.values(obj);
    for (let i = 0; i < keys.length; i++) {
        details.push({
            key: keys[i],
            value: values[i],
        });
    }
    return details;
}
exports.objectToKeyValuePair = objectToKeyValuePair;
function keyValuePairToObject(arr) {
    const decode = {};
    for (let i = 0; i < arr.length; i++) {
        decode[arr[i].key] = arr[i].value;
    }
    return decode;
}
exports.keyValuePairToObject = keyValuePairToObject;
//# sourceMappingURL=common.js.map
