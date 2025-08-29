import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import {createItem, getItems} from '../controllers/item.controller.js';

const router = express.Router();

router.use(requireAuth);
router.post('/', createItem);
router.get('/', getItems);

export default router;