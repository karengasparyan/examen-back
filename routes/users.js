import express from 'express';
import multer, { memoryStorage } from "multer";
const path = require('path')
import UsersController from "../controllers/UsersController";
import authorization from "../middlewares/authorization";

const router = express.Router();

router.post('/sign-in', UsersController.signIn);

const upload = multer({ storage: memoryStorage() });

router.post('/sign-up', upload.array('file[]') ,UsersController.signUp);

router.post('/upload-image',upload.array('file[]'), UsersController.uploadImage);

export default router;
