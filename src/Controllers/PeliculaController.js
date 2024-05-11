import mongoose from "mongoose"
import * as fs from 'fs'

const esquema = new mongoose.Schema({
    nombre:String, clasificacion:String, genero:String, descripcion:String, director:String, imagen:String
},{ versionKey:false})
const PeliculaModel = new mongoose.model('pelicula',esquema)

export const getPelicula = async(req,res) =>{
    try{
        const {id} =req.params
        const rows =
        (id === undefined) ? await PeliculaModel.find() : await PeliculaModel.findById(id)
        return res.status(200).json({status:true,data:rows})
    }
    catch(error){
        return res.status(500).son({status:false,errors:[error]})
    }
}

export const savePelicula = async(req,res) =>{
    try{
        const {nombre,clasificacion,genero,descripcion,director} = req.body
        const validacion = validar(nombre,clasificacion,genero,descripcion,director,req.file,'Y')
        if(validacion == ''){
            const nuevoPelicula = new PeliculaModel({
                nombre:nombre,clasificacion:clasificacion,genero:genero,descripcion:descripcion,director:director,
                imagen:'/uploads/'+req.file.filename
            })
            return await nuevoPelicula.save().then(
                () => { res.status(200).json({status:true,message:'Pelicula guardada'}) }
            )
        }
        else{
            return res.status(400).json({status:false,errors:validacion})
        }
    }
    catch(error){
        return res.status(500).json({status:false,errors:[error.message]})
    }
}
export const updatePelicula = async(req,res) =>{
    try{
        const {id} = req.params
        const {nombre,clasificacion,genero,descripcion,director} = req.body
        let imagen = ''
        let valores = { nombre:nombre,clasificacion:clasificacion,genero:genero,descripcion:descripcion,director:director}
        if(req.file != null){
            imagen = '/uploads/'+req.file.filename
            valores = { nombre:nombre,clasificacion:clasificacion,genero:genero,descripcion:descripcion,director:director,imagen:imagen}
            await eliminarImagen(id)
        }
        const validacion = validar(nombre,clasificacion,genero,descripcion,director)
        if(validacion == ''){
            await PeliculaModel.updateOne({_id:id},{$set: valores})
            return res.status(200).json({status:true,message:'Pelicula actualizada'}) 
        }
        else{
            return res.status(400).json({status:false,errors:validacion})
        }
    }
    catch(error){
        return res.status(500).json({status:false,errors:[error.message]})
    }
}

export const deletePelicula = async(req,res) =>{
    try{
        const {id} = req.params
        await eliminarImagen(id)
        await PeliculaModel.deleteOne({_id:id})
        return res.status(200).json({status:true,message:'Pelicula eliminada'})
    }
    catch(error){
        return res.status(500).json({status:false,errors:[error,message]})
    }
}

const eliminarImagen = async(id) =>{
    const pelicula = await PeliculaModel.findById(id)
    const img = pelicula.imagen
    fs.unlinkSync('./public/'+img)
}

const validar = (nombre,clasificacion,genero,descripcion,director,img,sevalida) =>{
    var errors = []
    if(nombre === undefined || nombre.trim() === ''){
        errors.push('El nombre NO debe de estar vacio')
    }
    if(clasificacion === undefined || clasificacion.trim() === ''){
        errors.push('La clasificacion NO debe de estar vacia')
    }
    if(genero === undefined || genero.trim() === ''){
        errors.push('El genero NO debe de estar vacio')
    }
    if(descripcion === undefined || descripcion.trim() === ''){
        errors.push('La descripcion NO debe de estar vacia')
    }
    if(director === undefined || director.trim() === ''){
        errors.push('El director NO debe de estar vacio')
    }
    if(sevalida === 'Y' && img === undefined){
        errors.push('Selecciona una imagen en formato jpg o png')
    }
    else{
        if(errors != ''){
            fs.unlinkSync('./public/uploads/'+img.filename)
        }
    }
    return errors
}