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

        // ============================================================================
        // OBTENER ESTADÍSTICAS REALES DEL PROVEEDOR
        // ============================================================================

        // 1. Órdenes pendientes/recientes (este mes)
        const [ordenesPendientes] = await pool.query(
            `SELECT COUNT(DISTINCT fv.idFacturaVenta) as ordenesPendientes 
             FROM facturaVenta fv
             JOIN alimentos a ON fv.idFacturaVenta = a.idFacturaVenta
             JOIN asignacionAlimento aa ON a.idAlimento = aa.idAlimento
             WHERE aa.idProveedor = ? AND MONTH(fv.Fecha) = MONTH(NOW())`,
            [userId]
        );

        // 2. Ingresos este mes
        const [ingresosData] = await pool.query(
            `SELECT SUM(fv.ValorTotal) as ingresosTotal
             FROM facturaVenta fv
             JOIN alimentos a ON fv.idFacturaVenta = a.idFacturaVenta
             JOIN asignacionAlimento aa ON a.idAlimento = aa.idAlimento
             WHERE aa.idProveedor = ? AND MONTH(fv.Fecha) = MONTH(NOW())`,
            [userId]
        );

        // 3. Productos activos
        const [productosActivos] = await pool.query(
            `SELECT COUNT(*) as productosActivos
             FROM asignacionAlimento aa
             JOIN alimentos a ON aa.idAlimento = a.idAlimento
             WHERE aa.idProveedor = ? AND a.cantidad > 0`,
            [userId]
        );

        // 4. Calificación promedio
        const [calificacionData] = await pool.query(
            `SELECT ROUND(AVG(ca.Nivel), 1) as calificacionPromedio, COUNT(*) as totalCalificaciones
             FROM calificacionAlimento ca
             JOIN alimentos a ON ca.idCalificacionAlimento = a.idCalificacionAlimento
             JOIN asignacionAlimento aa ON a.idAlimento = aa.idAlimento
             WHERE aa.idProveedor = ?`,
            [userId]
        );

        // 5. Órdenes recientes (últimas 5)
        const [ordenesRecientes] = await pool.query(
            `SELECT fv.idFacturaVenta, c.nombreUsuario, a.nombre, a.cantidad, DATE_FORMAT(fv.Fecha, '%d/%m/%Y') as Fecha, fv.ValorTotal
             FROM facturaVenta fv
             JOIN cliente c ON fv.idCliente = c.idCliente
             JOIN alimentos a ON fv.idFacturaVenta = a.idFacturaVenta
             JOIN asignacionAlimento aa ON a.idAlimento = aa.idAlimento
             WHERE aa.idProveedor = ?
             ORDER BY fv.Fecha DESC LIMIT 5`,
            [userId]
        );

        // 6. Productos con bajo stock
        const [bajoStock] = await pool.query(
            `SELECT a.idAlimento, a.nombre, a.cantidad
             FROM alimentos a
             JOIN asignacionAlimento aa ON a.idAlimento = aa.idAlimento
             WHERE aa.idProveedor = ? AND a.cantidad < 10
             ORDER BY a.cantidad ASC LIMIT 5`,
            [userId]
        );

        // Procesar datos para la vista
        const datos = {
            user: req.session.user,
            ordenesPendientes: ordenesPendientes[0]?.ordenesPendientes || 0,
            ingresosTotal: ingresosData[0]?.ingresosTotal || 0,
            productosActivos: productosActivos[0]?.productosActivos || 0,
            calificacionPromedio: calificacionData[0]?.calificacionPromedio || 0,
            totalCalificaciones: calificacionData[0]?.totalCalificaciones || 0,
            ordenesRecientes: ordenesRecientes,
            bajoStock: bajoStock,
            error: null
        };

        res.render('Proveedor/panelControl', datos);

    } catch (error) {
        console.log('Error en la ruta de panel de control:', error);
        res.render('Proveedor/panelControl', {
            user: req.session.user,
            error: 'Error al cargar los datos del panel',
            ordenesPendientes: 0,
            ingresosTotal: 0,
            productosActivos: 0,
            calificacionPromedio: 0,
            totalCalificaciones: 0,
            ordenesRecientes: [],
            bajoStock: []
        });
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

// Agregar Nuevo Producto :::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/agregarProducto/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;
        if (req.session.user.id != userId) {
            return res.redirect('/login');
        }
        
        // Obtener valores únicos de cada campo de clasificación
        const [clases] = await pool.query(
            `SELECT DISTINCT ClaseAlimento FROM calificacionAlimento ORDER BY ClaseAlimento`
        );
        const [niveles] = await pool.query(
            `SELECT DISTINCT Nivel FROM calificacionAlimento ORDER BY Nivel`
        );
        const [manipulaciones] = await pool.query(
            `SELECT DISTINCT Manipulacion FROM calificacionAlimento ORDER BY Manipulacion`
        );
        const [tiposManipulacion] = await pool.query(
            `SELECT DISTINCT TipoManipulacion FROM calificacionAlimento ORDER BY TipoManipulacion`
        );
        const [conservaciones] = await pool.query(
            `SELECT DISTINCT Conservacion FROM calificacionAlimento ORDER BY Conservacion`
        );

        res.render('Proveedor/agregarProducto', {
            user: req.session.user,
            clases: clases,
            niveles: niveles,
            manipulaciones: manipulaciones,
            tiposManipulacion: tiposManipulacion,
            conservaciones: conservaciones,
            error: null
        });
    } catch (error) {
        console.error('Error al cargar formulario de producto:', error);
        res.redirect(`/inicioProveedor/${userId}`);
    }
});

router.post('/agregarProducto/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;
        const { tipoAlimento, nombre, ValorUnidad, cantidad, fechaProduccion, fechaVencimiento, ClaseAlimento, Nivel, Manipulacion, TipoManipulacion, Conservacion } = req.body;

        // Validación de campos obligatorios
        if (!tipoAlimento || !nombre || !ValorUnidad || !cantidad || !fechaVencimiento || !ClaseAlimento || !Nivel || !Manipulacion || !TipoManipulacion || !Conservacion) {
            // Obtener valores para los dropdowns
            const [clases] = await pool.query(`SELECT DISTINCT ClaseAlimento FROM calificacionAlimento ORDER BY ClaseAlimento`);
            const [niveles] = await pool.query(`SELECT DISTINCT Nivel FROM calificacionAlimento ORDER BY Nivel`);
            const [manipulaciones] = await pool.query(`SELECT DISTINCT Manipulacion FROM calificacionAlimento ORDER BY Manipulacion`);
            const [tiposManipulacion] = await pool.query(`SELECT DISTINCT TipoManipulacion FROM calificacionAlimento ORDER BY TipoManipulacion`);
            const [conservaciones] = await pool.query(`SELECT DISTINCT Conservacion FROM calificacionAlimento ORDER BY Conservacion`);
            
            return res.render('Proveedor/agregarProducto', {
                user: req.session.user,
                clases: clases,
                niveles: niveles,
                manipulaciones: manipulaciones,
                tiposManipulacion: tiposManipulacion,
                conservaciones: conservaciones,
                error: 'Todos los campos incluyendo la clasificación del alimento son requeridos'
            });
        }

        // 1. Buscar si existe una calificación con esa combinación
        const [calificacionExistente] = await pool.query(
            `SELECT idCalificacionAlimento FROM calificacionAlimento 
             WHERE ClaseAlimento = ? AND Nivel = ? AND Manipulacion = ? AND TipoManipulacion = ? AND Conservacion = ?`,
            [ClaseAlimento, Nivel, Manipulacion, TipoManipulacion, Conservacion]
        );

        let idCalificacion;
        if (calificacionExistente.length > 0) {
            idCalificacion = calificacionExistente[0].idCalificacionAlimento;
        } else {
            // Crear la clasificación si no existe
            const [resultCalificacion] = await pool.query(
                `INSERT INTO calificacionAlimento (ClaseAlimento, Nivel, Manipulacion, TipoManipulacion, Conservacion) 
                 VALUES (?, ?, ?, ?, ?)`,
                [ClaseAlimento, Nivel, Manipulacion, TipoManipulacion, Conservacion]
            );
            idCalificacion = resultCalificacion.insertId;
        }

        // 2. Insertar el producto en la tabla alimentos
        const productoNuevo = {
            tipoAlimento: tipoAlimento,
            nombre: nombre.trim(),
            fechaProduccion: fechaProduccion || null,
            fechaVencimiento: fechaVencimiento,
            ValorUnidad: parseInt(ValorUnidad),
            cantidad: parseInt(cantidad),
            idCalificacionAlimento: idCalificacion
        };

        const [resultProducto] = await pool.query('INSERT INTO alimentos SET ?', [productoNuevo]);
        const idAlimento = resultProducto.insertId;

        // 3. Crear la relación en asignacionAlimento (vincular con proveedor)
        await pool.query(
            'INSERT INTO asignacionAlimento (idProveedor, idAlimento) VALUES (?, ?)',
            [userId, idAlimento]
        );

        res.redirect(`/inicioProveedor/${userId}?success=Producto agregado correctamente`);
    } catch (error) {
        console.error('Error al agregar producto:', error);
        
        // Obtener valores para los dropdowns
        const [clases] = await pool.query(`SELECT DISTINCT ClaseAlimento FROM calificacionAlimento ORDER BY ClaseAlimento`);
        const [niveles] = await pool.query(`SELECT DISTINCT Nivel FROM calificacionAlimento ORDER BY Nivel`);
        const [manipulaciones] = await pool.query(`SELECT DISTINCT Manipulacion FROM calificacionAlimento ORDER BY Manipulacion`);
        const [tiposManipulacion] = await pool.query(`SELECT DISTINCT TipoManipulacion FROM calificacionAlimento ORDER BY TipoManipulacion`);
        const [conservaciones] = await pool.query(`SELECT DISTINCT Conservacion FROM calificacionAlimento ORDER BY Conservacion`);
        
        res.render('Proveedor/agregarProducto', {
            user: req.session.user,
            clases: clases,
            niveles: niveles,
            manipulaciones: manipulaciones,
            tiposManipulacion: tiposManipulacion,
            conservaciones: conservaciones,
            error: 'Error al agregar el producto: ' + error.message
        });
    }
});

// Crear Oferta :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/crearOferta/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;
        if (req.session.user.id != userId) {
            return res.redirect('/login');
        }

        // Obtener productos del proveedor para mostrar en el formulario
        const [productos] = await pool.query(
            `SELECT a.idAlimento, a.nombre, a.ValorUnidad
            FROM alimentos a
            JOIN asignacionAlimento aa ON a.idAlimento = aa.idAlimento
            WHERE aa.idProveedor = ?`,
            [userId]
        );

        res.render('Proveedor/crearOferta', {
            user: req.session.user,
            productos: productos,
            error: null
        });
    } catch (error) {
        console.error('Error al cargar formulario de oferta:', error);
        res.redirect(`/inicioProveedor/${userId}`);
    }
});

router.post('/crearOferta/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;
        const { idProducto, descuento, fechaInicio, fechaFin } = req.body;

        if (!idProducto || !descuento) {
            return res.render('Proveedor/crearOferta', {
                user: req.session.user,
                error: 'Producto y descuento son requeridos'
            });
        }

        // Aquí insertarías la oferta en la base de datos

        res.redirect(`/inicioProveedor/${userId}?success=Oferta creada correctamente`);
    } catch (error) {
        console.error('Error al crear oferta:', error);
        res.redirect(`/inicioProveedor/${userId}`);
    }
});

// Reabastecer Producto :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/reabastecer/:idProducto/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;
        const productId = req.params.idProducto;

        if (req.session.user.id != userId) {
            return res.redirect('/login');
        }

        const [producto] = await pool.query(
            `SELECT a.idAlimento, a.nombre, a.cantidad, a.ValorUnidad
            FROM alimentos a
            JOIN asignacionAlimento aa ON a.idAlimento = aa.idAlimento
            WHERE a.idAlimento = ? AND aa.idProveedor = ?`,
            [productId, userId]
        );

        if (producto.length === 0) {
            return res.redirect(`/inicioProveedor/${userId}`);
        }

        res.render('Proveedor/reabastecer', {
            user: req.session.user,
            producto: producto[0],
            error: null
        });
    } catch (error) {
        console.error('Error al cargar formulario de reabastecimiento:', error);
        res.redirect(`/inicioProveedor/${req.params.id}`);
    }
});

router.post('/reabastecer/:idProducto/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;
        const productId = req.params.idProducto;
        const { cantidadAgregar } = req.body;

        if (!cantidadAgregar || cantidadAgregar <= 0) {
            return res.render('Proveedor/reabastecer', {
                user: req.session.user,
                error: 'Cantidad debe ser mayor a 0'
            });
        }

        // Actualizar cantidad en la base de datos
        await pool.query(
            'UPDATE alimentos SET cantidad = cantidad + ? WHERE idAlimento = ?',
            [cantidadAgregar, productId]
        );

        res.redirect(`/inicioProveedor/${userId}?success=Producto reabastecido correctamente`);
    } catch (error) {
        console.error('Error al reabastecer:', error);
        res.redirect(`/inicioProveedor/${req.params.id}`);
    }
});

// Ver Detalles de Orden :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/detalleOrden/:idOrden/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;
        const orderId = req.params.idOrden;

        if (req.session.user.id != userId) {
            return res.redirect('/login');
        }

        const [orden] = await pool.query(
            `SELECT fv.idFacturaVenta, fv.Fecha, fv.ValorTotal, c.nombreUsuario, c.correo, c.telefono,
                    a.nombre, a.cantidad, a.ValorUnidad
            FROM facturaVenta fv
            JOIN cliente c ON fv.idCliente = c.idCliente
            JOIN alimentos a ON fv.idFacturaVenta = a.idFacturaVenta
            JOIN asignacionAlimento aa ON a.idAlimento = aa.idAlimento
            WHERE fv.idFacturaVenta = ? AND aa.idProveedor = ?`,
            [orderId, userId]
        );

        if (orden.length === 0) {
            return res.redirect(`/inicioProveedor/${userId}`);
        }

        res.render('Proveedor/detalleOrden', {
            user: req.session.user,
            orden: orden[0],
            error: null
        });
    } catch (error) {
        console.error('Error al cargar detalles de orden:', error);
        res.redirect(`/inicioProveedor/${req.params.id}`);
    }
});

// Ver Todas las Órdenes :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/misOrdenes/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;
        if (req.session.user.id != userId) {
            return res.redirect('/login');
        }

        const [ordenes] = await pool.query(
            `SELECT fv.idFacturaVenta, c.nombreUsuario, a.nombre, a.cantidad, DATE_FORMAT(fv.Fecha, '%d/%m/%Y') as Fecha, fv.ValorTotal
            FROM facturaVenta fv
            JOIN cliente c ON fv.idCliente = c.idCliente
            JOIN alimentos a ON fv.idFacturaVenta = a.idFacturaVenta
            JOIN asignacionAlimento aa ON a.idAlimento = aa.idAlimento
            WHERE aa.idProveedor = ?
            ORDER BY fv.Fecha DESC`,
            [userId]
        );

        res.render('Proveedor/misOrdenes', {
            user: req.session.user,
            ordenes: ordenes,
            error: null
        });
    } catch (error) {
        console.error('Error al cargar órdenes:', error);
        res.redirect(`/inicioProveedor/${userId}`);
    }
});

// Ver Mis Productos :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/misProductos/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;
        if (req.session.user.id != userId) {
            return res.redirect('/login');
        }

        const [productos] = await pool.query(
            `SELECT a.idAlimento, a.nombre, a.cantidad, a.ValorUnidad
            FROM alimentos a
            JOIN asignacionAlimento aa ON a.idAlimento = aa.idAlimento
            WHERE aa.idProveedor = ? AND a.cantidad > 0
            ORDER BY a.nombre ASC`,
            [userId]
        );

        res.render('Proveedor/misProductos', {
            user: req.session.user,
            productos: productos,
            error: null
        });
    } catch (error) {
        console.error('Error al cargar productos:', error);
        res.redirect(`/inicioProveedor/${userId}`);
    }
});

// Ver Ingresos :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/misIngresos/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;
        if (req.session.user.id != userId) {
            return res.redirect('/login');
        }

        const [ingresos] = await pool.query(
            `SELECT DATE_FORMAT(fv.Fecha, '%Y-%m') as mes, SUM(fv.ValorTotal) as total
            FROM facturaVenta fv
            JOIN alimentos a ON fv.idFacturaVenta = a.idFacturaVenta
            JOIN asignacionAlimento aa ON a.idAlimento = aa.idAlimento
            WHERE aa.idProveedor = ?
            GROUP BY DATE_FORMAT(fv.Fecha, '%Y-%m')
            ORDER BY mes DESC`,
            [userId]
        );

        res.render('Proveedor/misIngresos', {
            user: req.session.user,
            ingresos: ingresos,
            error: null
        });
    } catch (error) {
        console.error('Error al cargar ingresos:', error);
        res.redirect(`/inicioProveedor/${userId}`);
    }
});

// Ver Reseñas :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/misResenas/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;
        if (req.session.user.id != userId) {
            return res.redirect('/login');
        }

        const [resenas] = await pool.query(
            `SELECT ca.idCalificacionAlimento, ca.claseAlimento, ca.Nivel, ca.Manipulacion, ca.TipoManipulacion, ca.Conservacion, a.nombre
             FROM calificacionAlimento ca
             JOIN alimentos a ON ca.idCalificacionAlimento = a.idCalificacionAlimento
             JOIN asignacionAlimento aa ON a.idAlimento = aa.idAlimento
             WHERE aa.idProveedor = ?`,
            [userId]
        );

        res.render('Proveedor/misResenas', {
            user: req.session.user,
            resenas: resenas,
            error: null
        });
    } catch (error) {
        console.error('Error al cargar reseñas:', error);
        res.redirect(`/inicioProveedor/${userId}`);
    }
});

// Notificaciones :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/notificaciones/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;
        if (req.session.user.id != userId) {
            return res.redirect('/login');
        }

        res.render('Proveedor/notificaciones', {
            user: req.session.user,
            notificaciones: [],
            error: null
        });
    } catch (error) {
        console.error('Error al cargar notificaciones:', error);
        res.redirect(`/inicioProveedor/${userId}`);
    }
});

// Mensajes :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get('/mensajes/:id', verificarAutenticacion, async (req, res) => {
    try {
        const userId = req.params.id;
        if (req.session.user.id != userId) {
            return res.redirect('/login');
        }

        res.render('Proveedor/mensajes', {
            user: req.session.user,
            mensajes: [],
            error: null
        });
    } catch (error) {
        console.error('Error al cargar mensajes:', error);
        res.redirect(`/inicioProveedor/${userId}`);
    }
});

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