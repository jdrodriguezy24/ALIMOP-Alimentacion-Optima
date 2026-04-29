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

// Página de inicio de Proveedor (Panel de Control) :::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/inicioProveedor/:id',verificarAutenticacion, async (req, res) => {
    try {
        if(!req.session.user){
            return res.redirect('/login');
        }

        // Verificar que solo los proveedores puedan acceder
        if(req.session.user.tipo !== 'Proveedor'){
            return res.redirect('/login');
        }

        const userId = req.params.id;

        if(req.session.user.id != userId){
            return res.redirect('/login');
        }

        res.render('Proveedor/panelControl', {
            user: req.session.user,
            error: null
        });

    } catch (error) {
        console.log('Error en la ruta de panel de control:', error);
        res.redirect('/login');
    }
});

// Agregar ruta de inicio que redirige a la ruta unificada
router.get('/inicio/:id', async (req, res) => {
    try {
        // Verifica si hay una sesión activa
        if (!req.session.user) {
            return res.redirect('/login');
        }

        // Limpia el ID recibido
        const userId = req.params.id.trim();

        // Verifica que el ID coincida con el de la sesión
        if (req.session.user.id != userId) {
            return res.redirect('/login');
        }

        // Si llega aquí y es un proveedor, renderiza el inicio unificado
        res.render('inicio', {
            user: req.session.user,
            error: null
        });

    } catch (error) {
        console.error('Error en la ruta de inicio:', error);
        res.redirect('/login');
    }
});

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Página de perfil del Proveedor
router.get('/perfilProveedor/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;
        const mensaje = req.query.mensaje || null;

        if(req.session.user.id != userId){
            return res.redirect('/login');
        }

        const [usuarios] = await pool.query(
            'SELECT idProveedor, nombreProveedor, correo, CAST(AES_DECRYPT(contrasena, ?) AS CHAR) as contrasena, nombreEstablecimiento, direccion, telefono FROM proveedor WHERE idProveedor = ?', 
            [encryptionKey, userId]
        );

        if(usuarios.length > 0){
            res.render('Proveedor/perfilProveedor', {
                usuario: usuarios[0],
                error: null,
                mensaje: mensaje
            });
        } else{
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error al cargar el perfil: ', error);
        res.redirect('/login');
    }
});

// Actualizar perfil del Proveedor ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.post('/perfilProveedor/:id/actualizar', verificarAutenticacion, async (req, res) => {
    try {
        const id = req.params.id;
        const { nombrePropietario, correo, contrasena, nombreEstablecimiento, direccionEstablecimiento, telefonoEstablecimiento } = req.body;
        
        if (!nombrePropietario || !correo || !contrasena || !nombreEstablecimiento || !direccionEstablecimiento || !telefonoEstablecimiento) {
            return res.render('Proveedor/perfilProveedor', {
                usuario: {...req.body, idProveedor: id},
                mensaje: 'Error: Todos los campos son requeridos'
            })
        }

        const [result] = await pool.query(
            'UPDATE proveedor SET nombreProveedor = ?, correo = ?, contrasena = AES_ENCRYPT(?, ?), nombreEstablecimiento = ?, direccion = ?, telefono = ? WHERE idProveedor = ?',
            [nombrePropietario, correo, contrasena, encryptionKey, nombreEstablecimiento, direccionEstablecimiento, telefonoEstablecimiento, id]
        );

        if (result.affectedRows === 0) {
            return res.render('Proveedor/perfilProveedor', {
                usuario: {...req.body, idProveedor: id},
                mensaje: 'No se pudo actualizar el proveedor'
            });
        }

        // Actualizar sesión
        req.session.user = {
            ...req.session.user,
            nombreUsuario: nombrePropietario,
            correo: correo
        };

        // Redireccionar con mensaje de éxito
        return res.redirect(`/perfilProveedor/${id}?mensaje=${encodeURIComponent('¡Datos actualizados correctamente!')}`);

    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        const id = req.params.id;
        res.render('Proveedor/perfilProveedor', {
            usuario: { ...req.body, idProveedor: id },
            mensaje: 'Error: No se pudo actualizar el perfil'
        });
    }
});

// ELiminar cuneta de proveedor ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/perfilProveedor/:id/eliminar', verificarAutenticacion, async (req, res) => {
    try {
        const id = req.params.id;
        
        // Agregar verificación de coincidencia con el usuario en sesión
        if (req.session.user.id != id) {
            console.error('ID de sesión no coincide con ID de parámetro');
            console.log('ID en sesión:', req.session.user.id);
            console.log('ID en parámetro:', id);
            return res.redirect('/login');
        }

        console.log('Intentando eliminar usuario con ID:', id);
        console.log('Datos de sesión:', req.session.user);

        // Verificar que el usuario existe
        const [usuarios] = await pool.query(
            'SELECT idProveedor, nombreProveedor FROM proveedor WHERE idProveedor = ?', 
            [id]
        );
        
        if (!usuarios.length) {
            console.error('Usuario no encontrado');
            return res.redirect(`/perfilProveedor/${id}?mensaje=${encodeURIComponent('Usuario no encontrado')}`);
        }

        console.log('Usuario encontrado:', usuarios[0]);

        // Ejecutar eliminación
        const [result] = await pool.query(
            'DELETE FROM proveedor WHERE idProveedor = ?', 
            [id]
        );
        
        console.log('Resultado de eliminación:', result);

        if (result.affectedRows === 0) {
            console.error('No se pudo eliminar la cuenta');
            return res.redirect(`/perfilProveedor/${id}?mensaje=${encodeURIComponent('No se pudo eliminar la cuenta')}`);
        }

        // Si se eliminó correctamente, destruir la sesión
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al cerrar la sesión:', err);
                return res.redirect(`/perfilProveedor/${id}?mensaje=${encodeURIComponent('Error al cerrar sesión')}`);
            }
            console.log('Sesión destruida correctamente');
            return res.redirect('/login');
        });
        
    } catch (error) {
        console.error('Error al eliminar la cuenta:', error);
        return res.redirect(`/perfilProveedor/${id}?mensaje=${encodeURIComponent('Error al eliminar la cuenta: ' + error.message)}`);
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