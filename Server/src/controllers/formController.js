import Form from '../models/Form.js';
import asyncHandler from 'express-async-handler';
import { generateShareId } from '../utils/generateShareId.js';

export const createForm = asyncHandler(async (req, res) => {
  const { title, description, headerImageUrl, questions } = req.body;
  const form = await Form.create({
    title, description, headerImageUrl, questions, shareId: generateShareId()
  });
  res.status(201).json(form);
}); 

export const getForm = asyncHandler(async (req, res) => {
  const form = await Form.findById(req.params.id);
  if (!form) return res.status(404).json({ message: 'Form not found' });
  res.json(form);
});

export const updateForm = asyncHandler(async (req, res) => {
  const form = await Form.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!form) return res.status(404).json({ message: 'Form not found' });
  res.json(form);
});

export const deleteForm = asyncHandler(async (req, res) => {
  const form = await Form.findByIdAndDelete(req.params.id);
  if (!form) return res.status(404).json({ message: 'Form not found' });
  res.json({ success: true });
});

export const getFormByShareId = asyncHandler(async (req, res) => {
  const form = await Form.findOne({ shareId: req.params.shareId });
  if (!form) return res.status(404).json({ message: 'Form not found' });
  res.json(form);
});