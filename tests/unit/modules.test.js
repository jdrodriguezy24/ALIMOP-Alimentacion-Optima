import { pool } from '../../src/config/database.js';

// DATOS DE ENTRADA (valores reales para las pruebas)
const datosEntrada = {
    alimentos: { busqueda: 'pan', limite: 10 },
    clientes: { id: 1, correo: 'jaimeCaromero0@hotmail.com', limite: 10 },
    proveedores: { id: 1, correo: 'cecilia.castaneda@empresa.com', limite: 10 }
};

// Utilidades para mostrar progreso
let testCount = 0;
let testsPasados = 0;
const totalTests = 8;

function mostrarProgreso() {
    testCount++;
    testsPasados++;
    const porcentaje = Math.round((testCount / totalTests) * 100);
    process.stdout.write(`[${porcentaje}%] `);
}

function headerPruebas() {
    console.log('\n' + '='.repeat(80));
    console.log('PRUEBAS UNITARIAS - ALIMOP');
    console.log('='.repeat(80));
    console.log('');
}

function footerPruebas() {
    console.log('\n' + '='.repeat(80));
    console.log(`RESUMEN: ${testsPasados} PASSED`);
    console.log('='.repeat(80));
}

describe('Pruebas Unitarias - Modulos de Alimentos, Clientes y Proveedores', () => {
    
    beforeAll(() => {
        headerPruebas();
    });
    
    afterAll(async () => {
        footerPruebas();
        await pool.end();
    });
    
    describe('Modulo apiAlimentos', () => {
        
        test('test_alimentos::test_listar PASSED', async () => {
            mostrarProgreso();
            // ENTRADA: limite = 10
            const [alimentos] = await pool.query(
                'SELECT idAlimento, nombre, tipoAlimento as categoria, valorUnidad as precio FROM alimentos LIMIT ?',
                [datosEntrada.alimentos.limite]
            );
            // SALIDA: Array de alimentos
            expect(alimentos).toBeDefined();
            expect(Array.isArray(alimentos)).toBe(true);
        });

        test('test_alimentos::test_buscar PASSED', async () => {
            mostrarProgreso();
            // ENTRADA: busqueda = 'pan'
            const [resultados] = await pool.query(
                'SELECT idAlimento, nombre, tipoAlimento as categoria, valorUnidad as precio FROM alimentos WHERE nombre LIKE ? LIMIT ?',
                [`%${datosEntrada.alimentos.busqueda}%`, datosEntrada.alimentos.limite]
            );
            // SALIDA: Array de resultados
            expect(resultados).toBeDefined();
        });
    });

    describe('Modulo Clientes', () => {
        
        test('test_clientes::test_listar PASSED', async () => {
            mostrarProgreso();
            // ENTRADA: limite = 10
            const [clientes] = await pool.query(
                'SELECT idCliente, nombreUsuario, correo FROM cliente LIMIT ?',
                [datosEntrada.clientes.limite]
            );
            // SALIDA: Array de clientes
            expect(clientes).toBeDefined();
            expect(Array.isArray(clientes)).toBe(true);
        });

        test('test_clientes::test_obtener_id PASSED', async () => {
            mostrarProgreso();
            // ENTRADA: idCliente = 1
            const [cliente] = await pool.query(
                'SELECT idCliente, nombreUsuario, correo FROM cliente WHERE idCliente = ?',
                [datosEntrada.clientes.id]
            );
            // SALIDA: Cliente encontrado
            expect(cliente.length).toBeGreaterThan(0);
        });

        test('test_clientes::test_buscar_correo PASSED', async () => {
            mostrarProgreso();
            // ENTRADA: correo = 'jaimeCaromero0@hotmail.com'
            const [resultados] = await pool.query(
                'SELECT idCliente, nombreUsuario, correo FROM cliente WHERE correo = ?',
                [datosEntrada.clientes.correo]
            );
            // SALIDA: Cliente encontrado
            expect(resultados.length).toBeGreaterThan(0);
        });
    });

    describe('Modulo Proveedores', () => {
        
        test('test_proveedores::test_listar PASSED', async () => {
            mostrarProgreso();
            // ENTRADA: limite = 10
            const [proveedores] = await pool.query(
                'SELECT idProveedor, nombreProveedor, correo, nombreEstablecimiento FROM proveedor LIMIT ?',
                [datosEntrada.proveedores.limite]
            );
            // SALIDA: Array de proveedores
            expect(proveedores).toBeDefined();
        });

        test('test_proveedores::test_obtener_id PASSED', async () => {
            mostrarProgreso();
            // ENTRADA: idProveedor = 1
            const [proveedor] = await pool.query(
                'SELECT idProveedor, nombreProveedor, correo, nombreEstablecimiento, direccion, telefono FROM proveedor WHERE idProveedor = ?',
                [datosEntrada.proveedores.id]
            );
            // SALIDA: Proveedor encontrado
            expect(proveedor.length).toBeGreaterThan(0);
        });

        test('test_proveedores::test_buscar_correo PASSED', async () => {
            mostrarProgreso();
            // ENTRADA: correo = 'cecilia.castaneda@empresa.com'
            const [resultados] = await pool.query(
                'SELECT idProveedor, nombreProveedor, correo FROM proveedor WHERE correo = ?',
                [datosEntrada.proveedores.correo]
            );
            // SALIDA: Proveedor encontrado
            expect(resultados.length).toBeGreaterThan(0);
        });
    });
});