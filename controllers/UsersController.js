import validate from '../services/validate';
import HttpError from 'http-errors';
import {users} from "../models";
import md5 from 'md5';
import fs from 'fs';
import {v4 as uuid} from 'uuid';
import Promise from 'bluebird';
import path from 'path';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

class UsersController {

    static signUp = async (req, res, next) => {
        try {
            await validate(req.body, {
                email: 'required|email',
                password: 'required|string',
                repeatPassword: 'required|string',
                first_name: 'required|string',
                last_name: 'required|string',
                age: 'required|numeric|string',
                phone: 'required|string',
            });

            const {email, password, repeatPassword, first_name, last_name, age, phone} = req.body;
            const {files} = req;

            if (password !== repeatPassword) {
                throw HttpError(422, 'invalid repeat password');
            }

            const user = await users.findOne({email});

            if (user) {
                throw HttpError(402, 'this email is busy');
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

            const direction = await path.join(__dirname, `../public/userImage/folder_${uniqId}`);
            if (!fs.existsSync(direction)) {
                fs.mkdirSync(direction, {recursive: true});
            }

            const CreatePictures = [];

            await Promise.map(files, async (file) => {
                const ext = allowTypes[file.mimetype];
                const fileName = `image_${uuid()}${ext}`;
                fs.writeFileSync(path.join(direction, fileName), file.buffer);
                CreatePictures.push(fileName);
            });

            const newUser = await users.create({
                email,
                password: md5(password, '++'),
                first_name,
                last_name,
                age,
                phone,
                picture: CreatePictures
            });

            const directionRename = await path.join(__dirname, `../public/userImage/folder_${newUser.id}`);

            fs.renameSync(direction, directionRename);

            res.json({
                status: 'ok',
                user: newUser,
            });
        } catch (e) {

            next(e);
        }
    };

    static single = async (req, res, next) => {
        try {
            await validate(req.body, {
                userId: 'required|string',
            });

            const {userId} = req.body;

            const user = await users.findById(userId);

            if (!user) {
                throw HttpError(422, 'invalid user');
            }

            res.json({
                status: 'ok',
                user,
            });
        } catch (e) {
            next(e);
        }
    };

    static uploadImage = async (req, res, next) => {
        try {
            await validate(req.body, {
                userId: 'required|string',
            });

            const {files} = req;
            const {userId} = req.body;

            const user = await users.findOne({_id: userId});

            if (!user) {
                throw HttpError(404);
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

            const direction = await path.join(__dirname, `../public/userImage/${userId}`);
            if (!fs.existsSync(direction)) {
                fs.mkdirSync(direction, {recursive: true});
            }

            const CreatePictures = [];

            await Promise.map(files, async (file) => {
                const ext = allowTypes[file.mimetype];
                const fileName = `image_${uuid()}${ext}`;
                fs.writeFileSync(path.join(direction, fileName), file.buffer);
                CreatePictures.push(fileName);
            });

            await users.updateOne({id: user._id, picture: CreatePictures});

            res.json({
                status: 'ok',
            });
        } catch (e) {

            next(e);
        }
    };

    static signIn = async (req, res, next) => {
        try {
            await validate(req.body, {
                email: 'required|string',
                password: 'required|string',
            });

            const {JWT_SECRET} = process.env;

            const {email, password} = req.body;

            const user = await users.findOne({email, password: md5(password, '++')});

            if (!user) {
                throw HttpError(422, 'invalid username or password');
            }

            const token = jwt.sign({userId: user._id}, JWT_SECRET);

           res.json({
                status: 'ok',
                user,
                token,
            });
        } catch (e) {
            next(e);
        }
    };

}

export default UsersController;
