"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT, 10) || 3001,
    jwt: {
        secret: process.env.JWT_SECRET || 'super-secret',
        expiresIn: '7d',
    },
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sl3',
    },
});
//# sourceMappingURL=configuration.js.map