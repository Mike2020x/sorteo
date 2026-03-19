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
      ticketCanvas: document.getElementById('ticket-canvas'),
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
            <div class="participante__numero">#${participante.numero.toString().padStart(2, '0')}</div>
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
      numeroDiv.textContent = i.toString().padStart(2, '0');
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
      this.elementos.ticketNombreParticipante.textContent = `Ticket #${participante.numero.toString().padStart(2, '0')} - ${participante.nombre}`;
    }

    const canvas = this.elementos.ticketCanvas;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradiente = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradiente.addColorStop(0, '#6366f1');
    gradiente.addColorStop(1, '#4f46e5');

    ctx.fillStyle = gradiente;
    ctx.fillRect(0, 0, canvas.width, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(configuracion.descripcion || 'Sorteo', canvas.width / 2, 75);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 160px Inter, Arial, sans-serif';
    ctx.fillText(`#${participante.numero.toString().padStart(2, '0')}`, canvas.width / 2, 280);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 320);
    ctx.lineTo(canvas.width - 50, 320);
    ctx.stroke();

    ctx.font = 'bold 22px Inter, Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';

    let y = 370;
    const leftX = 60;
    const rightX = canvas.width - 60;
    const lineHeight = 55;

    ctx.fillText('Nombre:', leftX, y);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px Inter, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(participante.nombre, rightX, y);

    y += lineHeight;
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 22px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Teléfono:', leftX, y);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px Inter, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(participante.telefono, rightX, y);

    y += lineHeight;
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 22px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Precio:', leftX, y);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px Inter, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`$${configuracion.precio || 0}`, rightX, y);

    y += lineHeight;
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 22px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Estado:', leftX, y);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px Inter, Arial, sans-serif';
    ctx.textAlign = 'right';
    const estadoTexto = participante.pago.charAt(0).toUpperCase() + participante.pago.slice(1);
    ctx.fillText(estadoTexto, rightX, y);

    y += lineHeight;
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 22px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Fecha:', leftX, y);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px Inter, Arial, sans-serif';
    ctx.textAlign = 'right';
    const fecha = new Date(participante.fechaRegistro).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    ctx.fillText(fecha, rightX, y);

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Generado por Sorteo App', canvas.width / 2, canvas.height - 30);

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
