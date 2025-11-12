import { Router } from 'express';
import { pool } from '../config/database.js';

const router = Router();

router.get('/alimentos', async (req, res) => {
    try {
        const { q } = req.query;

        console.log('Búsqueda recibida:', q);

        if (!q || q.trim() === '') {
            return res.json([]);
        }

        // Ajustado a los nombres reales de tu tabla
        const [resultados] = await pool.query(
            'SELECT idAlimento, nombre, tipoAlimento as categoria, valorUnidad as precio FROM alimentos WHERE nombre LIKE ? OR tipoAlimento LIKE ? LIMIT 10',
            [`%${q}%`, `%${q}%`]
        );

        console.log('Resultados encontrados:', resultados);
        res.json(resultados);

    } catch (error) {
        console.error('Error en búsqueda:', error);
        res.status(500).json({ error: 'Error en la búsqueda' });
    }
});

export default router;