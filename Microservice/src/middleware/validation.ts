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

// Multi-provider completion validator
export const completionValidator = [
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
  body('provider')
    .optional()
    .isString()
    .isIn(['openai', 'anthropic', 'gemini'])
    .withMessage('invalid provider'),
  body('model').optional().isString().withMessage('model must be a string'),
  body('maxTokens')
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage('maxTokens must be an integer between 1 and 100000'),
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('temperature must be a number between 0 and 2'),
  body('stream').optional().isBoolean().withMessage('stream must be a boolean'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
