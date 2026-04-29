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

// Registro de cliente
router.get('/Cliente/registroCliente', (req, res) => {
    res.render('Cliente/registroCliente');
});


// Registrar:::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.post('/registroCliente', async (req, res) => {
    try {
        const { Regnombre, Regemail, Regpassword } = req.body;

        // Limpia los datos antes de guardar
        const clienteNuevo = {
            nombreUsuario: Regnombre.trim(),
            correo: Regemail.trim(),
            contrasena: await pool.query('SELECT AES_ENCRYPT(?, ?) as encrypted', [Regpassword.trim(), encryptionKey]
            ).then(([result]) => result[0].encrypted)
        };

        // Verificar que todos los campos estén presentes
        if (!clienteNuevo.nombreUsuario || !clienteNuevo.correo || !clienteNuevo.contrasena) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        await pool.query('INSERT INTO cliente SET ?', [clienteNuevo]);

        // Redirigir al login con mensaje de éxito
        return res.render('login', {
            error: null,
            success: 'Registro exitoso. Por favor, inicia sesión.'
        });

    } catch (error) {
        console.error('Error en registro:', error);
        return res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

// Ruta de inicio - Unificada para Cliente y Proveedor
router.get('/inicio/:id', async (req, res) => {
    try {
        // Verifica si hay una sesión activa
        if (!req.session.user) {
            return res.redirect('/login');
        }

        // Limpia el ID recibido
        const userId = req.params.id.trim();
        console.log('ID recibido:', userId);
        console.log('Usuario en sesión:', req.session.user);

        // Verifica que el ID coincida con el de la sesión
        if (req.session.user.id != userId) {
            console.log('ID no coincide con la sesión');
            return res.redirect('/login');
        }

        // Si es un cliente, obtén los datos del cliente
        if (req.session.user.tipo === 'Cliente') {
            const [usuario] = await pool.query(
                'SELECT idCliente, nombreUsuario, correo FROM cliente WHERE idCliente = ?',
                [userId]
            );

            if (!usuario.length) {
                console.log('Usuario cliente no encontrado en la base de datos');
                return res.redirect('/login');
            }
        }
        // Si es un proveedor, obtén los datos del proveedor
        else if (req.session.user.tipo === 'Proveedor') {
            const [usuario] = await pool.query(
                'SELECT idProveedor, nombreProveedor, correo FROM proveedor WHERE idProveedor = ?',
                [userId]
            );

            if (!usuario.length) {
                console.log('Usuario proveedor no encontrado en la base de datos');
                return res.redirect('/login');
            }
        }

        // Renderiza la página de inicio (la misma para ambos)
        res.render('inicio', {
            user: req.session.user,
            error: null
        });

    } catch (error) {
        console.error('Error en la ruta de inicio:', error);
        res.redirect('/login');
    }
});

// Actualizar datos::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/perfil/:id', verificarAutenticacion, async (req, res) => {
    try {
        // Obtener el ID del usuario
        const userId = req.params.id;
        const mensaje = req.query.mensaje || null;

        // Verificar que el ID del usuario coincida con el de la sesión
        if (req.session.user.id != userId) {
            return res.redirect('/login');
        }

        const[usuarios] = await pool.query(
            'SELECT idCliente, nombreUsuario, correo,  CAST(AES_DECRYPT(contrasena, ?) AS CHAR) as contrasena FROM cliente WHERE idCliente = ?',
            [encryptionKey, userId]
        );

        if (usuarios.length > 0) {
            res.render('Cliente/perfil', {
                usuario: usuarios[0],
                mensaje: mensaje // Pasamos el mensaje a la vista
            });
        } else {
            res.redirect('/login');
        }

    } catch (error) {
        console.error('Error al cargar perfil:', error);
        res.redirect('/login');
    }
});

// Actualizar perfil:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.post('/perfil/:id/actualizar', verificarAutenticacion, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreUsuario, correo, contrasena } = req.body;

        // Validación
        if (!nombreUsuario || !correo || !contrasena) {
            return res.render('Cliente/perfil', {
                usuario: {...req.body, idCliente: id},
                mensaje: 'Error: Todos los campos son requeridos'
            });
        }

        //Actualizar los usando idCliente en lugar de id
        const [result] = await pool.query('UPDATE cliente SET nombreUsuario = ?, correo = ?, contrasena = AES_ENCRYPT(?, ?) WHERE idCliente = ?',
            [nombreUsuario, correo, contrasena, encryptionKey, id]
        );

        if (result.affectedRows === 0) {
            return res.render('perfil', {
                usuario: {...req.body, idCliente: id},
                mensaje: 'No se pudo actualizar el usuario'
            });
        }

        // Actualizar sesión
        req.session.user = {
            id: parseInt(id),
            nombreUsuario,
            correo
        };

        // Redireccionar con mensaje de éxito
        return res.redirect(`/perfil/${id}?mensaje=${encodeURIComponent('¡Datos actualizados correctamente!')}`);

    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        res.render('Cliente/perfil', {
            usuario: { ...req.body, idCliente: id },
            mensaje: 'Error: No se pudo actualizar el perfil'
        });
    }
});

//Eliminar Cliente:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/perfil/:id/eliminar', verificarAutenticacion, async (req, res) => {
    try {
        const { id } = req.params;
        
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
            'SELECT idCliente, nombreUsuario FROM cliente WHERE idCliente = ?', 
            [id]
        );
        
        if (!usuarios.length) {
            console.error('Usuario no encontrado');
            return res.redirect(`/perfil/${id}?mensaje=${encodeURIComponent('Usuario no encontrado')}`);
        }

        console.log('Usuario encontrado:', usuarios[0]);

        // Ejecutar eliminación
        const [result] = await pool.query(
            'DELETE FROM cliente WHERE idCliente = ?', 
            [id]
        );
        
        console.log('Resultado de eliminación:', result);

        if (result.affectedRows === 0) {
            console.error('No se pudo eliminar la cuenta');
            return res.redirect(`/perfil/${id}?mensaje=${encodeURIComponent('No se pudo eliminar la cuenta')}`);
        }

        // Si se eliminó correctamente, destruir la sesión
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al cerrar la sesión:', err);
                return res.redirect(`/perfil/${id}?mensaje=${encodeURIComponent('Error al cerrar sesión')}`);
            }
            console.log('Sesión destruida correctamente');
            return res.redirect('/login');
        });
        
    } catch (error) {
        console.error('Error al eliminar la cuenta:', error);
        return res.redirect(`/perfil/${id}?mensaje=${encodeURIComponent('Error al eliminar la cuenta: ' + error.message)}`);
    }
});

// Ruta para Restaurantes::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/Restaurantes', async (req, res) => {
    try {
        const SesionActiva = req.session && req.session.user;

        res.render('Restaurantes', {
            user: SesionActiva ? req.session.user : null,
            SesionActiva: SesionActiva
        });
    } catch (error) {
        console.error('Error al cargar los restaurantes:', error);
        res.status(500).send('Error al cargar la página');
    }
});

export default router;