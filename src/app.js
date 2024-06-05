import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import { URL } from './config.js';
import rutasPelicula from './Routes/Pelicula.routes.js';
import rutasAuth from './Routes/Auth.routes.js';

mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a la base de datos'))
  .catch(err => console.error('Error al conectar a la base de datos:', err));

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: 'http://localhost:5173', // Permitir solicitudes desde http://localhost:5173
  credentials: true // Permitir el envío de cookies en las solicitudes
};
app.use(cors(corsOptions));

// Manejo de solicitudes preflight (OPTIONS)
app.options('*', cors(corsOptions));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));
app.use('/api/peliculas', rutasPelicula);
app.use('/api/auth', rutasAuth);

app.use((req, res) => {
  res.status(404).json({ status: false, errors: 'Not found' });
});

// Middleware para manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: false, errors: 'Something went wrong!' });
});

export default app;

