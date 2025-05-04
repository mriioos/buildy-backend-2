const { try_catch } = require('wrappedjs');
const { matchedData } = require('express-validator');
const PDFKit = require('pdfkit');

const Project = require('../models/project');
const Client = require('../models/client');
const DeliveryNote = require('../models/deliverynote');

const ipfs = require('../utils/handleIPFS');


// router.get('/:id', authMiddleware(), validators.getDeliveryNote, controllers.getDeliveryNote);
// Find delivery note by id (Or all delivery notes)
module.exports.getDeliveryNote = async (req, res, next) => {

    // Get validated delivery note id
    const { id } = matchedData(req, { locations : ['params'] });

    // If no id is provided, find all delivery notes for that user
    if(!id){

        // Find user clients
        const [find_clients_error, clients] = await try_catch(
            Client.find({ user_id : req.user._id, deleted : false })
        );

        if(find_clients_error){
            const error = new Error('Internal Server Error. Try again later');
            error.status = 500;
            next(error);
            return;
        }

        // Find each client's projects
        const [find_projects_error, projects] = await try_catch(
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

        const all_projects = projects.flat();

        // Find all delivery notes for each project
        const [find_delivery_notes_error, delivery_notes] = await try_catch(
            Promise.all(
                all_projects.map(project => DeliveryNote.find({ project_id : project._id, deleted : false }))
            )
        );

        if(find_delivery_notes_error){
            const error = new Error('Internal Server Error. Try again later');
            error.status = 500;
            next(error);
            return;
        }

        const all_delivery_notes = delivery_notes.flat();

        // Map delivery notes data to new objects (Whitelist fields)
        res.status(200).json(
            all_delivery_notes.map(delivery_note => ({
                _id : delivery_note._id,
                project_id : delivery_note.project_id,
                data : delivery_note.data,
                signature : delivery_note.signature,
                createdAt : delivery_note.createdAt
            }))
        );

        return;
    }

    // Find the delivery note with that id of the user and handle erros
    const [find_delivery_note_error, delivery_note] = await try_catch(
        DeliveryNote.findOne({
            _id : id,
            deleted : false
        })
    );

    if(find_delivery_note_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!delivery_note){
        res.status(404).json({ errors : [`Not Found. Delivery note with id '${id}' not found for this user`] })
        return;
    }

    // Find the project of the delivery note
    const [find_project_error, project] = await try_catch(
        Project.findOne({
            _id : delivery_note.project_id,
            deleted : false
        })
    );

    if(find_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!project){
        res.status(404).json({ errors : [`Not Found. Delivery note with id '${id}' not found`] }) // Only notify that the delivery note was not found to not leak information about the project
        return;
    }

    // Find the client owner of the project
    const [find_client_error, client] = await try_catch(
        Client.findOne({
            _id : project.client_id,
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
        res.status(404).json({ errors : [`Not Found. Delivery note with id '${id}' not found`] }) // Only notify that the delivery note was not found to not leak information about the client
        return;
    }

    // Map delivery note data to new object (Whitelist fields)
    res.status(200).json({
        _id : delivery_note._id,
        project_id : delivery_note.project_id,
        data : delivery_note.data,
        signature : delivery_note.signature,
        createdAt : delivery_note.createdAt
    });
};

// Find delivery notes by client id 
module.exports.getDeliveryNoteByClient = async (req, res, next) => {

    // Get validated client id
    const { client_id } = matchedData(req, { locations : ['params'] });

    // Find the client with that id of the user and handle erros
    const [find_client_error, client] = await try_catch(
        Client.findOne({
            _id : client_id,
            user_id : req.user._id,
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
        res.status(404).json({ errors : [`Not Found. Client with id '${client_id}' not found for this user`] })
        return;
    }

    // Find each client's projects
    const [find_projects_error, projects] = await try_catch(
        Project.find({ client_id : client._id, deleted : false })
    );

    if(find_projects_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    // Find all delivery notes for each project of the client
    const [find_delivery_notes_error, delivery_notes] = await try_catch(
        Promise.all(
            projects.map(project => DeliveryNote.find({ project_id : project._id, deleted : false }))
        )
    );

    if(find_delivery_notes_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    const all_delivery_notes = delivery_notes.flat();

    // Map delivery notes data to new objects (Whitelist fields)
    res.status(200).json(
        all_delivery_notes.map(delivery_note => ({
            _id : delivery_note._id,
            project_id : delivery_note.project_id,
            data : delivery_note.data,
            signature : delivery_note.signature,
            createdAt : delivery_note.createdAt
        }))
    );
}

// Find delivery notes by project id
module.exports.getDeliveryNoteByProject = async (req, res, next) => {

    // Get validated project id
    const { project_id } = matchedData(req, { locations : ['params'] });

    // Find the project with that id
    const [find_project_error, project] = await try_catch(
        Project.findOne({
            _id : project_id,
            deleted : false
        })
    );

    if(find_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!project){
        res.status(404).json({ errors : [`Not Found. Project with id '${project_id}' not found for this user`] })
        return;
    }

    // Find the client owner of the project
    const [find_client_error, client] = await try_catch(
        Client.findOne({
            _id : project.client_id,
            user_id : req.user._id, // Validate that the client belongs to the user
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
        res.status(404).json({ errors : [`Not Found. Project with id '${project_id}' not found for this user`] }) // Only notify that the project was not found to not leak information about the client
        return;
    }

    // Find the delivery notes for that project
    const [find_delivery_notes_error, delivery_notes] = await try_catch(
        DeliveryNote.find({ project_id : project._id, deleted : false })
    );

    if(find_delivery_notes_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    res.status(200).json(
        delivery_notes.map(delivery_note => ({
            _id : delivery_note._id,
            project_id : delivery_note.project_id,
            data : delivery_note.data,
            signature : delivery_note.signature,
            createdAt : delivery_note.createdAt
        }))
    );
}

// Create a new delivery note for a project
module.exports.postDeliveryNote = async (req, res, next) => {

    // Get validated delivery note data
    const { project_id, data } = matchedData(req, { locations : ['body'] });

    // Find the project with that id
    const [find_project_error, project] = await try_catch(
        Project.findOne({
            _id : project_id,
            deleted : false
        })
    );

    if(find_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!project){
        res.status(404).json({ errors : [`Not Found. Project with id '${project_id}' not found for this user`] })
        return;
    }

    // Validate that the client owner of the project belongs to the user
    const [find_client_error, client] = await try_catch(
        Client.findOne({
            _id : project.client_id,
            user_id : req.user._id,
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
        res.status(404).json({ errors : [`Not Found. Project with id '${project_id}' not found for this user`] }) // Only notify that the project was not found to not leak information about the client
        return;
    }

    // Create the delivery note and handle erros
    const [create_delivery_note_error, created_delivery_note] = await try_catch(
        DeliveryNote.create({
            project_id : project._id,
            data : data,
            signed : false,
            deleted : false
        })
    );

    if(create_delivery_note_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    // Map delivery note data to new object (Whitelist fields)
    res.status(201).json({
        _id : created_delivery_note._id,
        project_id : created_delivery_note.project_id,
        data : created_delivery_note.data,
        signature : created_delivery_note.signature,
        createdAt : created_delivery_note.createdAt
    });
}

// Get the delivery note as a PDF file
module.exports.getDeliveryNotePDF = async (req, res, next) => {

    // Get validated delivery note id
    const { id } = matchedData(req, { locations : ['params'] });

    // Find the delivery note with that id of the user and handle erros
    const [find_delivery_note_error, delivery_note] = await try_catch(
        DeliveryNote.findOne({
            _id : id,
            deleted : false
        })
    );

    if(find_delivery_note_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!delivery_note){
        res.status(404).json({ errors : [`Not Found. Delivery note with id '${id}' not found for this user`] })
        return;
    }

    // Find the project of the delivery note
    const [find_project_error, project] = await try_catch(
        Project.findOne({
            _id : delivery_note.project_id,
            deleted : false
        })
    );

    if(find_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!project){
        res.status(404).json({ errors : [`Not Found. Delivery note with id '${id}' not found`] }) // Only notify that the delivery note was not found to not leak information about the project
        return;
    }

    // Find the client owner of the project
    const [find_client_error, client] = await try_catch(
        Client.findOne({
            _id : project.client_id,
            user_id : req.user._id, // Validate that the client belongs to the user
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
        res.status(404).json({ errors : [`Not Found. Delivery note with id '${id}' not found`] }) // Only notify that the delivery note was not found to not leak information about the client
        return;
    }

    // Create the PDF document of the delivery note
    const [create_doc_error, doc] = await try_catch(
        deliveryNoteToPDF(delivery_note, project, client)
    );

    if(create_doc_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    // Send the PDF as a response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=delivery_note_${delivery_note._id}.pdf`);
    doc.pipe(res);
    doc.end();
}

// Helper function to create the PDF file
const deliveryNoteToPDF = async (delivery_note, project, client) => {
    const doc = new PDFKit();

    doc.text(`Delivery Note: ${delivery_note._id}`);
    doc.text(`Project: ${project.name}`);
    doc.text(`Project Description: ${project.description}`);
    doc.text(`Project Created At: ${project.createdAt}`);
    doc.text('\n\n');
    doc.text(`Client: ${client.name} ${client.lastname}`);
    doc.text(`Client Email: ${client.email}`);
    doc.text(`Client Address: ${client.address}`);
    doc.text(`Created At: ${delivery_note.createdAt}`);
    doc.text('\n\n');
    doc.text(`Delivery Note Data:`);
    doc.text(`Data:`);
    delivery_note.data.forEach(item => doc.text(`- ${item.type}: ${item.name} (${item.quantity})`));
    doc.text('Signature:');

    // TODO: Add signature image if exists
    if(!delivery_note.signature){
        doc.text('No signature');
    }
    else{

        // Download image to a buffer
        const response = await fetch(delivery_note.signature);
        const buffer = await response.buffer();

        // Add image to PDF
        doc.image(buffer, {
            fit : [250, 250],
            align : 'left',
            valign : 'center'
        })
    }

    doc.text(`Created at: ${delivery_note.createdAt}`);

    return doc;
}

// Upload the delivery note signature to IPFS
module.exports.putDeliveryNoteSignature = async (req, res, next) => {
    
    // Get validated delivery note id
    const { id } = matchedData(req, { locations : ['params'] });

    // Find the delivery note with that id of the user and handle erros
    const [find_delivery_note_error, delivery_note] = await try_catch(
        DeliveryNote.findOne({
            _id : id,
            deleted : false
        })
    );

    if(find_delivery_note_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!delivery_note){
        res.status(404).json({ errors : [`Not Found. Delivery note with id '${id}' not found for this user`] })
        return;
    }

    // Find the project of the delivery note
    const [find_project_error, project] = await try_catch(
        Project.findOne({
            _id : delivery_note.project_id,
            deleted : false
        })
    );

    if(find_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!project){
        res.status(404).json({ errors : [`Not Found. Delivery note with id '${id}' not found`] }) // Only notify that the delivery note was not found to not leak information about the project
        return;
    }

    // Find the client owner of the project
    const [find_client_error, client] = await try_catch(
        Client.findOne({
            _id : project.client_id,
            user_id : req.user._id, // Validate that the client belongs to the user
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
        res.status(404).json({ errors : [`Not Found. Delivery note with id '${id}' not found`] }) // Only notify that the delivery note was not found to not leak information about the client
        return;
    }

    // Upload signature image to IPFS
    const [upload_signature_error, signature] = await try_catch(
        ipfs.uploadToPinata(req.file.buffer, `signature_${id}`)
    );

    if(upload_signature_error || !signature?.IpfsHash){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }
    
    // Update the delivery note with the signature url and handle erros
    delivery_note.signature = `https://${process.env.PINATA_GATEWAY}/ipfs/${signature.IpfsHash}`;
    const [update_delivery_note_error, updated_delivery_note] = await try_catch(delivery_note.save());

    if(update_delivery_note_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    // Map delivery note data to new object (Whitelist fields)
    res.status(200).json({
        _id : updated_delivery_note._id,
        project_id : updated_delivery_note.project_id,
        data : updated_delivery_note.data,
        signature : updated_delivery_note.signature,
        createdAt : updated_delivery_note.createdAt
    });
}

// Delete the delivery note (Only if not signed)
module.exports.deleteDeliveryNote = async (req, res, next) => {

    // Get validated delivery note id
    const { id } = matchedData(req, { locations : ['params'] });

    // Find the delivery note with that id of the user and handle erros
    const [find_delivery_note_error, delivery_note] = await try_catch(
        DeliveryNote.findOne({
            _id : id,
            deleted : false
        })
    );

    if(find_delivery_note_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!delivery_note){
        res.status(404).json({ errors : [`Not Found. Delivery note with id '${id}' not found for this user`] })
        return;
    }

    // Find the project of the delivery note
    const [find_project_error, project] = await try_catch(
        Project.findOne({
            _id : delivery_note.project_id,
            deleted : false
        })
    );

    if(find_project_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    if(!project){
        res.status(404).json({ errors : [`Not Found. Delivery note with id '${id}' not found`] }) // Only notify that the delivery note was not found to not leak information about the project
        return;
    }

    // Find the client owner of the project
    const [find_client_error, client] = await try_catch(
        Client.findOne({
            _id : project.client_id,
            user_id : req.user._id, // Validate that the client belongs to the user
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
        res.status(404).json({ errors : [`Not Found. Delivery note with id '${id}' not found`] }) // Only notify that the delivery note was not found to not leak information about the client
        return;
    }

    // If already signed, respond with a conflict error
    if(delivery_note.signed !== ''){
        res.status(409).json({ errors : [`Conflict. Delivery note with id '${id}' already signed`] });
        return;
    }

    // Delete the delivery note and handle erros
    const [delete_delivery_note_error, deleted_delivery_note] = await try_catch(
        delivery_note.deleteOne()
    );

    if(delete_delivery_note_error){
        const error = new Error('Internal Server Error. Try again later');
        error.status = 500;
        next(error);
        return;
    }

    res.status(200).json({
        _id : deleted_delivery_note._id,
        project_id : deleted_delivery_note.project_id,
        data : deleted_delivery_note.data,
        signature : deleted_delivery_note.signature,
        createdAt : deleted_delivery_note.createdAt
    });
}