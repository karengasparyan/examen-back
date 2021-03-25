import express from 'express';
import ExamenCantroller from "../controllers/ExamenCantroller";


const router = express.Router();

router.get('/', ExamenCantroller.data);

export default router;
