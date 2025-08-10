import { Router } from 'express';
import { submitResponse } from '../controllers/responseController.js';

const router = Router();
router.post('/', submitResponse);
export default router;