import { Router } from 'express';
import { pool } from '../config/database.js';
import { encryptionKey } from '../config/encryption.js';

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
router.get('/Proveedor/loginProveedor', (req, res) => {
    res.render('Proveedor/loginProveedor', { error: null, success: null });
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
        return res.render('Proveedor/loginProveedor', {
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

// Iniciar sesión:::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.post('/loginProveedor', async (req, res) => {
    try {
        const { Logemail, Logpassword } = req.body;

        if(!Logemail || !Logpassword){
            return res.render('Proveedor/loginProveedor', {
                error: 'Todos los campos son requeridos', success: null
            });
        }

        const [usuarios] = await pool.query(
            'SELECT idProveedor, nombreProveedor, correo FROM proveedor WHERE correo = ? AND contrasena = AES_ENCRYPT(?, ?)',
            [Logemail.trim(), Logpassword.trim(), encryptionKey]
        );

        console.log('Usuario encontrado:', usuarios[0]); // Debug

        if (usuarios.length > 0) {
            const usuario = usuarios[0];
            
            // Guardamos el ID correcto en la sesión
            req.session.user = {
                id: usuario.idProveedor,
                nombreUsuario: usuario.nombreProveedor,
                correo: usuario.correo
            };
            
            // Usar el ID directamente sin espacios o caracteres especiales
            return res.redirect(`/inicioProveedor/${usuario.idProveedor}`);
        }

        return res.render('Proveedor/loginProveedor', 
            { error: 'Credenciales incorrectas', success: null });

    } catch (error) {
        console.error('Error en login:', error);
        return res.render('Proveedor/loginProveedor', { error: 'Error del servidor', success: null });
    }
});

// Página de inicio de Proveedor :::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/inicioProveedor/:id',verificarAutenticacion, async (req, res) => {
    try {
        if(!req.session.user){
            return res.redirect('/Proveedor/loginProveedor');
        }

        const userId = req.params.id;

        if(req.session.user.id != userId){
            return res.redirect('/Proveedor/loginProveedor');
        }

        res.render('Proveedor/inicioProveedor', {
            user: req.session.user,
            error: null
        });

    } catch (error) {
        console.log('Error en la ruta de inicio:', error);
        res.redirect('Proveedor/loginProveedor');
    }
})

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('perfilProveedor/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;

        if(req.session.user.id != userId){
            return res.redirect('/Proveedor/loginProveedor');
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
            res.redirect('/Proveedor/loginProveedor');
        }
    } catch (error) {
        console.error('Error al cargar el perfil: ', error);
        res.redirect('/Proveedor/loginProveedor');
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
