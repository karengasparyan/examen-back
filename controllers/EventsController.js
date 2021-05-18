import validate from "../services/validate";
import HttpError from "http-errors";
import _ from "lodash";
import {v4 as uuid} from "uuid";
import path from "path";
import fs from "fs";
import Promise from "bluebird";
import {users, events} from "../models";

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

      const user = await users.find({_id: userId});

      if (!user) {
        throw HttpError(404);
      }

      const pagesCount = events.count();

      const myEvents = await events.find({
        userId, ...query,
        "status": {"$ne": 'finished'},
      }).skip(offset).limit(limit).sort({date: 'desc'}).populate('userId');

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
        userId: 'required|string',
        page: 'numeric',
      });

      const {userId} = req;
      const {query = {}, page = 1} = req.body;

      let limit = 20;
      const offset = (page - 1) * limit;

      const pagesCount = events.count();

      const allEvents = await events.find({
        ...query,
        "userId": {"$ne": userId},
        "status": {"$ne": 'finished'},
      }).skip(offset).limit(limit).sort({date: 'desc'}).populate('userId');

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
        limit: 'required|numeric',
        // duration: 'required|string',
        duration: 'required|numeric',
        address: 'required|string',
        // status: 'required',
      });

      const {userId, title, description, limit, duration, address} = req.body;
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
        duration,
        address,
        // status,
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
        limit: 'required|numeric',
        // duration: 'required|string',
        duration: 'required|numeric',
        address: 'required|string',
        // status: 'required',
        deleteImages: 'array',
      });

      const {userId, eventId, title, description, limit, duration, address, deleteImages} = req.body;
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
        duration,
        address,
        // status
      }, {new: true});

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
      await validate(req.body, {
        userId: 'required|string',
        eventId: 'required|string',
      });

      const {userId, eventId} = req.body;

      const user = await users.findById(userId);

      if (_.isEmpty(user)) {
        throw HttpError(422, 'invalid user');
      }

      const event = await events.findById(eventId).populate('userId');

      if (!event) {
        throw HttpError(422, 'invalid event');
      }

      if (event.members) {
        if (event.members.length > event.limit) {
          throw HttpError(422, `Events maximum limit ${event.limit}`);
        }
      }

      const members = _.uniqBy([...event.members, {userId, email: user.email, status: 'pending'}], 'userId');

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

      const updateEvents = await events.findOneAndUpdate({
        'members.userId': userId,
        _id: eventId,
        'members.status': 'pending'
      },{ "$set": { "members.$.status": 'success' }},{new: true}).populate('userId');

      // const updateMember = updateEvents.members.find(m => m.userId === userId);
      //
      // updateMember.status = 'success';
      //
      // updateEvents.members = [
      //   ...updateEvents.members,
      //   updateMember,
      // ];
      //
      // updateEvents.members = _.uniqBy(updateEvents.members, 'userId');
      //
      // await updateEvents.save();

      // const updateEvents = await events.findOneAndUpdate({
      //   _id: eventId,
      //   'members.status': 'pending',
      //   'members.userId': userId
      // }, {
      //   'members.status': 'success'
      // }, {new: true});

      res.json({
        status: 'ok',
        updateEvents
      });
    } catch (e) {
      next(e);
    }
  };

  static deleteRequestEvent = async (req, res, next) => {
    try {
      await validate(req.body, {
        userId: 'required|string',
        eventId: 'required|string',
        deleteType: 'required|string',
      });

      // default pending
      const {userId, eventId, deleteType} = req.body;

      const updateEvents = await events.findOne({
        'members.userId': userId,
        _id: eventId,
        'members.status': deleteType
      }).populate('userId');

      updateEvents.members = updateEvents.members.filter(m => m.userId !== userId);

      await updateEvents.save();

      res.json({
        status: 'ok',
        updateEvents
      });
    } catch (e) {
      next(e);
    }
  };

  static getSuccessEvents = async (req, res, next) => {
    try {
      await validate(req.body, {
        userId: 'required|string',
      });

      const {userId} = req.body;

      const successEvents = await events.find({
        'members.status': 'success',
        'members.userId': userId,
      }).sort({date: 'desc'}).populate('userId');

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
        userId: 'required|string',
      });

      const {userId} = req.body;

      const pendingEvents = await events.find({
        userId,
        'members.status': 'pending'}).sort({date: 'desc'}).populate('userId');

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

      const direction = path.join(__dirname, `../public/eventImage/folder_${eventId}`);
      fs.rmdirSync(direction, { recursive: true });

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

      const singleEvent = await events.findById(eventId).populate('userId');

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
