export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sl3_beta',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret',
    expiresIn: '1d',
  },
});
