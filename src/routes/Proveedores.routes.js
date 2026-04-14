import { Router } from 'express';
import { pool } from '../config/database.js';
import { encryptionKey } from '../config/encryption.js';

const router = Router();

// Middleware de autenticación
const verificarAutenticacion = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Registro de proveedor
router.get('/Proveedor/registroProveedor', async (req, res) => {
    res.render('Proveedor/registroProveedor');
});

// Registrar Proveedor ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.post('/registroProveedor', async (req, res) => {
    try {
        const { Regnombre, Regemail, Regpassword, nombreEstablecimiento, direccionEstablecimiento, telefonoEstablecimiento } = req.body;

        // Validación para todos los campos
        if(!Regnombre || !Regemail || !Regpassword || !nombreEstablecimiento || !direccionEstablecimiento || !telefonoEstablecimiento){
            return res.render('Proveedor/registroProveedor', {
                error: 'Todos los campos son requeridos'
            });
        }

        const [encryptedResult] = await pool.query(
            'SELECT AES_ENCRYPT(?, ?) as encrypted', [Regpassword.trim(), encryptionKey]
        );

        // Limpia los datos antes de guardar
        const proveedorNuevo = {
            nombreProveedor: Regnombre.trim(),
            correo: Regemail.trim(),
            contrasena: encryptedResult[0].encrypted,
            nombreEstablecimiento: nombreEstablecimiento.trim(),
            direccion: direccionEstablecimiento.trim(),
            telefono: telefonoEstablecimiento.trim()
        };

        await pool.query('INSERT INTO proveedor SET ?', [proveedorNuevo]);

        // Redirigir al login con mensaje de éxito
        return res.render('login', {
            error: null,
            success: 'Registro exitoso. Por favor, inicia sesión.'
        });

    } catch (error) {
        console.error('Error en registro:', error);
        return res.render('Proveedor/registroProveedor', {
            error: 'Error del servidor. Intenta nuevamente'
        });
    }
});


// Página de inicio de Proveedor :::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/inicioProveedor/:id',verificarAutenticacion, async (req, res) => {
    try {
        if(!req.session.user){
            return res.redirect('/login');
        }

        const userId = req.params.id;

        if(req.session.user.id != userId){
            return res.redirect('/login');
        }

        res.render('Proveedor/inicioProveedor', {
            user: req.session.user,
            error: null
        });

    } catch (error) {
        console.log('Error en la ruta de inicio:', error);
        res.redirect('/login');
    }
})

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('perfilProveedor/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;

        if(req.session.user.id != userId){
            return res.redirect('/login');
        }

        const [usuarios] = await pool.query(
            'SELECT idProveedor, nombreProveedor, correo, nombreEstablecimiento, direccion, telefono FROM proveedor WHERE idProveedor = ?', [userId]
        );

        if(usuarios.length > 0){
            res.render('Proveedor/perfilProveedor', {
                proveedor: usuarios[0],
                error: null
            });
        } else{
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error al cargar el perfil: ', error);
        res.redirect('/login');
    }
})

// Cerrar sesión :::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.post('/logoutProveedor', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
        }
        res.redirect('/');
    });
});

export default router;