import { test, expect } from '@playwright/test';
import { ticketGenerator } from '../js/ticket.js';

test.describe('Ticket Generator', () => {
    test('debe crear un canvas para el ticket', () => {
        ticketGenerator.crearCanvas();
        
        expect(ticketGenerator.canvas).not.toBeNull();
        expect(ticketGenerator.canvas.width).toBe(400);
        expect(ticketGenerator.canvas.height).toBe(600);
    });

    test('debe generar ticket con datos correctos', () => {
        const participante = {
            numero: 42,
            nombre: 'Juan Pérez',
            telefono: '5551234567',
            pago: 'pagado',
            fechaRegistro: new Date().toISOString(),
        };
        
        const configuracion = {
            descripcion: 'Rifa de Navidad',
            precio: 50,
        };
        
        const dataUrl = ticketGenerator.generarTicket(participante, configuracion);
        
        expect(dataUrl).toContain('data:image/png;base64');
        expect(dataUrl.length).toBeGreaterThan(1000);
    });

    test('debe generar ticket con precio cero si no se especifica', () => {
        const participante = {
            numero: 0,
            nombre: 'Test',
            telefono: '000',
            pago: 'pendiente',
            fechaRegistro: new Date().toISOString(),
        };
        
        const configuracion = {
            descripcion: 'Test',
            precio: 0,
        };
        
        const dataUrl = ticketGenerator.generarTicket(participante, configuracion);
        expect(dataUrl).toContain('data:image/png;base64');
    });

    test('debe guardar ticket como imagen y retornarlo', () => {
        const participante = {
            numero: 77,
            nombre: 'María García',
            telefono: '5559876543',
            pago: 'pagado',
            fechaRegistro: new Date().toISOString(),
        };
        
        const configuracion = {
            descripcion: 'Gran Sorteo',
            precio: 100,
        };
        
        const dataUrl = ticketGenerator.guardarTicketComoImagen(participante, configuracion);
        
        expect(dataUrl).toContain('data:image/png;base64');
        expect(dataUrl.length).toBeGreaterThan(100);
    });

    test('debe generar tickets para todos los números del 0 al 99', () => {
        const configuracion = {
            descripcion: 'Test',
            precio: 10,
        };
        
        for (let i = 0; i <= 99; i++) {
            const participante = {
                numero: i,
                nombre: `Participante ${i}`,
                telefono: `555${i}`,
                pago: 'pendiente',
                fechaRegistro: new Date().toISOString(),
            };
            
            const dataUrl = ticketGenerator.generarTicket(participante, configuracion);
            expect(dataUrl).toContain('data:image/png;base64');
        }
    });

    test('debe manejar nombres largos correctamente', () => {
        const participante = {
            numero: 50,
            nombre: 'Juan Carlos Pérez González',
            telefono: '1234567890',
            pago: 'pagado',
            fechaRegistro: new Date().toISOString(),
        };
        
        const configuracion = {
            descripcion: 'Rifa con nombre muy largo para probar',
            precio: 100,
        };
        
        const dataUrl = ticketGenerator.generarTicket(participante, configuracion);
        expect(dataUrl).toContain('data:image/png;base64');
    });
});
