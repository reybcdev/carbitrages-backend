import express from 'express';
import { body } from 'express-validator';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  updatePreferences,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('phone').optional().isMobilePhone('any').withMessage('Please provide a valid phone number'),
  body('profile.bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, validateRequest, updateProfile);
router.put('/change-password', changePasswordValidation, validateRequest, changePassword);
router.put('/preferences', updatePreferences);
router.delete('/account', deleteAccount);

export default router;
