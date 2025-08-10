import mongoose from 'mongoose';
const { Schema } = mongoose;

const CategorizeSchema = new Schema({
  categories: [{ id: String, label: String }],
  options: [{ id: String, label: String, imageUrl: String, correctCategoryId: String }]
}, { _id: false });

const ClozeSchema = new Schema({
  textWithGaps: String,
  answers: [{ index: Number, value: String }]
}, { _id: false });

const SubQSchema = new Schema({
  id: String,
  kind: { type: String, enum: ['mcq', 'short'] },
  question: String,
  options: [String],
  correct: [Number],
  answerText: String
}, { _id: false });

const ComprehensionSchema = new Schema({
  passage: String,
  subQuestions: [SubQSchema]
}, { _id: false });

const QuestionSchema = new Schema({
  id: String,
  type: { type: String, enum: ['categorize', 'cloze', 'comprehension'], required: true },
  prompt: String,
  imageUrl: String,
  required: { type: Boolean, default: false },
  categorize: { type: CategorizeSchema },
  cloze: { type: ClozeSchema },
  comprehension: { type: ComprehensionSchema }
}, { _id: false });

const FormSchema = new Schema({
  title: String,
  description: String,
  headerImageUrl: String,
  shareId: { type: String, unique: true, index: true },
  questions: [QuestionSchema]
}, { timestamps: true });

export default mongoose.model('Form', FormSchema);