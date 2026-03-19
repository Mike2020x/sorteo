import { test, expect } from '@playwright/test';
import { storageManager } from '../js/storage.js';

test.describe('App Principal', () => {
    test.beforeEach(async ({ page }) => {
        storageManager.limpiarDatos();
        await page.goto('/');
    });

    test('debe cargar la página principal correctamente', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Sorteo');
    });

    test('debe mostrar todas las secciones principales', async ({ page }) => {
        await expect(page.locator('#configuracion')).toBeVisible();
        await expect(page.locator('#registro')).toBeVisible();
        await expect(page.locator('#participantes')).toBeVisible();
        await expect(page.locator('#numeros-disponibles')).toBeVisible();
    });

    test('debe guardar la configuración correctamente', async ({ page }) => {
        await page.fill('#descripcion', 'Rifa de Navidad');
        await page.fill('#precio', '50');
        await page.click('button:has-text("Guardar Configuración")');
        
        const configuracion = storageManager.obtenerConfiguracion();
        expect(configuracion.descripcion).toBe('Rifa de Navidad');
        expect(configuracion.precio).toBe(50);
    });

    test('debe registrar un participante correctamente', async ({ page }) => {
        await page.fill('#nombre', 'Juan Pérez');
        await page.fill('#telefono', '1234567890');
        await page.fill('#numero', '42');
        await page.click('button:has-text("Registrar Participante")');
        
        const participantes = storageManager.obtenerParticipantes();
        expect(participantes.length).toBe(1);
        expect(participantes[0].nombre).toBe('Juan Pérez');
        expect(participantes[0].numero).toBe(42);
    });

    test('debe mostrar mensaje de error al intentar usar número ocupado', async ({ page }) => {
        await page.fill('#nombre', 'Juan Pérez');
        await page.fill('#telefono', '1234567890');
        await page.fill('#numero', '42');
        await page.click('button:has-text("Registrar Participante")');
        
        await page.fill('#nombre', 'María García');
        await page.fill('#telefono', '0987654321');
        await page.fill('#numero', '42');
        await page.click('button:has-text("Registrar Participante")');
        
        const participantes = storageManager.obtenerParticipantes();
        expect(participantes.length).toBe(1);
    });

    test('debe cambiar el estado de pago de un participante', async ({ page }) => {
        await page.fill('#nombre', 'Juan Pérez');
        await page.fill('#telefono', '1234567890');
        await page.fill('#numero', '42');
        await page.click('button:has-text("Registrar Participante")');
        
        const participanteInicial = storageManager.obtenerParticipantePorNumero(42);
        expect(participanteInicial.pago).toBe('pendiente');
        
        await page.click('.btn-cambiar-estado');
        
        const participanteActualizado = storageManager.obtenerParticipantePorNumero(42);
        expect(participanteActualizado.pago).toBe('pagado');
    });

    test('debe eliminar un participante', async ({ page }) => {
        await page.fill('#nombre', 'Juan Pérez');
        await page.fill('#telefono', '1234567890');
        await page.fill('#numero', '42');
        await page.click('button:has-text("Registrar Participante")');
        
        let participantes = storageManager.obtenerParticipantes();
        expect(participantes.length).toBe(1);
        
        page.on('dialog', dialog => dialog.accept());
        await page.click('.btn-eliminar');
        
        participantes = storageManager.obtenerParticipantes();
        expect(participantes.length).toBe(0);
    });

    test('debe seleccionar número al hacer click en la grilla', async ({ page }) => {
        await page.click('.numero[data-numero="15"]');
        const valorInput = await page.inputValue('#numero');
        expect(valorInput).toBe('15');
    });

    test('debe renderizar todos los números en la grilla (0-99)', async ({ page }) => {
        const numeros = await page.locator('.numero').count();
        expect(numeros).toBe(100);
    });
});
