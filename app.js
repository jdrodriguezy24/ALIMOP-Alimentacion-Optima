// Librerias
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import clientesRoutes from './src/routes/Clientes.routes.js'; // Rutas de clientes
import proveedoresRoutes from './src/routes/Proveedores.routes.js' // Rutas de proveedores
import apiAlimentos from './src/routes/apiAlimentos.js';

// Iniciar
const app = express();

// Rutas 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuraciones
app.set('port', process.env.PORT || 8080);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));


// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Configuración de sesiones (DEBE IR ANTES DE LAS RUTAS)
app.use(session({
    secret: 'alimop_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 horas
        secure: false
    }
}));

// Agregar después de la configuración de sesión
app.use((req, res, next) => {
    console.log('Detalles de la sesión:', {
        sessionID: req.sessionID,
        user: req.session.user,
        url: req.url,
        method: req.method
    });
    next();
});

// Middleware para verificar sesión en cada petición
app.use((req, res, next) => {
    console.log('Sesión:', {
        id: req.sessionID,
        user: req.session.user
    });
    next();
});

// Rutas básicas
app.get('/', (req, res) => {
    res.render('index', {
        SesionActiva: !!req.session.user,
        user: req.session.user || null
    });
});

// Uso de las rutas importadas
app.use('/api', apiAlimentos);
app.use('/', clientesRoutes);
app.use('/', proveedoresRoutes);



// Iniciar servidor
app.listen(app.get('port'), () => {
    console.log(`Servidor corriendo en puerto: ${app.get('port')}`);
});