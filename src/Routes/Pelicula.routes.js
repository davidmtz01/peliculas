import {Router} from 'express'
import { getPelicula,savePelicula,updatePelicula,deletePelicula } from '../Controllers/PeliculaController.js'
import { subirImagen } from '../Middleware/Storage.js'
import { verificar } from '../Middleware/Auth.js'
const rutas = Router()

rutas.get('/api/pelicula',verificar,  getPelicula)
rutas.get('/api/pelicula/:id',verificar, getPelicula)
rutas.post('/api/pelicula',verificar, subirImagen.single('imagen'), savePelicula)
rutas.put('/api/pelicula/:id',verificar, subirImagen.single('imagen'), updatePelicula)
rutas.delete('/api/pelicula/:id',verificar, deletePelicula)

export default rutas