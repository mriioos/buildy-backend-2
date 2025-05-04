const { Router } = require('express');
const multer = require('multer');
const upload = multer({ 
    storage : multer.memoryStorage(),
    limits : { fileSize : 2 * 1024 * 1024 } // 2MB max
});

const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

const validators = require('../validators/user');
const controllers = require('../controllers/user');

/**
 * @swagger
 * /api/v1/user/:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
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
 *               password:
 *                 type: string
 *                 example: 'password123'
 *                 required: true 
 *     responses:
 *       201:
 *         description: User created successfully. Email is sent to the user with a validation code to be used on PUT /api/v1/user/validation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
 *                   description: JWT token for the user
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: 'User already exists'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', validators.postUser, controllers.postUser);

/**
 * @swagger
 * /api/v1/user/validation:
 *   put:
 *     summary: Validate user account
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: '123456'
 *                 required: true
 *     responses:
 *       200:
 *         description: User account validated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
 *                   description: JWT token for the user
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         description: Invalid token or code. If maximum attempts are reached, the user is deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: 'Invalid code'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: 'User not found'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/validation', validators.putUserValidation, controllers.putUserValidation);

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: User login
 *     tags: [User]
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
 *               password:
 *                 type: string
 *                 example: 'password123'
 *                 required: true
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
 *                   description: JWT token for the user
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: 'Invalid email or password'
 *       404:
 *        description: User not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                errors:
 *                  type: array
 *                  items:
 *                    type: string
 *                    example: 'User not found'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/login', validators.postUserLogin, controllers.postUserLogin);

/**
 * @swagger
 * /api/v1/user/:
 *   patch:
 *     summary: Update user data
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'John'
 *                 required: false
 *               lastname:
 *                 type: string
 *                 example: 'Doe'
 *                 required: false
 *               nif:
 *                 type: string
 *                 example: '12345678A'
 *                 required: false
 *     responses:
 *       200:
 *         description: User data updated successfully
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
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/', authMiddleware(), validators.patchUser, controllers.patchUser);

/**
 * @swagger
 * /api/v1/user/company:
 *   put:
 *     summary: Update user company data
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company:
 *                 oneOf:
 *                 - type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: 'John Doe Co.'
 *                       required: true
 *                     cif:
 *                       type: string
 *                       example: 'A12345678'
 *                       required: true
 *                     address:
 *                       type: object
 *                       properties:
 *                         street:
 *                           type: string
 *                           example: 'Calle del Ejemplo'
 *                           required: true
 *                         number:
 *                           type: number
 *                           example: 42
 *                           required: true
 *                         postalCode:
 *                           type: number
 *                           example: 28001
 *                           required: true
 *                         city:
 *                           type: string
 *                           example: 'Madrid'
 *                           required: true
 *                         province:
 *                           type: string
 *                           example: 'Madrid'
 *                           required: true
 *                 - type: boolean
 *                   enum:
 *                     - false
 *                   example: false # self-employed
 *     responses:
 *       200:
 *         description: User company data updated successfully
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
 *        $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/company', authMiddleware(), validators.putUserCompany, controllers.putUserCompany);

/**
 * @swagger
 * /api/v1/user/logo:
 *   put:
 *     summary: Update user logo
 *     tags: [User]
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
 *                 required: true
 *     responses:
 *       200:
 *         description: User logo updated successfully
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
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/logo', authMiddleware(), upload.single('file'), validators.putUserLogo, controllers.putUserLogo);

/**
 * @swagger
 * /api/v1/user/:
 *   get:
 *     summary: Get user data
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *        $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authMiddleware(), validators.getUser, controllers.getUser);

/**
 * @swagger
 * /api/v1/user/:
 *   delete:
 *     summary: Delete user account
 *     tags: [User]
 *     parameters:
 *       - name: soft
 *         in: query
 *         required: false
 *         description: Soft delete the user account instead of hard delete
 *         schema:
 *           type: boolean
 *           example: true
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'OK'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/', authMiddleware(), validators.deleteUser, controllers.deleteUser);

/**
 * @swagger
 * /api/v1/user/recovery:
 *   post:
 *     summary: Request password recovery token
 *     tags: [User]
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
 *     responses:
 *       200:
 *         description: Password recovery token email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Password recovery token email sent successfully'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: 'User not found'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/recovery', validators.postUserRecovery, controllers.postUserRecovery);

/**
 * @swagger
 * /api/v1/user/password:
 *   put:
 *     summary: Change user password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: 'newpassword123'
 *                 required: true
 *     responses:
 *       200:
 *         description: User password changed successfully
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
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/password', authMiddleware(), validators.putUserPassword, controllers.putUserPassword);

/**
 * @swagger
 * /api/v1/user/company/guest:
 *   post:
 *     summary: Create a guest user for the company
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: 'jane.doe@domain.ext'
 *                 required: true
 *               password:
 *                 type: string
 *                 example: 'password123'
 *                 required: true
 *               name:
 *                 type: string
 *                 example: 'Jane'
 *                 required: false
 *               lastname:
 *                 type: string
 *                 example: 'Doe'
 *                 required: false
 *               nif:
 *                 type: string
 *                 example: '87654321B'
 *                 required: false
 *     responses:
 *       201:
 *         description: Guest user created successfully
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
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: 'User already exists'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/company/guest', authMiddleware(), validators.postUserCompanyGuest, controllers.postUserCompanyGuest);

module.exports = router;