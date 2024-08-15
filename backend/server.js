import express from 'express';
import dotenv from 'dotenv';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

import connectDB from './config/db.js';
const port=process.env.PORT || 5000;

connectDB();//Connect to MongoDB
const app =express();


app.get('/',(req,res)=>{
    res.send('API is running...')
})
app.use(notFound);
app.use(errorHandler);
w
app.listen(port,()=>console.log(`Server running on port ${port}`))