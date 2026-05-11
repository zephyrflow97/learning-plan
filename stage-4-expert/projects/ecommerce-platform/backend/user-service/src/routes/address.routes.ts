import { Router } from 'express';
import { body } from 'express-validator';
import * as addressController from '../controllers/address.controller';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', addressController.getAddresses);
router.post('/', [
  body('fullName').trim().notEmpty(),
  body('phone').trim().notEmpty(),
  body('street').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('state').trim().notEmpty(),
  body('zipCode').trim().notEmpty(),
  validate
], addressController.createAddress);

router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.put('/:id/set-default', addressController.setDefaultAddress);

export default router;
