const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');

const validators = require('../validators/client');
const controllers = require('../controllers/client');

/**
 * @swagger
 * /api/v1/client/{id}:
 *   get:
 *     summary: Get a client by ID or all clients if no ID is provided
 *     tags: [Client]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: false
 *         description: ID of the client to retrieve. If not provided, all clients will be returned.
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     responses:
 *       200:
 *         description: Client retrieved successfully
 *         content:
 *           application/json:
 *             schema: 
 *               oneOf:
 *                 - $ref: '#/components/schemas/client' # When 'id' is set, return a single client
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/client' # When 'id' is not set, return an array of clients
 *       400: 
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Client not found
 *         content: 
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', authMiddleware(), validators.getClient, controllers.getClient);

/**
 * @swagger
 * /api/v1/client/:
 *   post:
 *     summary: Post a new client for a user
 *     tags: [Client]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: 'john.doe@domain.ext'
 *                 required: true
 *                 description: 'Email of the client. Must be unique for the user.'
 *               name:
 *                 type: string
 *                 example: 'John'
 *                 required: true
 *                 description: 'Name of the client.'
 *               lastname:
 *                 type: string
 *                 example: 'Doe'
 *                 required: true
 *                 description: 'Last name of the client.'
 *               address:
 *                 type: string
 *                 example: 'Calle del Ejemplo, 123, 1ºA, 28001 Madrid (Spain)'
 *                 required: true
 *                 description: 'Address of the client.'
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema: 
 *               $ref: '#/components/schemas/client'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: User already has a client with that email
 *         content: 
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authMiddleware(), validators.postClient, controllers.postClient);

/**
 * @swagger
 * /api/v1/client/{id}:
 *   patch:
 *     summary: Update a client by ID
 *     tags: [Client]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the client to update
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: 'john.doe@domain.ext'
 *                 required: false
 *                 description: 'Email of the client. Must be unique for the user.'
 *               name:
 *                 type: string
 *                 example: 'John'
 *                 required: false
 *                 description: 'Name of the client.'
 *               lastname:
 *                 type: string
 *                 example: 'Doe'
 *                 required: false
 *                 description: 'Last name of the client.'
 *               address:
 *                 type: string
 *                 example: 'Calle del Ejemplo, 123, 1ºA, 28001 Madrid (Spain)'
 *                 required: false
 *                 description: 'Address of the client.'
 *     responses:
 *       200:
 *         description: Client updated successfully
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
 *         description: Client not found
 *         content: 
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id', authMiddleware(), validators.patchClient, controllers.patchClient);

/**
 * @swagger
 * /api/v1/client/{id}:
 *   delete:
 *     summary: Delete a client by ID
 *     tags: [Client]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the client to delete
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     query:
 *       - name: soft
 *         in: query
 *         required: false
 *         description: Soft delete the client (archive it) instead of hard delete
 *         schema:
 *           type: boolean
 *           example: true
 *     responses:
 *       200:
 *         description: Client deleted successfully
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
 *         description: Client not found
 *         content: 
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authMiddleware(), validators.deleteClient, controllers.deleteClient);

/**
 * @swagger
 * /api/v1/client/archived:
 *   get:
 *     summary: Get all archived clients for a user
 *     tags: [Client]
 *     responses:
 *       200:
 *         description: Archived clients retrieved successfully
 *         content:
 *           application/json:
 *             schema: 
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/client'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/archived', authMiddleware(), validators.getClientArchive, controllers.getClientArchive);

/**
 * @swagger 
 * /api/v1/client/{id}/restore:
 *   put:
 *     summary: Restore an archived client by ID
 *     tags: [Client]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the client to restore
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     responses:
 *       200:
 *         description: Client restored successfully
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
 *         description: Client not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id/restore', authMiddleware(), validators.putClientRestore, controllers.putClientRestore);

module.exports = router;