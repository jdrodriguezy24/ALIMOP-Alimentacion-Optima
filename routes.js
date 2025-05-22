import { Router } from 'express';
import { pool } from './conexion.js';

const router = Router();

// Middleware de autenticación
const verificarAutenticacion = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/loginC');
    }
};

// Registro de cliente
router.get('/registroC', (req, res) => {
    res.render('registroC');
});

// Iniciar sesión
router.get('/loginC', (req, res) => {
    res.render('loginC', { error: null });
});

// Registrar:::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.post('/registroC', async (req, res) => {
    try {
        const { Regnombre, Regemail, Regpassword } = req.body;

        // Verificar que todos los campos estén presentes
        if (!Regnombre || !Regemail || !Regpassword) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        const clienteNuevo = {
            nombreUsuario: Regnombre,
            Correo: Regemail,
            contrasenia: Regpassword
        };

        await pool.query('INSERT INTO cliente SET ?', [clienteNuevo]);

        // Redirigir al login con mensaje de éxito
        return res.render('loginC', { 
            error: null,
            success: 'Registro exitoso. Por favor, inicia sesión.'
        });

    } catch (error) {
        console.error('Error en registro:', error);
        return res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

// Iniciar sesión:::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.post('/loginC', async (req, res) => {
    try {
        const { Logemail, Logpassword } = req.body;

        const [usuarios] = await pool.query('SELECT idCliente, nombreUsuario, Correo FROM cliente WHERE Correo = ? AND contrasenia = ?',
            [Logemail, Logpassword]
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

            console.log('Sesión guardada:', req.session.user); // Debug
            
            // Se asegura que la redirección use el ID correcto
            return res.redirect(`/inicio/${usuario.idCliente}`);
        }

        return res.render('loginC', { error: 'Credenciales incorrectas' });

    } catch (error) {
        console.error('Error en login:', error);
        return res.render('loginC', { error: 'Error del servidor' });
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
            console.log('No hay sesión activa');
            return res.redirect('/loginC');
        }

        const userId = req.params.id;
        console.log('ID recibido:', userId);
        console.log('Usuario en sesión:', req.session.user);

        // Verifica que el ID coincida con el de la sesión
        if (req.session.user.id != userId) {
            console.log('ID no coincide con la sesión');
            return res.redirect('/loginC');
        }

        // Obtén los datos actualizados del usuario
        const [usuario] = await pool.query(
            'SELECT idCliente, nombreUsuario, Correo FROM cliente WHERE idCliente = ?',
            [userId]
        );

        if (!usuario.length) {
            console.log('Usuario no encontrado en la base de datos');
            return res.redirect('/loginC');
        }

        // Renderiza la página de inicio
        res.render('inicio', {
            user: req.session.user,
            error: null
        });

    } catch (error) {
        console.error('Error en la ruta de inicio:', error);
        res.redirect('/loginC');
    }
});

// Pagina perfil para usuario
router.get('/perfil/:id', verificarAutenticacion, async (req, res) => {
    try {
        // Obtener el ID del usuario
        const userId = req.params.id;
        const mensaje = req.query.mensaje || null; // Cambiado de req.params a req.query

        const[usuarios] = await pool.query('SELECT idCliente, nombreUsuario, Correo, contrasenia FROM cliente WHERE idCliente = ?',
            [userId]
        );

        if (usuarios.length > 0) {
            res.render('perfil', {
                usuario: usuarios[0],
                mensaje: mensaje // Pasamos el mensaje a la vista
            });
        } else {
            res.redirect('/loginC');
        }

    } catch (error) {
        console.error('Error al cargar perfil:', error);
        res.redirect('/loginC');
    }
});

// Actualizar datos::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.post('/perfil/:id/actualizar', verificarAutenticacion, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreUsuario, Correo, contrasenia } = req.body;

        // Validación
        if (!nombreUsuario || !Correo || !contrasenia) {
            return res.render('perfil', {
                usuario: {...req.body, idCliente: id},
                mensaje: 'Error: Todos los campos son requeridos'
            });
        }

        //Actualizar los usando idCliente en lugar de id
        const [result] = await pool.query('UPDATE cliente SET nombreUsuario = ?, Correo = ?, contrasenia = ? WHERE idCliente = ?',
            [nombreUsuario, Correo, contrasenia, id]
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
            correo: Correo
        };

        // Redireccionar con mensaje de éxito
        return res.redirect(`/perfil/${id}?mensaje=¡Datos actualizados correctamente!`);

    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        res.render('perfil', {
            usuario: { ...req.body, idCliente: id },
            mensaje: 'Error: No se pudo actualizar el perfil'
        });
    }
});

//Eliminar Cliente:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/perfil/:id/eliminar', verificarAutenticacion, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Intentando eliminar usuario con ID:', id); // Debug

        // Se Verifica que el usuario existe antes de ser eliminado
        const [usuarios] = await pool.query('SELECT idCliente FROM cliente WHERE idCliente = ?', [id]);
        
        if (!usuarios.length) {
            console.error('Usuario no encontrado');
            return res.redirect(`/perfil/${id}?mensaje=Usuario no encontrado`);
        }

        // Ejecutar eliminación
        const [result] = await pool.query('DELETE FROM cliente WHERE idCliente = ?', [id]);
        console.log('Resultado de eliminación:', result); // Debug

        if (result.affectedRows === 0) {
            console.error('No se pudo eliminar la cuenta');
            return res.redirect(`/perfil/${id}?mensaje=No se pudo eliminar la cuenta`);
        }

        // Si se eliminó correctamente, destruir la sesión
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al cerrar la sesión:', err); 
                return res.redirect(`/perfil/${id}?mensaje=Error al cerrar sesión`);
            }
            return res.redirect('/loginC');
        });
        
    } catch (error) {
        console.error('Error al eliminar la cuenta:', error);
        return res.redirect(`/perfil/${id}?mensaje=Error al eliminar la cuenta: ${error.message}`);
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