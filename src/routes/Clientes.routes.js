import { Router } from 'express';
import { pool } from '../config/database.js';
import { encryptionKey } from '../config/encryption.js';

const router = Router();

// Middleware de autenticación
const verificarAutenticacion = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/Cliente/loginCliente');
    }
};

// Registro de cliente
router.get('/Cliente/registroCliente', (req, res) => {
    res.render('Cliente/registroCliente');
});

// Iniciar sesión
router.get('/Cliente/loginCliente', (req, res) => {
    res.render('Cliente/loginCliente', { error: null, success: null });
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
        return res.render('Cliente/loginCliente', {
            error: null,
            success: 'Registro exitoso. Por favor, inicia sesión.'
        });

    } catch (error) {
        console.error('Error en registro:', error);
        return res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

// Iniciar sesión:::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.post('/loginCliente', async (req, res) => {
    try {
        const { Logemail, Logpassword } = req.body;
        
        // Limpia los datos antes de la consulta
        //const emailLimpio = Logemail.trim();
        //const passwordBuffer = Buffer.from(Logpassword.trim());

        const [usuarios] = await pool.query(
            'SELECT idCliente, nombreUsuario, correo FROM cliente WHERE correo = ? AND contrasena = AES_ENCRYPT(?, ?)',
            [Logemail.trim(), Logpassword.trim(), encryptionKey]
        );

        console.log('Usuario encontrado:', usuarios[0]); // Debug

        if (usuarios.length > 0) {
            const usuario = usuarios[0];
            
            // Guardamos el ID correcto en la sesión
            req.session.user = {
                id: usuario.idCliente,
                nombreUsuario: usuario.nombreUsuario,
                correo: usuario.Correo
            };
            
            // Usar el ID directamente sin espacios o caracteres especiales
            return res.redirect(`/inicio/${usuario.idCliente}`);
        }

        return res.render('Cliente/loginCliente', { error: 'Credenciales incorrectas' });

    } catch (error) {
        console.error('Error en login:', error);
        return res.render('Cliente/loginCliente', { error: 'Error del servidor' });
    }
});

// Cerrar sesión:::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.post('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Error al cerrar sesión:', error);
            return res.status(500).json({ message: 'Error interno del servidor al cerrar sesión' });
        }
        res.redirect('/');
    });
});

// Ruta de inicio
router.get('/inicio/:id', async (req, res) => {
    try {
        // Verifica si hay una sesión activa
        if (!req.session.user) {
            return res.redirect('/Cliente/loginCliente');
        }

        // Limpia el ID recibido
        const userId = req.params.id.trim();
        console.log('ID recibido:', userId);
        console.log('Usuario en sesión:', req.session.user);

        // Verifica que el ID coincida con el de la sesión
        if (req.session.user.id != userId) {
            console.log('ID no coincide con la sesión');
            return res.redirect('/Cliente/loginCliente');
        }

        // Obtén los datos actualizados del usuario
        const [usuario] = await pool.query(
            'SELECT idCliente, nombreUsuario, correo FROM cliente WHERE idCliente = ?',
            [userId]
        );

        if (!usuario.length) {
            console.log('Usuario no encontrado en la base de datos');
            return res.redirect('/Cliente/loginCliente');
        }

        // Renderiza la página de inicio
        res.render('Cliente/inicio', {
            user: req.session.user,
            error: null
        });

    } catch (error) {
        console.error('Error en la ruta de inicio:', error);
        res.redirect('/Cliente/loginCliente');
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
            return res.redirect('/Cliente/loginCliente');
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
            res.redirect('/Cliente/loginCliente');
        }

    } catch (error) {
        console.error('Error al cargar perfil:', error);
        res.redirect('/Cliente/loginCliente');
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
            return res.redirect('/Cliente/loginCliente');
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
            return res.redirect('/Cliente/loginCliente');
        });
        
    } catch (error) {
        console.error('Error al eliminar la cuenta:', error);
        return res.redirect(`/perfil/${id}?mensaje=${encodeURIComponent('Error al eliminar la cuenta: ' + error.message)}`);
    }
});

// Ruta para listaEmpresas::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/listaEmpresas', async (req, res) => {
    try {
        const SesionActiva = req.session && req.session.user;

        res.render('listaEmpresas', {
            user: SesionActiva ? req.session.user : null,
            SesionActiva: SesionActiva
        });
    } catch (error) {
        console.error('Error al cargar lista de empresas:', error);
        res.status(500).send('Error al cargar la página');
    }
});

export default router;