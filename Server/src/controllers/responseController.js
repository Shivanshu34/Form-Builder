import Response from '../models/Response.js';
import Form from '../models/Form.js';
import asyncHandler from 'express-async-handler';

export const submitResponse = asyncHandler(async (req, res) => {
  const { formId, answers } = req.body;
  const form = await Form.findById(formId);
  if (!form) return res.status(404).json({ message: 'Form not found' });

  const doc = await Response.create({
    formId,
    answers,
    meta: {
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    }
  });
  res.status(201).json({ success: true, id: doc._id });
});