import Jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import { JWT_SECRET, JWT_EXPIRES } from '../config.js';
import * as fs from 'fs';

const esquema = new mongoose.Schema({
    nombre: String,
    clasificacion: String,
    genero: String,
    descripcion: String,
    director: String,
    imagen: String
}, { versionKey: false });

const PeliculaModel = mongoose.model('pelicula', esquema);

export const getPelicula = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = id ? await PeliculaModel.findById(id) : await PeliculaModel.find();
        return res.status(200).json({ status: true, data: rows });
    } catch (error) {
        return res.status(500).json({ status: false, errors: [error.message] });
    }
};

export const savePelicula = async (req, res) => {
    try {
        const { nombre, clasificacion, genero, descripcion, director } = req.body;
        const validacion = validar(nombre, clasificacion, genero, descripcion, director, req.file, 'Y');
        if (validacion.length === 0) {
            const nuevaPelicula = new PeliculaModel({
                nombre,
                clasificacion,
                genero,
                descripcion,
                director,
                imagen: '/uploads/' + req.file.filename
            });
            await nuevaPelicula.save();
            return res.status(200).json({ status: true, message: 'Pelicula guardada' });
        } else {
            return res.status(400).json({ status: false, errors: validacion });
        }
    } catch (error) {
        return res.status(500).json({ status: false, errors: [error.message] });
    }
};

export const updatePelicula = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, clasificacion, genero, descripcion, director } = req.body;
        let valores = { nombre, clasificacion, genero, descripcion, director };

        if (req.file) {
            const imagen = '/uploads/' + req.file.filename;
            valores.imagen = imagen;
            await eliminarImagen(id);
        }

        const validacion = validar(nombre, clasificacion, genero, descripcion, director);
        if (validacion.length === 0) {
            await PeliculaModel.updateOne({ _id: id }, { $set: valores });
            return res.status(200).json({ status: true, message: 'Pelicula actualizada' });
        } else {
            return res.status(400).json({ status: false, errors: validacion });
        }
    } catch (error) {
        return res.status(500).json({ status: false, errors: [error.message] });
    }
};

export const deletePelicula = async (req, res) => {
    try {
        const { id } = req.params;
        await eliminarImagen(id);
        await PeliculaModel.deleteOne({ _id: id });
        return res.status(200).json({ status: true, message: 'Pelicula eliminada' });
    } catch (error) {
        return res.status(500).json({ status: false, errors: [error.message] });
    }
};

const eliminarImagen = async (id) => {
    const pelicula = await PeliculaModel.findById(id)
    const img = pelicula.imagen
    fs.unlinkSync('./public/'+img)
};

const validar = (nombre, clasificacion, genero, descripcion, director, img, sevalida) => {
    const errors = [];
    if (!nombre || nombre.trim() === '') {
        errors.push('El nombre NO debe de estar vacio');
    }
    if (!clasificacion || clasificacion.trim() === '') {
        errors.push('La clasificacion NO debe de estar vacia');
    }
    if (!genero || genero.trim() === '') {
        errors.push('El genero NO debe de estar vacio');
    }
    if (!descripcion || descripcion.trim() === '') {
        errors.push('La descripcion NO debe de estar vacia');
    }
    if (!director || director.trim() === '') {
        errors.push('El director NO debe de estar vacio');
    }
    if (sevalida === 'Y' && !img) {
        errors.push('Selecciona una imagen en formato jpg o png');
    } else if (errors.length > 0 && img) {
        fs.unlinkSync('./public/uploads/' + img.filename);
    }
    return errors;
};
