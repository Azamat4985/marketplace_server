import express from 'express'
import { isAvailable } from '../controllers/ServiceController.js';

const serviceRouter = express.Router();

serviceRouter.get('/isAvailable', isAvailable)

export default serviceRouter;