const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');

const validators = require('../validators/deliverynote');
const controllers = require('../controllers/deliverynote');

const multer = require('multer');
const upload = multer({ 
    storage : multer.memoryStorage(),
    limits : { fileSize : 1 * 1024 * 1024 }, // 1 MB
    fileFilter : (req, file, cb) => {

        // Accept file if it is an image
        if (file.mimetype.startsWith('image/')){
          cb(null, true);
        } 
        else {
          cb(new Error('Only image files are allowed!'), false);
        }
    }
});

/**
 * @swagger
 * /api/v1/deliverynote/{id}:
 *   get:
 *     summary: Get a delivery note by ID or all delivery notes if no ID is provided
 *     tags: [DeliveryNote]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: false
 *         description: ID of the delivery note to retrieve. If not provided, all delivery notes will be returned.
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     responses:
 *       200:
 *         description: Delivery note retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/deliverynote' # When 'id' is set, return a single delivery note
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/deliverynote' # When 'id' is not set, return an array of delivery notes
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Delivery note not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id?', authMiddleware(), validators.getDeliveryNote, controllers.getDeliveryNote);

/**
 * @swagger
 * /api/v1/deliverynote/client/{client_id}:
 *   get:
 *     summary: Get delivery notes by client ID
 *     tags: [DeliveryNote]
 *     parameters:
 *       - name: client_id
 *         in: path
 *         required: true
 *         description: ID of the client to retrieve delivery notes for.
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     responses:
 *       200:
 *         description: Delivery notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/deliverynote' # Return an array of delivery notes for the client
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Client not found for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/client/:client_id', authMiddleware(), validators.getDeliveryNoteByClient, controllers.getDeliveryNoteByClient);

/**
 * @swagger
 * /api/v1/deliverynote/project/{project_id}:
 *   get:
 *     summary: Get delivery notes by project ID
 *     tags: [DeliveryNote]
 *     parameters:
 *       - name: project_id
 *         in: path
 *         required: true
 *         description: ID of the project to retrieve delivery notes for.
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     responses:
 *       200:
 *         description: Delivery notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/deliverynote' # Return an array of delivery notes for the project
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Project not found for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/project/:project_id', authMiddleware(), validators.getDeliveryNoteByProject, controllers.getDeliveryNoteByProject);

/*
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
*/

/**
 * @swagger
 * /api/v1/deliverynote:
 *   post:
 *     summary: Create a new delivery note
 *     tags: [DeliveryNote]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: string
 *                 description: ID of the project for the delivery note
 *                 example: 1234567890abcdef12345678
 *               data:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       description: Type of the item (person or material)
 *                       enum: [person, material]
 *                       example: person
 *                     name:
 *                       type: string
 *                       description: Name of the person or material
 *                       example: John Doe
 *                     quantity:
 *                       type: number
 *                       description: Hours worked or price of material
 *                       example: 10
 *     responses:
 *       201:
 *         description: Delivery note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/deliverynote' # Return the created delivery note
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Project not found for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authMiddleware(), validators.postDeliveryNote, controllers.postDeliveryNote);

/**
 * @swagger
 * /api/v1/deliverynote/pdf/{id}:
 *   get:
 *     summary: Get the PDF of a delivery note by ID
 *     tags: [DeliveryNote]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the delivery note to retrieve the PDF for.
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     responses:
 *       200:
 *         description: PDF of the delivery note retrieved successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *               description: PDF file of the delivery note
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Delivery note not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/pdf/:id', authMiddleware(), validators.getDeliveryNotePDF, controllers.getDeliveryNotePDF);

/**
 * @swagger
 * /api/v1/deliverynote/signature/{id}:
 *   put:
 *     summary: Upload a signature for a delivery note by ID
 *     tags: [DeliveryNote]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the delivery note to upload the signature for.
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file of the signature
 *     responses:
 *       200:
 *         description: Signature uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/deliverynote' # Return the updated delivery note with the signature
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Delivery note not found for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put(
    '/signature/:id', 
    authMiddleware(), 
    upload.single('file'), 
    (err, req, res, next) => err ? res.status(400).json({ errors : [err.message] }) : next(),
    validators.putDeliveryNoteSignature, controllers.putDeliveryNoteSignature
);

/**
 * @swagger
 * /api/v1/deliverynote/{id}:
 *   delete:
 *     summary: Delete a delivery note by ID
 *     tags: [DeliveryNote]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the delivery note to delete.
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     responses:
 *       200:
 *         description: Delivery note deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'OK'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Delivery note not found for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       409:
 *         description: Delivery note cannot be deleted because it is already signed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authMiddleware(), validators.deleteDeliveryNote, controllers.deleteDeliveryNote);

module.exports = router;