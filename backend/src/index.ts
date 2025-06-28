import { Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser'
import connectDB from './config/db'
import router from './router/router';
import { HttpStatusCode } from './constants/statusCode';
import { Messages } from './constants/messages';
const app = express();
const port = process.env.PORT || 5000;
connectDB()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser())
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MERN API' });
});

app.use("/", router);


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || HttpStatusCode.INTERNAL_SERVER;
  const message = err.message || Messages.SERVER_ERROR;
  console.error('Error:', err);
  res.status(status).json({ message });
});

 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});