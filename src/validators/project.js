const { header, param, body, query } = require('express-validator');
const validateResults = require('../utils/validateResult');

module.exports.getProject = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('id').optional().notEmpty().isMongoId().withMessage('Valid id is required'),
    validateResults
];

module.exports.getProjectByClient = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('client_id').notEmpty().isMongoId().withMessage('Valid id is required'),
    validateResults
];

module.exports.postProject = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    body('client_id').trim().isMongoId().withMessage("'client_id' field must be a valid ID"),
    body('name').trim().notEmpty().withMessage("'name' field must not be empty"),
    body('description').optional().trim().isString().withMessage("'description' field must be a string"),
    validateResults
];

module.exports.patchProject = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('id').notEmpty().isMongoId().withMessage('id is required'),
    body('client_id').optional().trim().isMongoId().withMessage("'client_id' field must be a valid ID"),
    body('name').optional().trim().notEmpty().withMessage("'name' field must not be empty"),
    body('description').optional().trim().isString().withMessage("'description' field must be a string"),
    validateResults
];

module.exports.deleteProject = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('id').notEmpty().isMongoId().withMessage('id is required'),
    query('soft').optional().default(true).isBoolean().withMessage("'soft' query param must be a boolean"),
    validateResults
];

module.exports.getProjectArchive = [ // All archived projects for any client of the user
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    validateResults
];

module.exports.getProjectArchiveByClient = [ // All projects for a client of a user
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('client_id').optional().notEmpty().isMongoId().withMessage('client_id is required'),
    validateResults
];

module.exports.putProjectRestore = [
    header('authorization').trim()
    .customSanitizer(value => value.startsWith('Bearer ') ? value.replace(/^Bearer\s/, '') : value)
    .isJWT(),
    param('id').notEmpty().isMongoId().withMessage('id is required'),
    validateResults
];