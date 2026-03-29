'use strict';

import { storageManager } from './storage.js';
import { uiManager } from './ui.js';
import { ticketGenerator } from './ticket.js';
import {
  MIN_NUMERO,
  MAX_NUMERO,
  ESTADO_PAGO,
  TOTAL_NUMEROS,
  MENSAJES_ERROR,
  MENSAJES_EXITO,
} from './constants.js';

class App {
  constructor() {
    this.inicializado = false;
  }

  iniciar() {
    if (this.inicializado) {
      console.warn('La aplicación ya está inicializada');
      return;
    }

    this.configurarEventos();
    this.cargarDatosIniciales();
    this.inicializado = true;
  }

  configurarEventos() {
    uiManager.inicializar();

    uiManager.elementos.formConfiguracion.addEventListener('submit', e => {
      e.preventDefault();
      this.guardarConfiguracion();
    });

    uiManager.elementos.formParticipante.addEventListener('submit', e => {
      e.preventDefault();
      this.registrarParticipante();
    });

    uiManager.elementos.cerrarModal.addEventListener('click', () => {
      uiManager.cerrarModalTicket();
    });

    uiManager.elementos.modalTicket.addEventListener('click', e => {
      if (e.target === uiManager.elementos.modalTicket) {
        uiManager.cerrarModalTicket();
      }
    });

    uiManager.elementos.btnDescargarTicket.addEventListener('click', () => {
      this.descargarTicketActual();
    });

    uiManager.elementos.btnCompartirTicket.addEventListener('click', () => {
      this.compartirTicketActual();
    });

    uiManager.elementos.btnExportar.addEventListener('click', () => {
      this.exportarDatos();
    });

    uiManager.elementos.btnImportar.addEventListener('click', () => {
      uiManager.elementos.inputImportar.click();
    });

    uiManager.elementos.inputImportar.addEventListener('change', e => {
      this.importarDatos(e);
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        uiManager.cerrarModalTicket();
      }
    });

    // Botón flotante para ir al final
    this.configurarBotonFlotante();
  }

  configurarBotonFlotante() {
    const btnIrAbajo = document.getElementById('btn-ir-abajo');
    if (!btnIrAbajo) return;

    // Mostrar/ocultar según el scroll
    window.addEventListener('scroll', () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const scrollActual = window.scrollY;

      // Mostrar cuando el usuario ha scrolleado al menos 300px y no está ya al final
      if (scrollActual > 300 && scrollActual < scrollTotal - 100) {
        btnIrAbajo.classList.add('visible');
      } else {
        btnIrAbajo.classList.remove('visible');
      }
    });

    // Ir al hacer click
    btnIrAbajo.addEventListener('click', () => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      });
    });
  }

  cargarDatosIniciales() {
    const configuracion = storageManager.obtenerConfiguracion();
    uiManager.cargarConfiguracion(configuracion);
    this.actualizarVista();
  }

  guardarConfiguracion() {
    const datos = uiManager.obtenerDatosFormularioConfiguracion();

    if (!datos.descripcion) {
      uiManager.mostrarMensaje('La descripción es requerida', 'error');
      return;
    }

    const exitoso = storageManager.guardarConfiguracion(datos);

    if (exitoso) {
      uiManager.mostrarMensaje(MENSAJES_EXITO.CONFIGURACION_GUARDADA, 'success');
      setTimeout(() => {
        const toggle = uiManager.elementos.configuracionToggle;
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
          uiManager.elementos.configuracionContenido.classList.remove('activo');
        }
      }, 1500);
    } else {
      uiManager.mostrarMensaje(MENSAJES_ERROR.ERROR_GUARDAR, 'error');
    }
  }

  /**
   * Parsea el input de números en un array de números únicos
   * Acepta solo números separados por coma: "5,12,25" o "5, 12, 25"
   */
  parsearNumeros(input) {
    const numeros = new Set();

    if (!input || typeof input !== 'string') {
      return [];
    }

    // Dividir solo por coma
    const partes = input.split(',');

    for (const parte of partes) {
      const trimmed = parte.trim();
      if (!trimmed) continue;

      // Es un número individual
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= MIN_NUMERO && num <= MAX_NUMERO) {
        numeros.add(num);
      }
    }

    return Array.from(numeros).sort((a, b) => a - b);
  }

  registrarParticipante() {
    const datos = uiManager.obtenerDatosFormularioParticipante();

    if (!datos.nombre || !datos.telefono) {
      uiManager.mostrarMensaje(MENSAJES_ERROR.DATOS_INVALIDOS, 'error');
      return;
    }

    // Parsear múltiples números del input
    const numeros = this.parsearNumeros(datos.numeroString);

    if (numeros.length === 0) {
      uiManager.mostrarMensaje('Ingresa al menos un número válido (0-99)', 'error');
      return;
    }

    // Obtener números ya ocupados
    const numerosOcupados = storageManager.obtenerNumerosOcupados();
    const numerosYaOcupados = numeros.filter(n => numerosOcupados.includes(n));

    // Si hay números ocupados, bloquear la operación
    if (numerosYaOcupados.length > 0) {
      uiManager.mostrarMensaje(
        `Los siguientes números ya están ocupados: ${numerosYaOcupados.join(', ')}`,
        'error'
      );
      return;
    }

    // Registrar los números
    let registrados = 0;

    for (const numero of numeros) {
      const participante = {
        nombre: datos.nombre,
        telefono: datos.telefono,
        numero: numero,
        pago: datos.pago,
      };

      const resultado = storageManager.agregarParticipante(participante);
      if (resultado.exito) {
        registrados++;
      }
    }

    if (registrados > 0) {
      uiManager.mostrarMensaje(`${registrados} número(s) registrado(s) correctamente`, 'success');
      uiManager.limpiarFormularioParticipante();
      this.actualizarVista();
    } else {
      uiManager.mostrarMensaje(MENSAJES_ERROR.ERROR_GUARDAR, 'error');
    }
  }

  eliminarParticipante(numero) {
    const resultado = storageManager.eliminarParticipante(numero);

    if (resultado.exito) {
      uiManager.mostrarMensaje(MENSAJES_EXITO.PARTICIPANTE_ELIMINADO, 'success');
      this.actualizarVista();
    } else {
      uiManager.mostrarMensaje(resultado.error || MENSAJES_ERROR.ERROR_GUARDAR, 'error');
    }
  }

  cambiarEstadoPago(numero) {
    const participante = storageManager.obtenerParticipantePorNumero(numero);

    if (!participante) {
      uiManager.mostrarMensaje(MENSAJES_ERROR.PARTICIPANTE_NO_ENCONTRADO, 'error');
      return;
    }

    const nuevoEstado =
      participante.pago === ESTADO_PAGO.PAGADO ? ESTADO_PAGO.PENDIENTE : ESTADO_PAGO.PAGADO;

    const resultado = storageManager.actualizarParticipante(numero, { pago: nuevoEstado });

    if (resultado.exito) {
      uiManager.mostrarMensaje(MENSAJES_EXITO.PAGO_ACTUALIZADO, 'success');
      this.actualizarVista();
    } else {
      uiManager.mostrarMensaje(resultado.error || MENSAJES_ERROR.ERROR_GUARDAR, 'error');
    }
  }

  seleccionarNumero(numero) {
    uiManager.elementos.numero.value = numero;
    uiManager.elementos.nombre.focus();

    uiManager.mostrarMensaje(`Número ${numero} seleccionado`, 'info');
  }

  verTicketParticipante(participante) {
    const configuracion = storageManager.obtenerConfiguracion();
    uiManager.mostrarTicket(participante, configuracion);
  }

  actualizarVista() {
    const participantes = storageManager.obtenerParticipantes();
    const numerosOcupados = storageManager.obtenerNumerosOcupados();

    uiManager.renderizarParticipantes(
      participantes,
      num => this.eliminarParticipante(num),
      num => this.cambiarEstadoPago(num),
      p => this.verTicketParticipante(p)
    );
    uiManager.renderizarGrillaNumeros(numerosOcupados, MIN_NUMERO, MAX_NUMERO, num =>
      this.seleccionarNumero(num)
    );
    uiManager.actualizarContadores(participantes, TOTAL_NUMEROS);
  }

  descargarTicketActual() {
    const participante = uiManager.obtenerParticipanteActual();

    if (!participante) {
      uiManager.mostrarMensaje('No hay ticket seleccionado', 'error');
      return;
    }

    const configuracion = storageManager.obtenerConfiguracion();
    ticketGenerator.descargarTicket(participante, configuracion);
    uiManager.mostrarMensaje('Ticket descargado correctamente', 'success');
  }

  async compartirTicketActual() {
    const participante = uiManager.obtenerParticipanteActual();

    if (!participante) {
      uiManager.mostrarMensaje('No hay ticket seleccionado', 'error');
      return;
    }

    const configuracion = storageManager.obtenerConfiguracion();
    const resultado = await ticketGenerator.compartirTicket(participante, configuracion);

    if (resultado.exito) {
      if (resultado.copiado) {
        uiManager.mostrarMensaje('Información copiada al portapapeles', 'success');
      } else {
        uiManager.mostrarMensaje('Compartido exitosamente', 'success');
      }
    } else if (resultado.error !== 'Compartido cancelado') {
      uiManager.mostrarMensaje(resultado.error || 'Error al compartir', 'error');
    }
  }

  exportarDatos() {
    const resultado = storageManager.exportarDatos();

    if (resultado.exito) {
      uiManager.mostrarMensaje('Datos exportados correctamente', 'success');
    } else {
      uiManager.mostrarMensaje(resultado.error || 'Error al exportar', 'error');
    }
  }

  async importarDatos(event) {
    const archivo = event.target.files[0];

    if (!archivo) {
      return;
    }

    if (!archivo.name.endsWith('.json')) {
      uiManager.mostrarMensaje('Por favor selecciona un archivo JSON', 'error');
      event.target.value = '';
      return;
    }

    const resultado = await storageManager.importarDatos(archivo);

    if (resultado.exito) {
      uiManager.mostrarMensaje('Datos importados correctamente', 'success');
      this.actualizarVista();
      uiManager.cargarConfiguracion(resultado.datos.configuracion);
    } else {
      uiManager.mostrarMensaje(resultado.error || 'Error al importar', 'error');
    }

    event.target.value = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.iniciar();
});
