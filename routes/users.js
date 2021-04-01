import express from 'express';
import multer, { memoryStorage } from "multer";
import UsersController from "../controllers/UsersController";

const router = express.Router();

router.post('/sign-in', UsersController.signIn);

const upload = multer({ storage: memoryStorage() });

router.post('/sign-up', upload.array('files'), UsersController.signUp);

export default router;
