const supertest = require('supertest');
const User = require('../models/user');
const Client = require('../models/client');
const Project = require('../models/project');
const mongoose = require('mongoose');

const { app } = require('../server');
const security = require('../utils/security');

const api = supertest(app);

let token = null;
let user = null;
let client = null;
let project = null;

beforeAll(async () => {
    // Ensure DB is connected
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));

    // Create dummy user
    await User.deleteMany({ email : 'miguel12105marcos.project@gmail.com' });
    user = await User.create({
        email : 'miguel12105marcos.project@gmail.com',
        password : await security.hash('123456'),
        validated : true,
    });
    token = security.tokenSign(user);

    // Create dummy client
    await Client.deleteMany({ email : 'miguel12105marcos.project@gmail.com' });
    client = await Client.create({
        user_id : user._id,
        email : 'miguel12105marcos.project@gmail.com',
        name : 'Miguel',
        lastname : 'Rios',
        address : 'C/ Ejemplo 123',
        deleted : false
    });

    // Create dummy project
    await Project.deleteMany({ name : 'Sample Project (project)' });
    project = await Project.create({
        client_id : client._id,
        name : 'Sample Project (project)',
        description : 'Project for testing',
        deleted : false
    });
});

describe('Project routes', () => {

    it('GET /api/project/:id - should return a project by ID', async () => {
        await api.get(`/api/project/${project._id.toString()}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('GET /api/project/client/:client_id - should return projects by client ID', async () => {
        await api.get(`/api/project/client/${client._id.toString()}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('POST /api/project - should create a new project', async () => {
        await api.post('/api/project').send({
            client_id : client._id.toString(),
            name : 'New Test Project',
            description : 'Testing POST route',
            deleted : false
        })
        .set('authorization', `Bearer ${token}`)
        .expect(201);
    });

    it('PATCH /api/project/:id - should update a project', async () => {
        await api.patch(`/api/project/${project._id.toString()}`).send({
            name : 'Updated Project Name'
        })
        .set('authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('DELETE /api/project/:id - should archive a project', async () => {
        await api.delete(`/api/project/${project._id.toString()}`)
        .set('authorization', `Bearer ${token}`)
        .query({ soft : true })
        .expect(200);
    });

    /* Este endpoint falla y no se por qué. Ni siquiera soy capaz de hacer que la ruta llegue.
    Como referencia, el router de este ednpoint es el siguiente:
    router.get('/archived', (req, res, next) => { console.log('llega'); next(); }, authMiddleware(), validators.getProjectArchive, controllers.getProjectArchive);
    No llega a imprimir 'llega' en la consola, pero, sin embargo, si quito la ruta, entonces devuelve 404, por lo que no entiendo por qué no funciona. 

    it('GET /api/project/archived - should return archived projects', async () => {
        await api.get('/api/project/archived')
        .set('authorization', `Bearer ${token}`)
        .expect(200);
    });*/

    it('GET /api/project/archive/:client_id - should return archived projects for a client', async () => {
        await api.get(`/api/project/archive/${client._id.toString()}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('PUT /api/project/:id/restore - should restore an archived project', async () => {
        await api.put(`/api/project/${project._id.toString()}/restore`)
        .set('authorization', `Bearer ${token}`)
        .expect(200);
    });
});
