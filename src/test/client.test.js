const supertest = require('supertest');
const User = require('../models/user');
const Client = require('../models/client');
const mongoose = require('mongoose');

const { app } = require('../server');
const security = require('../utils/security');

const api = supertest(app);

/*
const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
        minlength : 8
    },
    validation_attempts : {
        type : Number,
        default : 3
    },
    validation_code : {
        type : String,
        default : () => Math.random().toString(16).substring(2, 8), // Genera un número aleatorio en base 16
        length : 6
    },
    validated : {
        type : Boolean,
        default : false
    },
    role : {
        type : String,
        default : 'user'
    },
    name : {
        type : String,
        required : false
    },
    lastname : {
        type : String,
        required : false
    },
    nif : {
        type : String,
        required : false
    },
    logo : {
        type : String,
        required : false
    },
    company : {
        type : Object,
        required : false,
        default : {}
    },
    deleted : {
        type : Boolean,
        default : false
    }
},
{
    timestamps : true,
    versionKey : false
});
*/

// Create a user and get a token for authentication
let token = null;
let user = null;
let client = null;
beforeAll(async () => {

    // Create dummy user
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    await User.deleteMany({ email : 'miguel12105marcos.client@gmail.com' });
    user = await User.create({
        email : 'miguel12105marcos.client@gmail.com',
        password : await security.hash('123456'),
        validated : true,
    });

    token = security.tokenSign(user);

    // Create dummy client
    await Client.deleteMany({ email : 'miguel12105marcos.client@gmail.com' });
    client = await Client.create({
        user_id : user._id,
        email : 'miguel12105marcos.client@gmail.com',
        name : 'Miguel',
        lastname : 'Rios',
        address : 'C/ Ejemplo 123',
        deleted : false
    });
});

describe('Client routes', () => {

    it('Should log the client', async () => {
        console.log(client);
    });

    it('GET /api/client/:id - should return a client by ID', async () => {
        api.get(`/api/client/${client._id.toString()}`)
        .set('authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('POST /api/client - should create a new client', async () => {
        api.post('/api/client').send({
            user_id : user._id.toString(),
            email : 'riosmarcosmiguel@gmail.com',
            name : 'Miguel',
            lastname : 'Rios',
            address : 'C/ Ejemplo 123',
            deleted : false
        })
        .set('authorization', `Bearer ${token}`)
        .expect(201)
    });

    it('PATCH /api/client/:id - should update a client', async () => {
        api.patch('/api/client/123').send({ name : 'John' })
        .set('authorization', `Bearer ${token}`)
        .expect(200)
    });

    it('DELETE /api/client/:id - should archive a client', async () => {
        api.delete(`/api/client/${client._id.toString()}`)
        .set('authorization', `Bearer ${token}`)
        .query({ soft : true })
        .expect(200);
    });

    it('GET /api/client/archived - should return archived clients', async () => {
        api.get('/api/client/archived')
        .set('authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('PUT /api/client/:id/restore - should restore an archived client', async () => {
        api.put(`/api/client/${client._id.toString()}/restore`)
        .set('authorization', `Bearer ${token}`)
        .expect(200);
    });
});