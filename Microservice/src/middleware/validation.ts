import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateCompletion = [
  body('messages')
    .isArray()
    .withMessage('messages must be an array')
    .notEmpty()
    .withMessage('messages cannot be empty'),
  body('messages.*.role')
    .isString()
    .withMessage('message role must be a string')
    .isIn(['system', 'user', 'assistant'])
    .withMessage('invalid message role'),
  body('messages.*.content')
    .isString()
    .withMessage('message content must be a string')
    .notEmpty()
    .withMessage('message content cannot be empty'),
  body('model').optional().isString().withMessage('model must be a string'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
