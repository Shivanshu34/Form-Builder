import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import formRoutes from './routes/formRoutes.js';
import responseRoutes from './routes/responseRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/error.js'; 

dotenv.config();

const app = express();
// app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || '*', credentials: true }));
// app.use(cors({
//   origin: process.env.CLIENT_URL,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// }));
const whitelist = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL, // your prod URL if any
].filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    if (!origin || whitelist.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS','HEAD'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (_, res) => res.json({ ok: true }));
app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes); 
app.use('/api/uploads', uploadRoutes);
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB(process.env.MONGODB_URI);
  if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  }
};
start();