import mongoose from 'mongoose';
const { Schema } = mongoose;

const AnswerSchema = new Schema({
  questionId: String,
  categorize: [{ optionId: String, categoryId: String }],
  cloze: [{ index: Number, value: String }],
  comprehension: [{ subId: String, kind: String, value: Schema.Types.Mixed }]
}, { _id: false });

const ResponseSchema = new Schema({
  formId: { type: Schema.Types.ObjectId, ref: 'Form', index: true },
  answers: [AnswerSchema],
  meta: {
    userAgent: String,
    ip: String
  }
}, { timestamps: true });

export default mongoose.model('Response', ResponseSchema);