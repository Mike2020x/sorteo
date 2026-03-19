'use strict';

export const STORAGE_KEY = 'sorteo';

export const MIN_NUMERO = 0;
export const MAX_NUMERO = 99;
export const TOTAL_NUMEROS = MAX_NUMERO - MIN_NUMERO + 1;

export const ESTADO_PAGO = {
    PAGADO: 'pagado',
    PENDIENTE: 'pendiente',
};

export const MENSAJES_ERROR = {
    ERROR_GUARDAR: 'Error al guardar los datos',
    ERROR_CARGAR: 'Error al cargar los datos',
    NUMERO_OCUPADO: 'Este número ya está ocupado',
    NUMERO_INVALIDO: 'Número inválido. Debe estar entre 0 y 99',
    DATOS_INVALIDOS: 'Datos inválidos',
    PARTICIPANTE_NO_ENCONTRADO: 'Participante no encontrado',
};

export const MENSAJES_EXITO = {
    CONFIGURACION_GUARDADA: 'Configuración guardada correctamente',
    PARTICIPANTE_REGISTRADO: 'Participante registrado correctamente',
    PARTICIPANTE_ACTUALIZADO: 'Participante actualizado correctamente',
    PARTICIPANTE_ELIMINADO: 'Participante eliminado correctamente',
    PAGO_ACTUALIZADO: 'Estado de pago actualizado correctamente',
};
