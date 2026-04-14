import { Router } from "express";
import { pool } from "../config/database.js";
import { encryptionKey } from "../config/encryption.js";

const router = Router();

// Pagina de login unificado
router.get('/login', (req, res) => {
    res.render('login', {error: null, success: null});
});

// Login unificado para el cliente y el servidor
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('login', {
                error: 'Todods los campos son requeridos',
                success: null
            });
        }

        // Paso 1: Buscar  en la tabla "clientes"
        const [clientes] = await pool.query(
            'SELECT idCliente, nombreUsuario, correo FROM cliente WHERE correo = ? AND contrasena = AES_ENCRYPT(?, ?)', [email.trim(), password.trim(), encryptionKey]
        );

        if (clientes.length > 0) {
            const usuario = clientes[0];
            req.session.user = {
                id: usuario.idCliente,
                nombreUsuario: usuario.nombreUsuario,
                correo: usuario.correo,
                tipo: 'Cliente' // identificador del tipo
            };
            console.log('Cliente autenticado: ', usuario.idCliente);
            return res.redirect(`/inicio/${usuario.idCliente}`);
        }

        // Paso 2: Busacr en la tabla "proveedor"
        const [proveedores] = await pool.query(
            'SELECT idProveedor, nombreProveedor, correo FROM proveedor WHERE correo = ? AND contrasena = AES_ENCRYPT(?, ?)', [email.trim(), password.trim(), encryptionKey]
        );

        if (proveedores.length > 0) {
            const usuario = proveedores[0];
            req.session.user = {
                id: usuario.idProveedor,
                nombreUsuario: usuario.nombreProveedor,
                correo: usuario.correo,
                tipo: 'Proveedor' // identificador del tipo
            };
            console.log('Proveedor autenticado: ', usuario.idProveedor);
            return res.redirect(`/inicioProveedor/${usuario.idProveedor}`);
        }

        // Si no existe en ninguna tabla
        return res.render('login', {
            error: 'Credenciales incorrectas',
            success: null
        });

    } catch (error) {
        console.error('Error en login unificado: ', error);
        return res.render('login', {
            error: 'Error en el servidor',
            success: null
        });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Error al cerrar la sesion:', error);
        }
        res.redirect('/');
    });
});

export default router;