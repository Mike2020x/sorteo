'use strict';

export class UIManager {
  constructor() {
    this.elementos = {};
    this.participanteActual = null;
  }

  inicializar() {
    this.elementos = {
      formConfiguracion: document.getElementById('form-configuracion'),
      descripcion: document.getElementById('descripcion'),
      precio: document.getElementById('precio'),
      formParticipante: document.getElementById('form-participante'),
      nombre: document.getElementById('nombre'),
      telefono: document.getElementById('telefono'),
      numero: document.getElementById('numero'),
      pago: document.querySelectorAll('input[name="pago"]'),
      listaParticipantes: document.getElementById('lista-participantes'),
      grillaNumeros: document.getElementById('grilla-numeros'),
      modalTicket: document.getElementById('modal-ticket'),
      cerrarModal: document.getElementById('cerrar-modal'),
      ticketContainer: document.getElementById('ticket-container'),
      btnDescargarTicket: document.getElementById('btn-descargar-ticket'),
      btnCompartirTicket: document.getElementById('btn-compartir-ticket'),
      btnExportar: document.getElementById('btn-exportar'),
      btnImportar: document.getElementById('btn-importar'),
      inputImportar: document.getElementById('input-importar'),
      configuracionToggle: document.querySelector('#configuracion .seccion__toggle'),
      configuracionContenido: document.getElementById('configuracion-contenido'),
      contadorParticipantes: document.getElementById('contador-participantes'),
      numerosOcupados: document.getElementById('numeros-ocupados'),
      numerosLibres: document.getElementById('numeros-libres'),
      ticketNombreParticipante: document.getElementById('ticket-nombre-participante'),
      toastContainer: document.getElementById('toast-container'),
    };

    this.configurarCollapsible();
  }

  configurarCollapsible() {
    const toggle = this.elementos.configuracionToggle;
    const contenido = this.elementos.configuracionContenido;

    if (toggle && contenido) {
      toggle.addEventListener('click', () => {
        const estaExpandido = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !estaExpandido);
        contenido.classList.toggle('activo', !estaExpandido);
      });
    }
  }

  obtenerValorRadio(nombre) {
    const seleccionado = document.querySelector(`input[name="${nombre}"]:checked`);
    return seleccionado ? seleccionado.value : null;
  }

  mostrarMensaje(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${tipo}`;

    const iconos = {
      success:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };

    toast.innerHTML = `${iconos[tipo] || iconos.info}<span>${mensaje}</span>`;
    this.elementos.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  actualizarContadores(participantes, totalNumeros) {
    const total = participantes.length;
    const libres = totalNumeros - total;

    if (this.elementos.contadorParticipantes) {
      this.elementos.contadorParticipantes.textContent = total;
    }
    if (this.elementos.numerosOcupados) {
      this.elementos.numerosOcupados.textContent = `${total} vendidos`;
    }
    if (this.elementos.numerosLibres) {
      this.elementos.numerosLibres.textContent = `${libres} disponibles`;
    }
  }

  renderizarParticipantes(participantes, alEliminar, alEditar, alVerTicket) {
    const contenedor = this.elementos.listaParticipantes;
    contenedor.innerHTML = '';

    if (participantes.length === 0) {
      contenedor.innerHTML =
        '<p class="texto-vacio">No hay participantes registrados aún. ¡Comienza registrando tu primer participante!</p>';
      return;
    }

    participantes.forEach(participante => {
      const elemento = this.crearElementoParticipante(
        participante,
        alEliminar,
        alEditar,
        alVerTicket
      );
      contenedor.appendChild(elemento);
    });
  }

  crearElementoParticipante(participante, alEliminar, alEditar, alVerTicket) {
    const div = document.createElement('div');
    div.className = `participante`;
    div.dataset.numero = participante.numero;

    div.innerHTML = `
            <div class="participante__numero">#${participante.numero}</div>
            <div class="participante__info">
                <span class="participante__nombre">${participante.nombre}</span>
                <span class="participante__telefono">${participante.telefono}</span>
                <span class="participante__estado participante__estado--${participante.pago}">
                    ${participante.pago}
                </span>
            </div>
            <div class="participante__acciones">
                <button class="btn btn--primario btn-ver-ticket" title="Ver ticket">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>
                <button class="btn ${participante.pago === 'pendiente' ? 'btn--secundario' : 'btn--danger'} btn-cambiar-estado" title="${participante.pago === 'pendiente' ? 'Marcar como pagado' : 'Marcar como pendiente'}">
                    ${participante.pago === 'pendiente' ? 'Pagado' : 'Pendiente'}
                </button>
                <button class="btn btn--danger btn-eliminar" title="Eliminar participante">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        `;

    div.querySelector('.btn-ver-ticket').addEventListener('click', () => {
      alVerTicket(participante);
    });

    div.querySelector('.btn-cambiar-estado').addEventListener('click', () => {
      alEditar(participante.numero);
    });

    div.querySelector('.btn-eliminar').addEventListener('click', () => {
      if (confirm(`¿Estás seguro de eliminar a ${participante.nombre}?`)) {
        alEliminar(participante.numero);
      }
    });

    return div;
  }

  renderizarGrillaNumeros(numerosOcupados, min, max, alClick) {
    const contenedor = this.elementos.grillaNumeros;
    contenedor.innerHTML = '';

    for (let i = min; i <= max; i++) {
      const numeroDiv = document.createElement('div');
      numeroDiv.className = `numero ${numerosOcupados.includes(i) ? 'numero--ocupado' : ''}`;
      numeroDiv.textContent = i;
      numeroDiv.dataset.numero = i;

      if (!numerosOcupados.includes(i)) {
        numeroDiv.addEventListener('click', () => alClick(i));
      }

      contenedor.appendChild(numeroDiv);
    }
  }

  mostrarTicket(participante, configuracion) {
    this.participanteActual = participante;

    if (this.elementos.ticketNombreParticipante) {
      this.elementos.ticketNombreParticipante.textContent = participante.nombre;
    }

    const ticket = this.elementos.ticketContainer;
    ticket.innerHTML = `
            <div class="ticket__titulo">${configuracion.descripcion || 'Sorteo'}</div>
            <div class="ticket__numero">#${participante.numero}</div>
            <div class="ticket__info">
                <div class="ticket__info-item">
                    <span>Nombre</span>
                    <strong>${participante.nombre}</strong>
                </div>
                <div class="ticket__info-item">
                    <span>Teléfono</span>
                    <strong>${participante.telefono}</strong>
                </div>
                <div class="ticket__info-item">
                    <span>Precio</span>
                    <strong>$${configuracion.precio || 0}</strong>
                </div>
                <div class="ticket__info-item">
                    <span>Estado</span>
                    <strong style="text-transform: capitalize">${participante.pago}</strong>
                </div>
                <div class="ticket__info-item">
                    <span>Fecha</span>
                    <strong>${new Date(participante.fechaRegistro).toLocaleDateString('es-ES')}</strong>
                </div>
            </div>
        `;

    this.elementos.modalTicket.classList.add('modal--activo');
  }

  cerrarModalTicket() {
    this.elementos.modalTicket.classList.remove('modal--activo');
    this.participanteActual = null;
  }

  cargarConfiguracion(configuracion) {
    if (this.elementos.descripcion) {
      this.elementos.descripcion.value = configuracion.descripcion || '';
    }
    if (this.elementos.precio) {
      this.elementos.precio.value = configuracion.precio || '';
    }
  }

  limpiarFormularioParticipante() {
    if (this.elementos.nombre) this.elementos.nombre.value = '';
    if (this.elementos.telefono) this.elementos.telefono.value = '';
    if (this.elementos.numero) this.elementos.numero.value = '';

    const radioPendiente = document.querySelector('input[name="pago"][value="pendiente"]');
    if (radioPendiente) radioPendiente.checked = true;
  }

  obtenerDatosFormularioParticipante() {
    return {
      nombre: this.elementos.nombre.value.trim(),
      telefono: this.elementos.telefono.value.trim(),
      numero: parseInt(this.elementos.numero.value, 10),
      pago: this.obtenerValorRadio('pago'),
    };
  }

  obtenerDatosFormularioConfiguracion() {
    return {
      descripcion: this.elementos.descripcion.value.trim(),
      precio: parseFloat(this.elementos.precio.value) || 0,
      fecha: new Date().toISOString(),
    };
  }

  obtenerParticipanteActual() {
    return this.participanteActual;
  }
}

export const uiManager = new UIManager();
