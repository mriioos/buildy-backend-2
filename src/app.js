require('./config/mongo')();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./docs/swagger');

// Import routers
const routes = require('./routes');

// App
const app = express();

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Middleware
app.use(express.json());

// Routes
app.use('/api', routes);

app.get('/api/test', (req, res) => {
    res.send('Hello World!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ errors : ['Unknown error'] });
});

module.exports = app;