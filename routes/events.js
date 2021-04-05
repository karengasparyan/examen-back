import express from 'express';
import EventsController from "../controllers/EventsController";
import authorization from "../middlewares/authorization";
import multer, {memoryStorage} from "multer";

const router = express.Router();

router.post('/', authorization, EventsController.getAllEvents);

const upload = multer({ storage: memoryStorage() });

router.post('/create', authorization, upload.array('file[]') ,EventsController.createEvent);

export default router;
