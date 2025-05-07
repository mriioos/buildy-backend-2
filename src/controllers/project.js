const { try_catch } = require('wrappedjs');
const { matchedData } = require('express-validator');
const Project = require('../models/project');
const Client = require('../models/client');

// Get a projects of a user (from all their clients) by id
module.exports.getProject = async (req, res) => {

    // Get validated project id
    const { id } = matchedData(req, { locations : ['params'] });

    // If no id is provided get all projectss
    if(!id){

        // Get all clients of the user
        const [find_clients_error, clients] = await try_catch(
            Client.find({ user_id : req.user._id, deleted : false })
        );

        if(find_clients_error){
            const error = new Error('Internal Server Error. Try again later');
            error.status = 500;
            next(error);
            return;
        }

        // For each client of the user, get all projects
        const [find_projects_error, projects_per_client] = await try_catch(
            Promise.all(
                clients.map(client => Project.find({ client_id : client._id, deleted : false }))
            )
        );

        if(find_projects_error){
            const error = new Error('Internal Server Error. Try again later');
            error.status = 500;
            next(error);
            return;
        }
        
        const projects = projects_per_client.flat()

        res.status(200).json(
            projects.map(project => ({
                _id : project._id,
                client_id : project.client_id,
                name : project.name,
                description : project.description,
                createdAt : project.createdAt
            }))
        );
        return;
    }

    // Find project of that user by id and handle errors
    const [find_project_error, project] = await try_catch(
        Project.findOne({ _id : id, deleted : false })
    );

    if(find_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!project){
        res.status(404).json({ errors : [`Not Found. Project with id '${id}' not found for this user`] });
        return;
    }

    // Check if the client owner of the project is a client of the user
    const [find_client_error, client] = await try_catch(
        Client.findOne({ _id : project.client_id, user_id : req.user._id, deleted : false })
    );

    if(find_client_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!client){
        res.status(404).json({ errors : [`Not Found. Project with id '${id}' not found for this user`] });
        return;
    }

    res.status(200).json({
        _id : project._id,
        client_id : project.client_id,
        name : project.name,
        description : project.description,
        createdAt : project.createdAt
    });
}

// Get the projects of a client
module.exports.getProjectByClient = async (req, res) => {

    // Get validated client id
    const { client_id } = matchedData(req, { locations : ['params'] });

    // Find client of the user by id and handle errors
    const [get_client_error, client] = await try_catch(
        Client.findOne({ _id : client_id, user_id : req.user._id, deleted : false })
    );

    if(get_client_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!client){
        res.status(404).json({ errors : [`Not Found. Client with id '${client_id}' not found for this user`] });
        return;
    }

    // Find projects of the client
    const [get_client_projects_error, client_projects] = await try_catch(
        Project.find({ client_id : client_id, deleted : false })
    );

    if(get_client_projects_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    res.status(200).json(
        client_projects.map(project => ({
            _id : project._id,
            client_id : project.client_id,
            name : project.name,
            description : project.description,
            createdAt : project.createdAt
        }))
    );
}

// Create a new project
module.exports.postProject = async (req, res) => {

    // Get validated project data
    const { client_id, name, description } = matchedData(req, { locations : ['body'] });

    // Find client of the user by id and handle errors
    const [get_client_error, client] = await try_catch(
        Client.findOne({ _id : client_id, user_id : req.user._id, deleted : false })
    );

    if(get_client_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!client){
        res.status(404).json({ errors : [`Not Found. Client with id '${client_id}' not found for this user`] });
        return;
    }

    // Validate that the project name is unique for the client
    const [get_project_error, existing_project] = await try_catch(
        Project.findOne({ client_id : client_id, name : name, deleted : false })
    );

    if(get_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(existing_project){
        res.status(409).json({ errors : [`Conflict. Project with name '${name}' already exists for this client`] });
        return;
    }

    // Create new project for the client of the user
    const [create_project_error, created_project] = await try_catch(
        Project.create({
            client_id : client_id,
            name : name,
            description : description
        })
    );

    if(create_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    res.status(201).json({
        _id : created_project._id,
        client_id : created_project.client_id,
        name : created_project.name,
        description : created_project.description,
        createdAt : created_project.createdAt
    });
}

// Update a project
module.exports.patchProject = async (req, res) => {
    
    // Get validated project data
    const { id, client_id, name, description } = matchedData(req, { locations : ['params', 'body'] });

    // Find project of the user by id and handle errors
    const [get_project_error, project] = await try_catch(
        Project.findOne({ _id : id, deleted : false })
    );

    if(get_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!project){
        res.status(404).json({ errors : [`Not Found. Project with id '${id}' not found for this user`] });
        return;
    }

    // Validate that the client owner of the project is client of the user
    const [get_origin_client_error, origin_client] = await try_catch(
        Client.findOne({ _id : project.client_id, user_id : req.user._id, deleted : false })
    );

    if(get_origin_client_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!origin_client){
        res.status(404).json({ errors : [`Not Found. Project with id '${id}' not found for this user`] }); // Only notify that the project is not found, not the client, to avoid exposing the client id
        return;
    }

    // Validate that the client id is a client of the user
    let target_client = origin_client; // Initialize target_client to null
    if(client_id && client_id !== project.client_id.toString()){
        const [get_target_client_error, target_client_aux] = await try_catch(
            Client.findOne({ _id : client_id, user_id : req.user._id, deleted : false })
        );

        target_client = target_client_aux; // Assign the result to target_client

        if(get_target_client_error){
            const error = new Error('Internal Server Error. Try again later');
            error.status = 500;
            next(error);
            return;
        }

        if(!target_client){
            res.status(404).json({ errors : [`Not Found. Client with id '${client_id}' not found for this user`] });
            return;
        }

        // Validate that the project name is not already taken by another project of the target client
        const [get_existing_project_error, existing_project] = await try_catch(
            Project.findOne({ client_id : target_client._id, name : name, deleted : false })
        );

        if(get_existing_project_error){
            const error = new Error('Internal Server Error. Try again later');
            error.status = 500;
            next(error);
            return;
        }

        if(existing_project){
            res.status(409).json({ errors : [`Conflict. Project with name '${name}' already exists for the target client with id '${client_id}'`] });
            return;
        }
    }

    // Update project data
    project.client_id = target_client._id || project.client_id;
    project.name = name || project.name;    
    project.description = description || project.description;   

    const [save_project_error, saved_project] = await try_catch(
        project.save()
    );

    if(save_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    res.status(200).json({
        _id : saved_project._id,
        client_id : saved_project.client_id,
        name : saved_project.name,
        description : saved_project.description,
        createdAt : saved_project.createdAt
    });
}

// Delete a project (or mark as deleted)
module.exports.deleteProject = async (req, res) => {
    
    // Get validated project id
    const { id } = matchedData(req, { locations : ['params'] });

    // Get soft delete query param
    const { soft } = matchedData(req, { locations : ['query'] });

    // Find project of the user by id and handle errors
    const [get_project_error, project] = await try_catch(
        Project.findOne({ _id : id, deleted : false })
    );

    if(get_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!project){
        res.status(404).json({ errors : [`Not Found. Project with id '${id}' not found for this user`] });
        return;
    }

    // Validate that the client owner of the project is client of the user
    const [get_client_error, client] = await try_catch(
        Client.findOne({ _id : project.client_id, user_id : req.user._id, deleted : false })
    );

    if(get_client_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!client){
        res.status(404).json({ errors : [`Not Found. Project with id '${id}' not found for this user`] }); // Only notify that the project is not found, not the client, to avoid exposing the client id
        return;
    }

    // If 'soft' delete flag is up, just flag project as deleted
    if(soft){
        project.deleted = true;
        const [save_project_error, _] = await try_catch(project.save());

        if(save_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
            return;
        }

        res.status(200).json({ message : 'OK' });
        return;
    }

    // If soft flag is down, completely destroy the project
    const [delete_project_error, _] = await try_catch(project.deleteOne());

    if(delete_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    res.status(200).json({ message : 'OK. This action cannot be undone' });
}

// Get archived projects of the user
module.exports.getProjectArchive = async (req, res) => {

    console.log('Llega 1');

    // Find user clients and handle errors
    const [find_clients_error, clients] = await try_catch(
        Client.find({ user_id : req.user._id, deleted : false })
    );

    if(find_clients_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    // For each client of the user, get all archived projects
    const [find_projects_error, projects_per_client] = await try_catch(
        Promise.all(
            clients.map(client => Project.find({ client_id : client._id, deleted : true }))
        )
    );

    if(find_projects_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    const projects = projects_per_client.flat()

    res.status(200).json(
        projects.map(project => ({
            _id : project._id,
            client_id : project.client_id,
            name : project.name,
            description : project.description,
            createdAt : project.createdAt
        }))
    );
}

// Get archived projects of a client of the user
module.exports.getProjectArchiveByClient = async (req, res) => {

    // Get validated client id
    const { client_id } = matchedData(req, { locations : ['params'] });

    // Find client of the user by id and handle errors
    const [get_client_error, client] = await try_catch(
        Client.findOne({ _id : client_id, user_id : req.user._id, deleted : false })
    );

    if(get_client_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!client){
        res.status(404).json({ errors : [`Not Found. Client with id '${client_id}' not found for this user`] });
        return;
    }

    // Find archived projects of the client
    const [get_client_projects_error, client_projects] = await try_catch(
        Project.find({ client_id : client_id, deleted : true })
    );

    if(get_client_projects_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    res.status(200).json(
        client_projects.map(project => ({
            _id : project._id,
            client_id : project.client_id,
            name : project.name,
            description : project.description,
            createdAt : project.createdAt
        }))
    );
}

// Restore archived project of the user
module.exports.putProjectRestore = async (req, res) => {

    // Get validated project id
    const { id } = matchedData(req, { locations : ['params'] });

    // Find archived project of the user by id and handle errors
    const [get_project_error, project] = await try_catch(
        Project.findOne({ _id : id, deleted : true })
    );

    if(get_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!project){
        res.status(404).json({ errors : [`Not Found. Project with id '${id}' not found for this user`] });
        return;
    }

    // Validate that the client owner of the project is client of the user
    const [get_client_error, client] = await try_catch(
        Client.findOne({ _id : project.client_id, user_id : req.user._id, deleted : false })
    );

    if(get_client_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!client){
        res.status(404).json({ errors : [`Not Found. Project with id '${id}' not found for this user`] }); // Only notify that the project is not found, not the client, to avoid exposing the client id
        return;
    }

    // Restore archived project and handle errors
    project.deleted = false;
    const [save_project_error, _] = await try_catch(project.save());

    if(save_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    res.status(200).json({ message : 'OK' });
}