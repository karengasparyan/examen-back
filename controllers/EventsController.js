import validate from "../services/validate";
import HttpError from "http-errors";
import _ from "lodash";
import {v4 as uuid} from "uuid";
import path from "path";
import fs from "fs";
import Promise from "bluebird";
import md5 from "md5";
const  {users, events} = require( "../models").models;
// import users from '../models/users';
// import events from '../models/events';

class EventsController {

  static getMyAllEvents = async (req, res, next) => {
    try {
      await validate(req.body, {
        userId: 'required|string',
        page: 'numeric',
      });

      const { userId, query = {}, page = 1, } = req.body;

      console.log(req.body)
      console.log(req.userId)
      console.log(req.page)
      console.log(req.query)

      let limit = 20;
      const offset = (page - 1) * limit;

      const user = users.find({ _id: userId});

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

      const { query = {}, page = 1, } = req.body;

      let limit = 20;
      const offset = (page - 1) * limit;

     const pagesCount = events.count();

      const allEvents = await events.find({ ...query }).skip(offset).limit(limit);

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

      const { userId, title, description, limit, status } = req.body;
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

      const direction = await path.join(__dirname, `../public/eventImage/folder_${uniqId}`);
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

      const directionRename = await path.join(__dirname, `../public/eventImage/folder_${newEvent.id}`);

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
      console.log(req.body)
      await validate(req.body, {
        userId: 'required|string',
        eventId: 'required|string',
        title: 'required|string',
        description: 'required|string',
        limit: 'required|string',
        status: 'required',
        deleteImages: 'array',
      });

      const { userId, eventId, title, description, limit, status, deleteImages } = req.body;
      const {files} = req;

      const removeImage = (deleteImages, images) => {
        let direction = path.join(__dirname, `../public/eventImage/folder_${eventId}`);
        for (let i = 0; i < deleteImages.length; i++) {
          const index = images.indexOf(deleteImages[i]);
          if (index > -1) {
            images.splice(index, 1);
            fs.unlinkSync(path.join(direction, deleteImages[i]));
          }
        }
      };

      const user = await users.findById(userId);

      if (!user) {
        throw HttpError(404, 'invalid user');
      }

      const images = await events.findById(eventId);

      if (images){
       await removeImage(deleteImages, images.image);
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

      const createImage = [...images];

      await Promise.map(files, async (file) => {
        const ext = allowTypes[file.mimetype];
        const fileName = `image_${uuid()}${ext}`;
        fs.writeFileSync(path.join(direction, fileName), file.buffer);
        createImage.push(fileName);
      });

      const newEvent = await events.updateOne({eventId}, {
        title,
        description,
        limit,
        status,
        image: createImage
       }
      );

      res.json({
        status: 'ok',
        event: newEvent,
      });
    } catch (e) {
      console.log(e)
      next(e);
    }
  };

  static deleteEvent = async (req, res, next) => {
    try {

      await validate(req.body, {
        eventId: 'required|string',
        userId: 'required|string',
      });

      const { userId, eventId } = req.body;

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

      const { eventId } = req.body;

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
