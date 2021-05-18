import express from 'express';
import multer, { memoryStorage } from "multer";
import UsersController from "../controllers/UsersController";

const router = express.Router();

router.post('/sign-in', UsersController.signIn);

router.post('/single', UsersController.single);

const upload = multer({ storage: memoryStorage() });

router.post('/sign-up', upload.array('file[]') ,UsersController.signUp);

router.post('/upload-image',upload.array('file[]'), UsersController.uploadImage);

export default router;
