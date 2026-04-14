import request from 'supertest';
import app from '../../app.js';

describe('Flujo E2E - Cliente Completo', () => {
    
    test('E2E: Acceso a Principal → Búsqueda → Login → Dashboard', async () => {
        
        console.log('\n' + '='.repeat(80));
        console.log('PRUEBA E2E (EXTREMO A EXTREMO)');
        console.log('='.repeat(80));
        
        // ========================================================================
        // INFORMACIÓN DEL FLUJO
        // ========================================================================
        console.log('\nFlujo probado: Acceso Principal → Búsqueda de Alimentos → Login Cliente → Dashboard Inicial');
        
        console.log('\nPasos del flujo:');
        console.log('  1. Acceder a página principal /');
        console.log('  2. Realizar búsqueda de alimentos con término "pan"');
        console.log('  3. Acceder a página de login');
        console.log('  4. Autentica como cliente y ser redirigido al dashboard');
        
        console.log('\nResultado esperado:');
        console.log('  ● Cliente completamente autenticado y accediendo a su dashboard privado');
        
        // ========================================================================
        // PASO 1: Acceder a página principal
        // ========================================================================
        console.log('\n' + '-'.repeat(80));
        console.log('PASO 1: Acceso a página principal');
        console.log('-'.repeat(80));
        
        const mainPage = await request(app).get('/');
        
        console.log(`  📍 GET / → Status: ${mainPage.status}`);
        expect(mainPage.status).toBe(200);
        expect(mainPage.text).toContain('ALIMOP');
        console.log('  ✅ Principal cargada correctamente con ALIMOP encontrado');
        
        // ========================================================================
        // PASO 2: Búsqueda de alimentos
        // ========================================================================
        console.log('\n' + '-'.repeat(80));
        console.log('PASO 2: Búsqueda de alimentos (pan)');
        console.log('-'.repeat(80));
        
        const searchResponse = await request(app)
            .get('/api/alimentos')
            .query({ q: 'pan' });
        
        console.log(`  📍 GET /api/alimentos?q=pan → Status: ${searchResponse.status}`);
        expect(searchResponse.status).toBe(200);
        
        const alimentos = searchResponse.body;
        console.log(`  📊 Alimentos encontrados: ${Array.isArray(alimentos) ? alimentos.length : 0}`);
        
        if (Array.isArray(alimentos) && alimentos.length > 0) {
            console.log(`  ✅ Búsqueda exitosa: ${alimentos.length} producto(s) encontrado(s)`);
            alimentos.slice(0, 2).forEach((item, idx) => {
                console.log(`     • Producto ${idx + 1}: ${item.nombre || item.id}`);
            });
        } else {
            console.log('  ⚠️  No se encontraron resultados pero la búsqueda respondió');
        }
        
        // ========================================================================
        // PASO 3: Acceso a página de login
        // ========================================================================
        console.log('\n' + '-'.repeat(80));
        console.log('PASO 3: Acceso a página de login');
        console.log('-'.repeat(80));
        
        const loginPage = await request(app).get('/login');
        
        console.log(`  📍 GET /login → Status: ${loginPage.status}`);
        expect(loginPage.status).toBe(200);
        expect(loginPage.text).toContain('login');
        console.log('  ✅ Página de login cargada correctamente');
        
        // ========================================================================
        // PASO 4: Autenticación y redirección al dashboard
        // ========================================================================
        console.log('\n' + '-'.repeat(80));
        console.log('PASO 4: Autenticación como cliente y redirección');
        console.log('-'.repeat(80));
        
        const loginResponse = await request(app)
            .post('/login')
            .send({
                email: 'jaimeCaromero0@hotmail.com',
                password: 'caromero1'
            });
        
        console.log('  📍 POST /login → Enviando credenciales');
        console.log('     Email: jaimeCaromero0@hotmail.com');
        console.log(`  📨 Status recibido: ${loginResponse.status}`);
        expect(loginResponse.status).toBe(302);
        
        const redirectLocation = loginResponse.headers.location;
        console.log(`  🔀 Redirección: ${redirectLocation}`);
        expect(redirectLocation).toContain('/inicio/1');
        console.log('  ✅ Redirección al dashboard de cliente correcta (/inicio/1)');
        
        // ========================================================================
        // VERIFICACIÓN FINAL
        // ========================================================================
        console.log('\n' + '='.repeat(80));
        console.log('Resultado real:');
        console.log('  ✅ Paso 1: Página principal accedida correctamente');
        console.log('  ✅ Paso 2: Búsqueda de alimentos respondió exitosamente');
        console.log('  ✅ Paso 3: Página de login cargada');
        console.log('  ✅ Paso 4: Cliente autenticado y redirigido a /inicio/1');
        console.log('\nEstado del flujo: ✅ Completamente funcional');
        console.log('='.repeat(80) + '\n');
        
    });
    
    afterAll(async () => {
        // Esperar a que se cierren conexiones pendientes
        await new Promise(resolve => setTimeout(() => resolve(), 500));
    });
});
