const { try_catch } = require('wrappedjs');
const { matchedData } = require('express-validator');
const Client = require('../models/client');

// Get client by id (Or all clients)
module.exports.getClient = async (req, res, next) => {

    // Get validated client id
    const { id } = matchedData(req, { locations : ['body'] });

    // If no id is provided, find all clients for that user
    if(!id){

        const [find_clients_error, clients] = await try_catch(
            Client.find({ user_id : req.user._id, deleted : false })
        );

        if(find_clients_error){
            const error = new Error('Internal Server Error. Try again later');
            error.status = 500;
            next(error);
            return;
        }

        // Map clients data to new objects (Whitelist fields)
        res.status(200).json(
            clients.map(client => ({
                _id : client._id,
                user_id : client.user_id,
                email : client.email,
                name : client.name,
                lastname : client.lastname,
                address : client.address,
                createdAt : client.createdAt
            }))
        );
        return;
    }

    // Find the client with that id of the user and handle erros
    const [find_client_error, client] = await try_catch(
        Client.findOne({
            user_id : req.user._id,
            id : id,
            deleted : false
        })
    );

    if(find_client_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!client){
        res.status(404).json({ errors : [`Not Found. Client with id '${id}' not found for this user`] })
        return;
    }

    // Map client data to new object (Whitelist fields)
    res.status(200).json({
        _id : client._id,
        user_id : client.user_id,
        email : client.email,
        name : client.name,
        lastname : client.lastname,
        address : client.address,
        createdAt : client.createdAt
    });
}

// Upload client for a user
module.exports.postClient = async (req, res, next) => {

    // Get validatedclient data
    const { email, name, lastname, address } = matchedData(req, { locations : ['body'] });

    // Check if client already exists for the user (by email) and handle errors
    const [find_client_error, found_client] = await try_catch(
        Client.findOne({ user_id : req.user._id, email : email, deleted : false })
    );

    if(find_client_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(found_client){
        res.status(409).json({ 
            errors : [`Conflict. User already has a client with that email`], 
            client_id : found_client._id // Client id with that email might be of interest to the user
        });
        return;
    }

    // Post a new client for the user and handle errors
    const [create_client_error, created_client] = await try_catch(
        Client.create({
            user_id : req.user._id,
            email : email,
            name : name,
            lastname : lastname,
            address : address,
            deleted : false
        })
    );

    if(create_client_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    res.status(201).json({
        _id : created_client._id,
        user_id : created_client.user_id,
        email : created_client.email,
        name : created_client.name,
        lastname : created_client.lastname,
        address : created_client.address,
        createdAt : created_client.createdAt
    });
}

// Update client fields of a user
module.exports.patchClient = async (req, res, next) => {

    // Get validated client id
    const { id } = matchedData(req, { locations : ['params'] });

    // Get validated update client data
    const { email, name, lastname, address } = matchedData(req, { locations : ['body'] });

    // Create update object (Filtering null values to prevent unexpected updates)
    const update = Object.fromEntries(
        Object.entries({
            email : email,
            name : name,
            lastname : lastname,
            address : address
        })
        .filter(([_key, value]) => value != null)
    );

    // Update client for that user and handle errors
    const [update_client_error, update_client_result] = await try_catch(
        Client.updateOne({ _id : id, user_id : req.user._id, deleted : false }, update)
    );

    if(update_client_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(update_client_result.modifiedCount != 1){ // TODO - Check if any row was updated
        res.status(404).json({ errors : [`Not Found. Client with id '${id} not found for this user'`] });
        return;
    }

    res.status(200).json({ message : 'OK' })
}

// Delete client from user
module.exports.deleteClient = async (req, res, next) => {

    // Get validated client id
    const { id } = matchedData(req, { locations : ['params'] });

    // Get validated soft delete flag value
    const { soft } = matchedData(req, { locations : ['query'] });

    // Get client of the user and handle errors
    const [find_client_error, client] = await try_catch(
        Client.findOne({ _id : id, user_id : req.user._id })
    );

    if(find_client_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!client){
        res.status(404).json({ errors : ['Not Found. Client not found for this user'] });
        return;
    }

    // If 'soft' delete flag is up, just flag client as deleted
    if(soft){
        client.deleted = true;
        const [save_client_error, _] = await try_catch(client.save());

        if(save_client_error){
            const error = new Error('Internal Server Error. Try again later');
            error.status = 500;
            next(error);
            return;
        }

        res.status(200).json({ message : 'OK' });
        return;
    }

    // If soft flag is down, completely destroy the user
    const [delete_client_error, _] = await try_catch(client.deleteOne());

    if(delete_client_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    res.status(200).json({ message : 'OK' });
}

// Get archived clients of the user
module.exports.getClientArchive = async (req, res, next) => {

    // Find archived (soft deleted) clients of the user and handle errors
    const [find_archived_clients_error, archived_clients] = await try_catch(
        Client.find({ user_id : req.user._id, deleted : true })
    );

    if(find_archived_clients_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    res.status(200).json(
        archived_clients.map(client => ({
            _id : client._id,
            user_id : client.user_id,
            email : client.email,
            name : client.name,
            lastname : client.lastname,
            address : client.address,
            createdAt : client.createdAt
        }))
    );
}

// Restore archived client of the user
module.exports.putClientRestore = async (req, res, next) => {

    // Get validated client id
    const { id } = matchedData(req, { locations : ['params'] });

    // Get archived client of the user
    const [find_archived_client_error, archived_client] = await try_catch(
        Client.findOne({ _id : id, user_id : req.user._id, deleted : true })
    );

    if(find_archived_client_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!archived_client){
        res.status(404).json({ errros : ['Not Found. Client not found on the user\'s archive'] });
        return;
    }

    // Restore archived client and handle errors
    archived_client.deleted = false;
    const [save_client_error, _] = await try_catch(archived_client.save());

    if(save_client_error) {
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    res.status(200).json({ message : 'OK' });
}