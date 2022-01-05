const express = require('express');
const Router = express.Router();
const path = require('path');
const multer = require('multer');

const productsController = require('../controllers/productsController');

const diskstorage = multer.diskStorage({
    destination: path.join(__dirname, '../images'),
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-neotec-' + file.originalname)
    }
});

const inventario = multer({
    storage: diskstorage
}).single('imagen');

const productos = (req, res, next) => {
    if(req.cookies.user === "admin@hotmail.com"){
        next();
    }
    else{
        console.log("No puedes ingresar debido a que no eres administrador")
        res.redirect('/home')
    }
}

const userExisted = (req, res, next) => {
    if(!req.cookies.user){
        res.redirect("/");
    }
    else{
        next();
    }
}

Router.get('/', productsController.showLogin);
Router.post('/home/', productsController.login);
Router.get('/home/', userExisted, productsController.list);
Router.get("/registro/", productsController.showRegister);
Router.post("/registro/", productsController.register);
Router.get('/admin/', productos, productsController.productos);
Router.post('/admin/', inventario, productsController.inventario);
Router.get('/update/:id/', productos, productsController.update);
Router.post('/actualizar/:id/', productsController.actualizar);
Router.get('/delete/:id/', productos, productsController.delete);
Router.get('/producto/:id/', userExisted, productsController.producto);
Router.get('/producto/', userExisted, productsController.imagen);
Router.post('/carrito/', productsController.carrito);
Router.get('/carrito/', userExisted, productsController.showCarrito);
Router.get('/stock/', productos, productsController.NoStock);
Router.post('/compra', productsController.compra);
Router.get('/cerrar', productsController.cerrar);
Router.get('/deleteCarrito/:id', productsController.deleteCarrito);
Router.post('/buscar', productsController.buscar);

module.exports = Router;