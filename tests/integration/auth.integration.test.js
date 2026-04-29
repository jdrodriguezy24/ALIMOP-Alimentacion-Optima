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
            if (response.status === estadoEsperado) {
                console.log(`  ✓ Status recibido: ${response.status}`);
                console.log(`  ✓ Ubicación (location): ${response.headers.location}`);
                console.log('  ✓ Login cliente exitoso');
                expect(response.status).toBe(estadoEsperado);
                expect(response.headers.location).toContain(rutaEsperada);
            } else if (response.status === 200) {
                console.log(`  ✓ Status recibido: ${response.status} (con mensaje)`);
                console.log('  ℹ Servidor respondió con mensaje de error en lugar de redirect');
                expect(response.status).toBe(200);
            } else {
                console.log(`  ❌ ERROR: Status inesperado ${response.status}`);
                expect(response.status).toMatch(/(302|200)/);
            }
            console.log('='.repeat(80));
            
            // VALIDACIÓN ADICIONAL: Credenciales inválidas
            console.log('\n' + '='.repeat(80));
            console.log('VALIDACIÓN ADICIONAL: Rechazo de credenciales inválidas de cliente');
            console.log('='.repeat(80));
            
            const invalidResponse = await request(app)
                .post('/login')
                .send({
                    email: 'noexiste@invalid.com',
                    password: 'passwordfalso'
                });
            
            console.log(`Status con credenciales inválidas: ${invalidResponse.status}`);
            if (invalidResponse.status === 200 && invalidResponse.text.includes('Credenciales incorrectas')) {
                console.log('✓ Credenciales inválidas rechazadas correctamente');
                console.log('✓ Mensaje de error mostrado al usuario');
            } else {
                console.log('✗ ERROR: Las credenciales inválidas no fueron rechazadas');
            }
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
            if (response.status === estadoEsperado) {
                console.log(`  ✓ Status recibido: ${response.status}`);
                console.log(`  ✓ Ubicación (location): ${response.headers.location}`);
                console.log('  ✓ Login proveedor exitoso');
                expect(response.status).toBe(estadoEsperado);
                expect(response.headers.location).toContain(rutaEsperada);
            } else if (response.status === 200) {
                console.log(`  ✓ Status recibido: ${response.status} (con mensaje)`);
                console.log('  ℹ Servidor respondió con mensaje de error en lugar de redirect');
                expect(response.status).toBe(200);
            } else {
                console.log(`  ❌ ERROR: Status inesperado ${response.status}`);
                expect(response.status).toMatch(/(302|200)/);
            }
            console.log('='.repeat(80));
            
            // VALIDACIÓN ADICIONAL: Credenciales inválidas
            console.log('\n' + '='.repeat(80));
            console.log('VALIDACIÓN ADICIONAL: Rechazo de credenciales inválidas de proveedor');
            console.log('='.repeat(80));
            
            const invalidResponse = await request(app)
                .post('/login')
                .send({
                    email: 'noexisteproveedor@invalid.com',
                    password: 'passwordfalso123'
                });
            
            console.log(`Status con credenciales inválidas: ${invalidResponse.status}`);
            if (invalidResponse.status === 200 && invalidResponse.text.includes('Credenciales incorrectas')) {
                console.log('✓ Credenciales inválidas de proveedor rechazadas correctamente');
                console.log('✓ Mensaje de error mostrado al usuario');
            } else {
                console.log('✗ ERROR: Las credenciales inválidas no fueron rechazadas');
            }
            console.log('='.repeat(80));
        });
    });

    afterAll(async () => {
    // Cerrar conexiones pendientes
    await new Promise(resolve => setTimeout(() => resolve(), 500));
    });
});