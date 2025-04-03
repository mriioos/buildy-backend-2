require('dotenv').config();
const app = require('./app');

const server = app.listen(parseInt(process.env.PORT), () => {
    console.log(`Server running at ${process.env.DOMAIN} - Local port: ${process.env.PORT}`);
});

module.exports = { app, server };