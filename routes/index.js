import express from 'express';
import users from './users';
import events from './events';

const router = express.Router();
router.use('/users', users);
router.use('/events', events);

export default router;
