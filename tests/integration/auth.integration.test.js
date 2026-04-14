import request from 'supertest';
import app from '../../app.js';

describe('Pruebas de Integración - ALIMOP', () => {
    
    // ============================================================================
    // PRUEBA DE INTEGRACIÓN #1
    // ============================================================================
    describe('Prueba #1: Login Cliente + Redirección', () => {
        
        test('test_auth_integration::test_login_cliente_valido PASSED', async () => {
            console.log('\n' + '='.repeat(80));
            console.log('PRUEBA DE INTEGRACIÓN #1');
            console.log('='.repeat(80));
            console.log('Módulos involucrados: [Auth Routes] + [Database] + [Session Management]');
            console.log('Descripción: Cliente válido se autentica y es redirigido a su dashboard');
            console.log('');
            
            // ARRANGE (Preparación)
            console.log('ARRANGE (Preparación):');
            const clienteCredenciales = {
                email: 'jaimeCaromero0@hotmail.com',
                password: 'caromero1'
            };
            const estadoEsperado = 302; // Redirect
            const rutaEsperada = '/inicio/1';
            console.log(`  • Credenciales válidas: ${clienteCredenciales.email}`);
            console.log(`  • Contraseña: ${clienteCredenciales.password}`);
            console.log(`  • Status esperado: ${estadoEsperado}`);
            console.log(`  • Ruta esperada: ${rutaEsperada}`);
            console.log('');
            
            // ACT (Ejecución)
            console.log('ACT (Ejecución):');
            console.log('  1. Enviar POST /login con credenciales del cliente');
            const response = await request(app)
                .post('/login')
                .send(clienteCredenciales);
            console.log('  2. Verificar respuesta del servidor');
            console.log('');
            
            // ASSERT (Verificación)
            console.log('ASSERT (Verificación):');
            console.log(`  ✓ Status recibido: ${response.status}`);
            console.log(`  ✓ Ubicación (location): ${response.headers.location}`);
            expect(response.status).toBe(estadoEsperado);
            expect(response.headers.location).toContain(rutaEsperada);
            console.log('  ✓ Login cliente exitoso');
            console.log('='.repeat(80));
        });
    });

    // ============================================================================
    // PRUEBA DE INTEGRACIÓN #2
    // ============================================================================
    describe('Prueba #2: Login Proveedor + Redirección', () => {
        
        test('test_auth_integration::test_login_proveedor_valido PASSED', async () => {
            console.log('\n' + '='.repeat(80));
            console.log('PRUEBA DE INTEGRACIÓN #2');
            console.log('='.repeat(80));
            console.log('Módulos involucrados: [Auth Routes] + [Database] + [Session Management]');
            console.log('Descripción: Proveedor válido se autentica y es redirigido a su dashboard');
            console.log('');
            
            // ARRANGE (Preparación)
            console.log('ARRANGE (Preparación):');
            const proveedorCredenciales = {
                email: 'cecilia.castaneda@empresa.com',
                password: 'CCV-2941'
            };
            const estadoEsperado = 302; // Redirect
            const rutaEsperada = '/inicioProveedor/1';
            console.log(`  • Credenciales válidas: ${proveedorCredenciales.email}`);
            console.log(`  • Contraseña: ${proveedorCredenciales.password}`);
            console.log(`  • Status esperado: ${estadoEsperado}`);
            console.log(`  • Ruta esperada: ${rutaEsperada}`);
            console.log('');
            
            // ACT (Ejecución)
            console.log('ACT (Ejecución):');
            console.log('  1. Enviar POST /login con credenciales del proveedor');
            const response = await request(app)
                .post('/login')
                .send(proveedorCredenciales);
            console.log('  2. Verificar respuesta del servidor');
            console.log('');
            
            // ASSERT (Verificación)
            console.log('ASSERT (Verificación):');
            console.log(`  ✓ Status recibido: ${response.status}`);
            console.log(`  ✓ Ubicación (location): ${response.headers.location}`);
            expect(response.status).toBe(estadoEsperado);
            expect(response.headers.location).toContain(rutaEsperada);
            console.log('  ✓ Login proveedor exitoso');
            console.log('='.repeat(80));
        });
    });

    afterAll(async () => {
    // Cerrar conexiones pendientes
    await new Promise(resolve => setTimeout(() => resolve(), 500));
    });
});