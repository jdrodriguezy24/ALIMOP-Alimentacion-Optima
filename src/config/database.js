import {createPool} from 'mysql2/promise';

const pool = createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admins25', // admins25
    database: process.env.DB_DATABASE || 'alimop', // alimop
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export {pool};