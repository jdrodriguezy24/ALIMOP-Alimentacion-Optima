import { Router } from "express";

const router = Router();

// Middleware de autenticación
const verificarAutenticacion = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/Proveedor/loginProveedor');
    }
};

// Registro de proveedor
router.get('/Proveedor/registroProveedor', async (req, res) => {
    res.render('Proveedor/registroProveedor');
});

// Iniciar Sesion
router.get('/Proveedor/loginProveedor', (req, res) =>{
    res.render('Proveedor/loginProveedor', { error: null, success: null});
});

// Registrar::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


export default router;
