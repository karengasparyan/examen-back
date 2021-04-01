import express from 'express';
import EventsController from "../controllers/EventsController";

const router = express.Router();

router.post('/', EventsController.getAllEvents);

router.post('/create', EventsController.createEvent);

export default router;
