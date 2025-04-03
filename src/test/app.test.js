const supertest = require('supertest');
const { app, server } = require('../server');
const mongoose = require('mongoose');
const User = require('../models/user');

const api = supertest(app);

const security = require('../utils/security');

const initial_users = [
    {
        email : 'marcos@domain.ext',
        password : '123456',
        name : "John",
        lastname : "Doe",
        nif : "12345678Z",
        code : "85a9e4",
        validated : true,
        validation_attempts : 3
    }
];

let token
beforeAll(async () => {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    await User.deleteMany({})
    const password = await security.hash(initial_users[0].password)
    const body = initial_users[0]
    body.password = password
    const user_data = await User.create(body)
    user_data.set("password", undefined, { strict : false })
    token =  security.tokenSign(user_data, process.env.JWT_SECRET)
});

it('Should try the test endpoint', async () => {
    await api.get('/test')
    .expect(200)
    .expect('Content-Type', 'text/html; charset=utf-8');
});

describe('Users' , () => {
    it('should get user data', async () => {
        await api.get('/user')
        .auth(token, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });
});