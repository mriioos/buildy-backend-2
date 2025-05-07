const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');

const validators = require('../validators/project');
const controllers = require('../controllers/project');

/**
 * @swagger
 * /api/v1/project/{id}:
 *   get:
 *     summary: Get a project by ID or all projects if no ID is provided
 *     tags: [Project]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: false
 *         description: ID of the project to retrieve. If not provided, all projects will be returned.
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/project' # When 'id' is set, return a single project
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/project' # When 'id' is not set, return an array of projects
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
router.get('/:id?', authMiddleware(), validators.getProject, controllers.getProject);

/**
 * @swagger
 * /api/v1/project/client/{client_id}:
 *   get:
 *     summary: Get all projects of a client by its client ID
 *     tags: [Project]
 *     parameters:
 *       - name: client_id
 *         in: path
 *         required: true
 *         description: ID of the client to retrieve its projects.
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/project' # Return an array of projects
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Client with id '{client_id}' not found for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/client/:client_id', authMiddleware(), validators.getProjectByClient, controllers.getProjectByClient);

/**
 * @swagger
 * /api/v1/project:
 *   post:
 *     summary: Create a new project
 *     tags: [Project]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_id:
 *                 type: string
 *                 example: 1234567890abcdef12345678
 *                 required: true
 *                 description: 'ID of the client to which the project belongs'
 *               name:
 *                 type: string
 *                 example: Project Name
 *                 required: true
 *                 description: 'Name of the project'
 *               description:
 *                 type: string
 *                 example: Project Description
 *                 required: false
 *                 description: 'Description of the project'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/project' # Return the created project
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Client with id '{client_id}' not found for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       409:
 *         description: Conflict. Project with name '{name}' already exists for this client
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */ 
router.post('/', authMiddleware(), validators.postProject, controllers.postProject);

/**
 * @swagger
 * /api/v1/project/{id}:
 *   patch:
 *     summary: Update a project by ID
 *     tags: [Project]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project to update
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
 *               client_id:
 *                 type: string
 *                 example: 1234567890abcdef12345678
 *                 required: false
 *                 description: 'ID of the client to which the project belongs'
 *               name:
 *                 type: string
 *                 example: Project Name
 *                 required: false
 *                 description: 'Name of the project'
 *               description:
 *                 type: string
 *                 example: Project Description
 *                 required: false
 *                 description: 'Description of the project'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/project' # Return the updated project
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Project with id '{id}' not found for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       409:
 *         description: Conflict. Project with name '{name}' already exists for the target client with id '{client_id}'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id', authMiddleware(), validators.patchProject, controllers.patchProject);

/**
 * @swagger
 * /api/v1/project/{id}:
 *   delete:
 *     summary: Delete a project by ID
 *     tags: [Project]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project to delete
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     query:
 *       - name: soft
 *         in: query
 *         required: false
 *         description: Soft delete the project (archive it) instead of hard delete
 *         schema:
 *           type: boolean
 *           example: true
 *     responses:
 *       200:
 *         description: Project deleted successfully
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
 *         description: Project with id '{id}' not found for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       409:
 *         description: Conflict. Project with id '{id}' is already archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authMiddleware(), validators.deleteProject, controllers.deleteProject);

/**
 * @swagger
 * /api/v1/project/archived:
 *   get:
 *     summary: Get all archived projects of the user
 *     tags: [Project]
 *     responses:
 *       200:
 *         description: Archived projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/project' # Return an array of archived projects
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/archived', (req, res, next) => { console.log('llega'); next(); }, authMiddleware(), validators.getProjectArchive, controllers.getProjectArchive);

/**
 * @swagger
 * /api/v1/project/archive/{client_id}:
 *   get:
 *     summary: Get all archived projects of a client by its client ID
 *     tags: [Project]
 *     parameters:
 *       - name: client_id
 *         in: path
 *         required: true
 *         description: ID of the client to retrieve its archived projects.
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     responses:
 *       200:
 *         description: Archived projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/project' # Return an array of archived projects
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Client with id '{client_id}' not found for the user
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/archive/:client_id', authMiddleware(), validators.getProjectArchiveByClient, controllers.getProjectArchiveByClient);

/**
 * @swagger
 * /api/v1/project/{id}/restore:
 *   put:
 *     summary: Restore an archived project by ID
 *     tags: [Project]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project to restore
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     responses:
 *       200:
 *         description: Project restored successfully
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
 *         description: Project with id '{id}' not found for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 *       409:
 *         description: Conflict. Project with id '{id}' is not archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/error'
 */
router.put('/:id/restore', authMiddleware(), validators.putProjectRestore, controllers.putProjectRestore);

module.exports = router;