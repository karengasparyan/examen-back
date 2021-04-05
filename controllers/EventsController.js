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

  static getAllEvents = async (req, res, next) => {
    try {
      await validate(req.body, {
        userId: 'required|string',
        page: 'numeric',
      });

      const { userId, page } = req.body;

      let limit = 20;
      const offset = (page - 1) * limit;

      const user = users.find({ _id: userId});

      if (!user) {
        throw HttpError(404);
      }

      const event = await events.find({userId}).skip(offset).limit(limit);

      await res.json({
        status: 'ok',
        event,
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

      fs.renameSync(direction, directionRename)

      res.json({
        status: 'ok',
        event: newEvent,
      });
    } catch (e) {

      next(e);
    }
  };

}

export default EventsController;
