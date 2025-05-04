const { select } = require('wrappedjs');
require('./config/mongo')();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./docs/swagger');
const { IncomingWebhook } = require('@slack/webhook');
const morganBody = require('morgan-body');

const webHook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL)
const loggerStream = {
    write: message => {
        webHook.send({
            text: message
        })
    },
}

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

morganBody(app, { 
    noColors: true, //limpiamos el String de datos lo máximo posible antes de mandarlo a Slack
    //skip: (req, res) => res.statusCode < 400, //Solo enviamos errores (4XX de cliente y 5XX de servidor)
    stream: loggerStream
});

app.use((err, req, res, next) => {

    // Upload error to Slack
    //loggerStream.write(err.message);

    // Select error message based on status code
    res.status(err.status || 500)
    .json({
        errors : [
            select(err.status, {
                500 : 'Internal Server Error',
                default : 'Unknown error'
            })
        ]
    });
});

module.exports = app;