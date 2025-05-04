const supertest = require('supertest');
const User = require('../models/user');
const Client = require('../models/client');
const Project = require('../models/project');
const DeliveryNote = require('../models/deliverynote');
const mongoose = require('mongoose');

const { app } = require('../server');
const security = require('../utils/security');

const api = supertest(app);

let token = null;
let user = null;
let client = null;
let project = null;
let deliverynote = null;

beforeAll(async () => {

    // Ensure DB is connected
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));

    // Create dummy user
    await User.deleteMany({ email : 'miguel12105marcos.deliverynote@gmail.com' });
    user = await User.create({
        email : 'miguel12105marcos.deliverynote@gmail.com',
        password : await security.hash('123456'),
        validated : true,
    });
    token = security.tokenSign(user);

    // Create dummy client
    await Client.deleteMany({ email : 'miguel12105marcos.deliverynote@gmail.com' });
    client = await Client.create({
        user_id : user._id,
        email : 'miguel12105marcos.deliverynote@gmail.com',
        name : 'Miguel',
        lastname : 'Rios',
        address : 'C/ Ejemplo 123',
        deleted : false
    });

    // Create dummy project
    await Project.deleteMany({ name : 'Sample Project (deliverynote)' });
    project = await Project.create({
        client_id : client._id,
        name : 'Sample Project (deliverynote)',
        description : 'Project for testing',
        deleted : false
    });

    // Create dummy delivery note
    await DeliveryNote.deleteMany({});
    deliverynote = await DeliveryNote.create({
        project_id : project._id,
        data : [{
            type : 'person',
            name : 'John Doe',
            quantity : 5
        }],
        signature : null,
        deleted : false
    });
});

describe('DeliveryNote routes', () => {

    it('GET /api/deliverynote/:id - should return a delivery note by ID', async () => {
        await api.get(`/api/deliverynote/${deliverynote._id.toString()}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('POST /api/deliverynote - should create a new delivery note', async () => {
        await api.post('/api/deliverynote').send({
            project_id : project._id.toString(),
            data : [{
                type : 'material',
                name : 'Cement',
                quantity : 10
            }],
            signature : null,
            deleted : false
        })
        .set('authorization', `Bearer ${token}`)
        .expect(201);
    });

    it('GET /api/deliverynote/client/:client_id - should return delivery notes by client ID', async () => {
        await api.get(`/api/deliverynote/client/${client._id.toString()}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('GET /api/deliverynote/project/:project_id - should return delivery notes by project ID', async () => {
        await api.get(`/api/deliverynote/project/${project._id.toString()}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('GET /api/deliverynote/pdf/:id - should return a delivery note PDF by ID', async () => {
        await api.get(`/api/deliverynote/pdf/${deliverynote._id.toString()}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('PUT /api/deliverynote/signature/:id - should upload a signature', async () => {
        await api.put(`/api/deliverynote/signature/${deliverynote._id.toString()}`)
        .attach('file', Buffer.from('fake-signature'), 'signature.png')
        .set('authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('DELETE /api/deliverynote/:id - should archive a delivery note', async () => {
        await api.delete(`/api/deliverynote/${deliverynote._id.toString()}`)
        .set('authorization', `Bearer ${token}`)
        .query({ soft : true })
        .expect(409); // Conflict is okay, because the delivery note is signed
    });

});
