import validate from "../services/validate";
import HttpError from "http-errors";
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
        status: 'required|boolean',
        image: 'required|string',
      });

      const { userId, title, description, limit, status, image } = req.body;

      const user = await users.findById(userId);

      if (!user) {
        throw HttpError(404);
      }

      await events.create({ title, description,limit, status,image, userId });

      await res.json({
        status: 'ok',
      });
    } catch (e) {

      next(e);
    }
  };

}

export default EventsController;
