// Librerias
import express from 'express';
import session from 'express-session';
import routes from './routes.js';

// Iniciar
const app = express();

// Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));

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

// Usar las rutas del archivo routes.js
app.use('/', routes);

// Iniciar servidor
app.listen(app.get('port'), () => {
    console.log(`Servidor corriendo en puerto ${app.get('port')}`);
});