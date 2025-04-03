const fs = require('fs');
const path = require('path');

const router = require('express').Router();

fs.readdirSync(__dirname).forEach(file => {
    if (file !== 'index.js' && file.endsWith('.js')) {
        const modulePath = path.join(__dirname, file);
        router.use(`/${file.slice(0, -3)}`, require(modulePath));
        //module.exports[file.slice(0, -3)] = require(modulePath);
    }
});

module.exports = router;