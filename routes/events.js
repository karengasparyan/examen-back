import express from 'express';
import EventsController from "../controllers/EventsController";
import authorization from "../middlewares/authorization";
import multer, {memoryStorage} from "multer";

const router = express.Router();

router.post('/all-my', authorization, EventsController.getMyAllEvents);

router.post('/all', authorization, EventsController.getAllEvents);

const upload = multer({ storage: memoryStorage() });

router.post('/create', authorization, upload.array('file[]') ,EventsController.createEvent);

router.post('/update', authorization, upload.array('file[]') ,EventsController.updateEvent);

router.post('/delete', authorization, EventsController.deleteEvent);

router.post('/single-event', authorization, EventsController.singleEvent);

router.post('/pending-event', authorization, EventsController.pendingEvent);

router.post('/success-event', authorization, EventsController.successEvent);

router.post('/get-pending-events', EventsController.getPendingEvents);

router.post('/get-success-events', authorization, EventsController.getSuccessEvents);

export default router;
