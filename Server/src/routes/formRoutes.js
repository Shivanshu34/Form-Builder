import { Router } from 'express';
import { createForm, getForm, updateForm, deleteForm, getFormByShareId } from '../controllers/formController.js';

const router = Router();
router.post('/', createForm); 
router.get('/:id', getForm);
router.put('/:id', updateForm);
router.delete('/:id', deleteForm);
router.get('/public/:shareId', getFormByShareId);
export default router;