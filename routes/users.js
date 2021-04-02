import express from 'express';
import multer, { memoryStorage } from "multer";
const path = require('path')


import UsersController from "../controllers/UsersController";

const router = express.Router();

router.post('/sign-in', UsersController.signIn);

router.post('/sign-up',UsersController.signUp);

const upload = multer({ storage: memoryStorage() });

router.post('/upload-image',upload.array('file'), UsersController.uploadImage);

export default router;
