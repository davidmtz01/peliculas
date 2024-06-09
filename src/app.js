import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import { URL, DB_HOST, DB_DATABASE, DB_PORT } from './config.js';
import rutasPelicula from './Routes/Pelicula.routes.js';
import rutasAuth from './Routes/Auth.routes.js';

mongoose.connect(URL).then();

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'https://peliculas-vue1234.netlify.app'], // Permitir solicitudes desde http://localhost:5173
  credentials: true // Permitir el envío de cookies en las solicitudes
};
app.use(cors(corsOptions));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));
app.use(rutasPelicula);
app.use(rutasAuth);

app.use((req, res) => {
  res.status(404).json({ status: false, errors: 'Not found' });
});

export default app;
