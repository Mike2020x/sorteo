'use strict';

import { STORAGE_KEY, ESTADO_PAGO, MENSAJES_ERROR } from './constants.js';

export class StorageManager {
  constructor() {
    this.clave = STORAGE_KEY;
  }

  obtenerDatos() {
    try {
      const datos = localStorage.getItem(this.clave);
      if (!datos) {
        return this.obtenerDatosDefault();
      }
      return JSON.parse(datos);
    } catch (error) {
      console.error(MENSAJES_ERROR.ERROR_CARGAR, error);
      return this.obtenerDatosDefault();
    }
  }

  guardarDatos(datos) {
    try {
      localStorage.setItem(this.clave, JSON.stringify(datos));
      return true;
    } catch (error) {
      console.error(MENSAJES_ERROR.ERROR_GUARDAR, error);
      return false;
    }
  }

  obtenerDatosDefault() {
    return {
      configuracion: {
        descripcion: '',
        fecha: new Date().toISOString(),
        precio: 0,
      },
      participantes: [],
    };
  }

  obtenerConfiguracion() {
    const datos = this.obtenerDatos();
    return datos.configuracion;
  }

  guardarConfiguracion(configuracion) {
    const datos = this.obtenerDatos();
    datos.configuracion = {
      ...datos.configuracion,
      ...configuracion,
    };
    return this.guardarDatos(datos);
  }

  obtenerParticipantes() {
    const datos = this.obtenerDatos();
    return datos.participantes;
  }

  obtenerParticipantePorNumero(numero) {
    const participantes = this.obtenerParticipantes();
    return participantes.find(p => p.numero === numero);
  }

  numeroEstaDisponible(numero) {
    return !this.obtenerParticipantePorNumero(numero);
  }

  agregarParticipante(participante) {
    const datos = this.obtenerDatos();

    if (this.obtenerParticipantePorNumero(participante.numero)) {
      return { exito: false, error: MENSAJES_ERROR.NUMERO_OCUPADO };
    }

    datos.participantes.push({
      ...participante,
      pago: participante.pago || ESTADO_PAGO.PENDIENTE,
      fechaRegistro: new Date().toISOString(),
    });

    const exitoso = this.guardarDatos(datos);
    return { exito: exitoso, error: exitoso ? null : MENSAJES_ERROR.ERROR_GUARDAR };
  }

  actualizarParticipante(numero, actualizaciones) {
    const datos = this.obtenerDatos();
    const indice = datos.participantes.findIndex(p => p.numero === numero);

    if (indice === -1) {
      return { exito: false, error: MENSAJES_ERROR.PARTICIPANTE_NO_ENCONTRADO };
    }

    datos.participantes[indice] = {
      ...datos.participantes[indice],
      ...actualizaciones,
    };

    const exitoso = this.guardarDatos(datos);
    return { exito: exitoso, error: exitoso ? null : MENSAJES_ERROR.ERROR_GUARDAR };
  }

  eliminarParticipante(numero) {
    const datos = this.obtenerDatos();
    const indice = datos.participantes.findIndex(p => p.numero === numero);

    if (indice === -1) {
      return { exito: false, error: MENSAJES_ERROR.PARTICIPANTE_NO_ENCONTRADO };
    }

    datos.participantes.splice(indice, 1);
    const exitoso = this.guardarDatos(datos);
    return { exito: exitoso, error: exitoso ? null : MENSAJES_ERROR.ERROR_GUARDAR };
  }

  obtenerNumerosOcupados() {
    const participantes = this.obtenerParticipantes();
    return participantes.map(p => p.numero);
  }

  limpiarDatos() {
    try {
      localStorage.removeItem(this.clave);
      return true;
    } catch (error) {
      console.error('Error al limpiar datos', error);
      return false;
    }
  }

  exportarDatos() {
    try {
      const datos = this.obtenerDatos();
      const datosExport = {
        ...datos,
        version: '1.0',
        fechaExportacion: new Date().toISOString(),
      };
      const jsonStr = JSON.stringify(datosExport, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sorteo-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return { exito: true };
    } catch (error) {
      console.error('Error al exportar datos', error);
      return { exito: false, error: 'Error al exportar los datos' };
    }
  }

  importarDatos(archivo) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const datosImportados = JSON.parse(e.target.result);

          if (!datosImportados.configuracion || !datosImportados.participantes) {
            resolve({
              exito: false,
              error: 'Archivo JSON inválido. Falta configuración o participantes.',
            });
            return;
          }

          const datosValidados = {
            configuracion: {
              descripcion: datosImportados.configuracion.descripcion || '',
              fecha: datosImportados.configuracion.fecha || new Date().toISOString(),
              precio: datosImportados.configuracion.precio || 0,
            },
            participantes: datosImportados.participantes.map(p => ({
              numero: p.numero,
              nombre: p.nombre,
              telefono: p.telefono,
              pago: p.pago,
              fechaRegistro: p.fechaRegistro,
            })),
          };

          this.guardarDatos(datosValidados);
          resolve({ exito: true, datos: datosValidados });
        } catch (error) {
          console.error('Error al importar datos', error);
          resolve({
            exito: false,
            error: 'Error al leer el archivo. Asegúrate de que sea un JSON válido.',
          });
        }
      };
      reader.onerror = () => {
        resolve({ exito: false, error: 'Error al leer el archivo' });
      };
      reader.readAsText(archivo);
    });
  }
}

export const storageManager = new StorageManager();
