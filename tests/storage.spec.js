import { test, expect } from '@playwright/test';
import { storageManager } from '../js/storage.js';
import { ESTADO_PAGO } from '../js/constants.js';

test.describe('Storage Manager', () => {
    test.beforeEach(() => {
        storageManager.limpiarDatos();
    });

    test('debe obtener datos default al iniciar', () => {
        const datos = storageManager.obtenerDatos();
        
        expect(datos.configuracion).toBeDefined();
        expect(datos.configuracion.descripcion).toBe('');
        expect(datos.configuracion.precio).toBe(0);
        expect(datos.participantes).toEqual([]);
    });

    test('debe guardar y obtener configuración', () => {
        const configuracion = {
            descripcion: 'Rifa de Prueba',
            precio: 100,
            fecha: new Date().toISOString(),
        };
        
        const resultado = storageManager.guardarConfiguracion(configuracion);
        expect(resultado).toBe(true);
        
        const configObtenida = storageManager.obtenerConfiguracion();
        expect(configObtenida.descripcion).toBe('Rifa de Prueba');
        expect(configObtenida.precio).toBe(100);
    });

    test('debe agregar un participante correctamente', () => {
        const participante = {
            numero: 50,
            nombre: 'Carlos López',
            telefono: '5551234567',
            pago: ESTADO_PAGO.PENDIENTE,
        };
        
        const resultado = storageManager.agregarParticipante(participante);
        expect(resultado.exito).toBe(true);
        
        const participantes = storageManager.obtenerParticipantes();
        expect(participantes.length).toBe(1);
        expect(participantes[0].numero).toBe(50);
    });

    test('debe rechazar número duplicado', () => {
        const participante1 = {
            numero: 50,
            nombre: 'Carlos López',
            telefono: '5551234567',
        };
        
        storageManager.agregarParticipante(participante1);
        
        const participante2 = {
            numero: 50,
            nombre: 'Ana Martínez',
            telefono: '5559876543',
        };
        
        const resultado = storageManager.agregarParticipante(participante2);
        expect(resultado.exito).toBe(false);
        expect(resultado.error).toBe('Este número ya está ocupado');
    });

    test('debe verificar si número está disponible', () => {
        expect(storageManager.numeroEstaDisponible(25)).toBe(true);
        
        storageManager.agregarParticipante({
            numero: 25,
            nombre: 'Test',
            telefono: '123',
        });
        
        expect(storageManager.numeroEstaDisponible(25)).toBe(false);
    });

    test('debe actualizar un participante', () => {
        storageManager.agregarParticipante({
            numero: 10,
            nombre: 'Original',
            telefono: '111',
            pago: ESTADO_PAGO.PENDIENTE,
        });
        
        const resultado = storageManager.actualizarParticipante(10, {
            nombre: 'Actualizado',
            pago: ESTADO_PAGO.PAGADO,
        });
        
        expect(resultado.exito).toBe(true);
        
        const participante = storageManager.obtenerParticipantePorNumero(10);
        expect(participante.nombre).toBe('Actualizado');
        expect(participante.pago).toBe('pagado');
    });

    test('debe eliminar un participante', () => {
        storageManager.agregarParticipante({
            numero: 33,
            nombre: 'ParaEliminar',
            telefono: '333',
        });
        
        expect(storageManager.obtenerParticipantes().length).toBe(1);
        
        const resultado = storageManager.eliminarParticipante(33);
        expect(resultado.exito).toBe(true);
        expect(storageManager.obtenerParticipantes().length).toBe(0);
    });

    test('debe obtener números ocupados', () => {
        storageManager.agregarParticipante({ numero: 5, nombre: 'A', telefono: '1' });
        storageManager.agregarParticipante({ numero: 15, nombre: 'B', telefono: '2' });
        storageManager.agregarParticipante({ numero: 25, nombre: 'C', telefono: '3' });
        
        const numeros = storageManager.obtenerNumerosOcupados();
        expect(numeros).toEqual([5, 15, 25]);
    });

    test('debe limpiar todos los datos', () => {
        storageManager.guardarConfiguracion({ descripcion: 'Test', precio: 10 });
        storageManager.agregarParticipante({ numero: 1, nombre: 'Test', telefono: '1' });
        
        const resultado = storageManager.limpiarDatos();
        expect(resultado).toBe(true);
        
        const datos = storageManager.obtenerDatos();
        expect(datos.participantes.length).toBe(0);
        expect(datos.configuracion.descripcion).toBe('');
    });

    test('debe mantener datos tras recargar página', () => {
        storageManager.guardarConfiguracion({ descripcion: 'Persistente', precio: 99 });
        storageManager.agregarParticipante({ numero: 99, nombre: 'Test', telefono: '123' });
        
        const datos = storageManager.obtenerDatos();
        expect(datos.configuracion.descripcion).toBe('Persistente');
        expect(datos.participantes[0].numero).toBe(99);
    });
});
