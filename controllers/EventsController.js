import validate from "../services/validate";
import HttpError from "http-errors";
import _ from "lodash";
import {v4 as uuid} from "uuid";
import path from "path";
import fs from "fs";
import Promise from "bluebird";
import md5 from "md5";
import Utils from "../Utils/Utils";

const {users, events} = require("../models").models;
// import users from '../models/users';
// import events from '../models/events';

class EventsController {

    static getMyAllEvents = async (req, res, next) => {
        try {
            await validate(req.body, {
                userId: 'required|string',
                page: 'numeric',
            });

            const {userId, query = {}, page = 1,} = req.body;

            let limit = 20;
            const offset = (page - 1) * limit;

            const user = users.find({_id: userId});

            if (!user) {
                throw HttpError(404);
            }

            const pagesCount = events.count();

            const myEvents = await events.find({userId, ...query}).skip(offset).limit(limit).populate('userId');

            await res.json({
                status: 'ok',
                myEvents,
                myEventPagesCount: Math.ceil(pagesCount.length / limit)
            });
        } catch (e) {

            next(e);
        }
    };

    static getAllEvents = async (req, res, next) => {
        try {
            await validate(req.body, {
                page: 'numeric',
            });

            const {query = {}, page = 1,} = req.body;

            let limit = 20;
            const offset = (page - 1) * limit;

            const pagesCount = events.count();

            const allEvents = await events.find({...query}).skip(offset).limit(limit);

            await res.json({
                status: 'ok',
                allEvents,
                allEventPagesCount: Math.ceil(pagesCount.length / limit)
            });
        } catch (e) {
            next(e);
        }
    };
    static createEvent = async (req, res, next) => {
        try {
            await validate(req.body, {
                userId: 'required|string',
                title: 'required|string',
                description: 'required|string',
                limit: 'required|string',
                status: 'required',
            });

            const {userId, title, description, limit, status} = req.body;
            const {files} = req;

            const user = await users.findById(userId);

            if (!user) {
                throw HttpError(404);
            }

            if (_.isEmpty(files)) {
                throw HttpError(402, 'Image is required');
            }

            const allowTypes = {
                'image/jpeg': '.jpg',
                'image/gif': '.gif',
                'image/png': '.png',
            };

            files.forEach(file => {
                const {mimetype} = file;
                if (!allowTypes[mimetype]) {
                    throw HttpError(422, 'invalid file type');
                }
            });

            const uniqId = uuid();

            const direction = path.join(__dirname, `../public/eventImage/folder_${uniqId}`);
            if (!fs.existsSync(direction)) {
                fs.mkdirSync(direction, {recursive: true});
            }

            const createImage = [];

            await Promise.map(files, async (file) => {
                const ext = allowTypes[file.mimetype];
                const fileName = `image_${uuid()}${ext}`;
                fs.writeFileSync(path.join(direction, fileName), file.buffer);
                createImage.push(fileName);
            });

            const newEvent = await events.create({
                userId,
                title,
                description,
                limit,
                status,
                image: createImage,
            });

            const directionRename = path.join(__dirname, `../public/eventImage/folder_${newEvent.id}`);

            fs.renameSync(direction, directionRename);

            res.json({
                status: 'ok',
                event: newEvent,
            });
        } catch (e) {

            next(e);
        }
    };

    static updateEvent = async (req, res, next) => {
        try {
            await validate(req.body, {
                userId: 'required|string',
                eventId: 'required|string',
                title: 'required|string',
                description: 'required|string',
                limit: 'required|string',
                status: 'required',
                deleteImages: 'array',
            });

            const {userId, eventId, title, description, limit, status, deleteImages} = req.body;
            const {files} = req;

            const direction = await path.join(__dirname, `../public/eventImage/folder_${eventId}`);

            const user = await users.findById(userId);

            if (!user) {
                throw HttpError(404, 'invalid user');
            }

            let {image} = await events.findById(eventId);
            let updateImages = [];

            if (!_.isEmpty(deleteImages) && !_.isEmpty(image)) {
                for (let i = 0; i < deleteImages.length; i++) {
                    console.log('utils array', image)
                    image = image.filter(e => e !== deleteImages[i]);
                    fs.unlinkSync(path.join(direction, deleteImages[i]));
                }
                updateImages = image
            }

            const allowTypes = {
                'image/jpeg': '.jpg',
                'image/gif': '.gif',
                'image/png': '.png',
            };

            files.forEach(file => {
                const {mimetype} = file;
                if (!allowTypes[mimetype]) {
                    throw HttpError(422, 'invalid file type');
                }
            });

            const createImage = [];

            await Promise.map(files, async (file) => {
                const ext = allowTypes[file.mimetype];
                const fileName = `image_${uuid()}${ext}`;
                fs.writeFileSync(path.join(direction, fileName), file.buffer);
                createImage.push(fileName);
            });

            if (_.isEmpty(updateImages)) {
                updateImages = image;
            }

            const event = await events.findOneAndUpdate({_id: eventId}, {
                image: [...updateImages, ...createImage],
                title,
                description,
                limit,
                status
            }, {new : true});


            res.json({
                status: 'ok',
                event,
            });
        } catch (e) {

            next(e);
        }
    };

    static pendingEvent = async (req, res, next) => {
        try {
            console.log(req.body)
            await validate(req.body, {
                userId: 'required|string',
                eventId: 'required|string',
            });

            const {userId, eventId} = req.body;

            const user = await users.findById(userId);

            if (_.isEmpty(user)) {
                throw HttpError(422, 'invalid user');
            }

            const event = await events.findById(eventId);

            const limit = 20;

            if (!event) {
                throw HttpError(422, 'invalid event');
            }

            if (event.members) {
                if (event.members.length > limit) {
                    throw HttpError(422, `Events maximum limit ${limit}`);
                }
            }

            const members = [];

            members.push({userId, status: 'pending'});

            await events.findOneAndUpdate({_id: eventId}, {members});

            res.json({
                status: 'ok',
            });
        } catch (e) {

            next(e);
        }
    };

    static successEvent = async (req, res, next) => {
        try {
            await validate(req.body, {
                userId: 'required|string',
                eventId: 'required|string',
            });

            const {userId, eventId} = req.body;

            const user = await users.findById(userId);

            const event = await events.findById(eventId);

            if (!user) {
                throw HttpError(422, 'invalid user');
            }

            if (!event) {
                throw HttpError(422, 'invalid event');
            }

            const updateEvent = events.findById(eventId);

            updateEvent.members.find(m => m.status === 'pending' && m.userId === userId).status = 'success';

            await events.findOneAndUpdate({_id: eventId}, {updateEvent}, {new : true});

            res.json({
                status: 'ok',
            });
        } catch (e) {

            next(e);
        }
    };

    static getSuccessEvents = async (req, res, next) => {
        try {
            await validate(req.body, {
                eventId: 'required|string',
            });

            const {eventId} = req.body;

            const event = await events.findById(eventId);

            if (!event) {
                throw HttpError(422, 'invalid event');
            }

            const events = events.findById(eventId);

            const successEvents = await events.findById(eventId);

            successEvents.members.filter(m => m.status === 'success');

            res.json({
                status: 'ok',
                successEvents,
            });
        } catch (e) {

            next(e);
        }
    };

    static getPendingEvents = async (req, res, next) => {
        try {
            await validate(req.body, {
                eventId: 'required|string',
            });

            const {eventId} = req.body;

            const event = await events.findById(eventId);

            if (!event) {
                throw HttpError(422, 'invalid event');
            }

            const events = events.findById(eventId);

            const pendingEvents = await events.findById(eventId);

            pendingEvents.members.filter(m => m.status === 'pending');

            res.json({
                status: 'ok',
                pendingEvents,
            });
        } catch (e) {

            next(e);
        }
    };

    static deleteEvent = async (req, res, next) => {
        try {

            await validate(req.body, {
                eventId: 'required|string',
                userId: 'required|string',
            });

            const {userId, eventId} = req.body;

            const user = await users.findById(userId);

            const event = await events.findById(eventId);

            if (!user) {
                throw HttpError(422, 'invalid user');
            }

            if (!event) {
                throw HttpError(422, 'invalid event');
            }

            await events.remove({_id: eventId});

            await res.json({
                status: 'ok',
            });
        } catch (e) {

            next(e);
        }
    };

    static singleEvent = async (req, res, next) => {
        try {

            await validate(req.body, {
                eventId: 'required|string',
            });

            const {eventId} = req.body;

            const singleEvent = await events.findById(eventId);

            if (!singleEvent) {
                throw HttpError(422, 'invalid event');
            }

            await res.json({
                status: 'ok',
                singleEvent,
            });
        } catch (e) {

            next(e);
        }
    };

}

export default EventsController;
