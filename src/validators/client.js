const { header, body, query, param } = require('express-validator');
const validateResults = require('../utils/validateResult');

module.exports.getClient = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('id').optional().trim().isMongoId().withMessage('id is required'),
    validateResults,
];

module.exports.postClient = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    body('email').trim().isEmail().withMessage("'email' field must be a valid email"),
    body('name').trim().notEmpty().withMessage("'name' field must not be empty"),
    body('lastname').trim().notEmpty().withMessage("'lastname' field must not be empty"),
    body('address').trim().notEmpty().withMessage("'address' field must not be empty"),
    validateResults,
];

module.exports.patchClient = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('id').trim().isMongoId().withMessage("'id' field is required"),
    body('email').optional().trim().isEmail().withMessage("'email' field must be a valid email"),
    body('name').optional().trim().notEmpty().withMessage("'name' field must not be empty"),
    body('lastname').optional().trim().notEmpty().withMessage("'lastname' field must not be empty"),
    body('address').optional().trim().notEmpty().withMessage("'address' field must not be empty"),
    validateResults,
];

module.exports.deleteClient = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('id').trim().isMongoId().withMessage('id is required'),
    query('soft').optional().default(true).isBoolean().withMessage("'soft' query param must be a boolean"),
    validateResults,
];

module.exports.getClientArchive = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    validateResults,
];

module.exports.putClientRestore = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('id').trim().isMongoId().withMessage('id is required'),
    validateResults,
];