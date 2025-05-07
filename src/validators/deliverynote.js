const { header, param, body, query } = require('express-validator');
const validateResults = require('../utils/validateResult');

module.exports.getDeliveryNote = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('id').optional().notEmpty().isMongoId().withMessage('Valid id is required'),
    validateResults
];

module.exports.getDeliveryNoteByClient = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('client_id').notEmpty().isMongoId().withMessage('Valid id is required'),
    validateResults
];

module.exports.getDeliveryNoteByProject = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('project_id').notEmpty().isMongoId().withMessage('Valid id is required'),
    validateResults
];

module.exports.postDeliveryNote = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    body('project_id').trim().isMongoId().withMessage("'project_id' field must be a valid ID"),
    body('data').isArray().withMessage("'data' field must be an array"),
    body('data.*').isObject().withMessage("'data' field must be an array of objects").bail()
    .custom((value, { req }) => {

        if(typeof value.type !== 'string') {
            throw new Error("'data.[n].type' field must be a string. '${value.type}' found as type '${typeof value.type}'");
        }

        if(!['person', 'material'].includes(value.type)) {
            throw new Error("'data.[n].type' field must be 'person' or 'material'. '${value.type}' found");
        }

        if(typeof value.name !== 'string') {
            throw new Error("'data.[n].name' field must be a string. '${value.name}' found as type '${typeof value.name}'");
        }

        if(value.name.trim() === '') {
            throw new Error("'data.[n].name' field must not be empty. '${value.name}' found empty or white");
        }

        if(typeof value.quantity !== 'number') {
            throw new Error("'data.[n].quantity' field must be a number. '${value.quantity}' found as type '${typeof value.quantity}'");
        }

        if(value.quantity <= 0) {
            throw new Error("'data.[n].quantity' field must be greater than 0. '${value.quantity}' found");
        }

        return true;
    }),
    validateResults
];

module.exports.getDeliveryNotePDF = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('id').notEmpty().isMongoId().withMessage('Valid id is required'),
    validateResults
];

module.exports.putDeliveryNoteSignature = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('id').notEmpty().isMongoId().withMessage('Valid id is required'),
    validateResults
];

module.exports.deleteDeliveryNote = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('id').notEmpty().isMongoId().withMessage('Valid id is required'),
    validateResults,
    query('soft').optional().default(true).isBoolean().withMessage("'soft' query param must be a boolean").toBoolean(),
];