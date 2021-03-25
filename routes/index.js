import express from 'express';
import examen from './examen';

const router = express.Router();

router.use('/examen', examen);

export default router;
