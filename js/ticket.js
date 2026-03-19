'use strict';

export class TicketGenerator {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  crearCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 600;
    this.canvas.height = 800;
    this.ctx = this.canvas.getContext('2d');
  }

  generarTicket(participante, configuracion) {
    this.crearCanvas();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const gradiente = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    gradiente.addColorStop(0, '#6366f1');
    gradiente.addColorStop(1, '#4f46e5');

    this.ctx.fillStyle = gradiente;
    this.ctx.fillRect(0, 0, this.canvas.width, 150);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 36px Inter, Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(configuracion.descripcion || 'Sorteo', this.canvas.width / 2, 95);

    this.ctx.fillStyle = '#0f172a';
    this.ctx.font = 'bold 180px Inter, Arial, sans-serif';
    this.ctx.fillText(
      `#${participante.numero.toString().padStart(2, '0')}`,
      this.canvas.width / 2,
      350
    );

    this.ctx.strokeStyle = '#e2e8f0';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(50, 400);
    this.ctx.lineTo(this.canvas.width - 50, 400);
    this.ctx.stroke();

    this.ctx.font = 'bold 24px Inter, Arial, sans-serif';
    this.ctx.fillStyle = '#64748b';
    this.ctx.textAlign = 'left';

    let y = 460;
    const padding = 80;
    const lineHeight = 50;

    this.ctx.fillText('Nombre', padding, y);
    this.ctx.font = 'bold 28px Inter, Arial, sans-serif';
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillText(participante.nombre, this.canvas.width - padding, y);
    this.ctx.textAlign = 'left';
    this.ctx.font = 'bold 24px Inter, Arial, sans-serif';
    this.ctx.fillStyle = '#64748b';

    y += lineHeight;
    this.ctx.fillText('Teléfono', padding, y);
    this.ctx.font = 'bold 28px Inter, Arial, sans-serif';
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillText(participante.telefono, this.canvas.width - padding, y);
    this.ctx.textAlign = 'left';
    this.ctx.font = 'bold 24px Inter, Arial, sans-serif';
    this.ctx.fillStyle = '#64748b';

    y += lineHeight;
    this.ctx.fillText('Precio', padding, y);
    this.ctx.font = 'bold 28px Inter, Arial, sans-serif';
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillText(`$${configuracion.precio || 0}`, this.canvas.width - padding, y);
    this.ctx.textAlign = 'left';
    this.ctx.font = 'bold 24px Inter, Arial, sans-serif';
    this.ctx.fillStyle = '#64748b';

    y += lineHeight;
    this.ctx.fillText('Estado', padding, y);
    this.ctx.font = 'bold 28px Inter, Arial, sans-serif';
    this.ctx.fillStyle = '#0f172a';
    const estadoTexto = participante.pago.charAt(0).toUpperCase() + participante.pago.slice(1);
    this.ctx.fillText(estadoTexto, this.canvas.width - padding, y);
    this.ctx.textAlign = 'left';
    this.ctx.font = 'bold 24px Inter, Arial, sans-serif';
    this.ctx.fillStyle = '#64748b';

    y += lineHeight;
    this.ctx.fillText('Fecha', padding, y);
    this.ctx.font = 'bold 28px Inter, Arial, sans-serif';
    this.ctx.fillStyle = '#0f172a';
    const fecha = new Date(participante.fechaRegistro).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    this.ctx.fillText(fecha, this.canvas.width - padding, y);

    const gradienteFooter = this.ctx.createLinearGradient(
      0,
      this.canvas.height - 100,
      0,
      this.canvas.height
    );
    gradienteFooter.addColorStop(0, '#f8fafc');
    gradienteFooter.addColorStop(1, '#e2e8f0');
    this.ctx.fillStyle = gradienteFooter;
    this.ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 100);

    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = '16px Inter, Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'Sorteo App - Gestión de Rifa',
      this.canvas.width / 2,
      this.canvas.height - 50
    );

    return this.canvas.toDataURL('image/png');
  }

  descargarTicket(participante, configuracion) {
    const dataUrl = this.generarTicket(participante, configuracion);

    const link = document.createElement('a');
    link.download = `ticket-${participante.numero.toString().padStart(2, '0')}-${participante.nombre.replace(/\s+/g, '-')}.png`;
    link.href = dataUrl;
    link.click();
  }

  async compartirTicket(participante, configuracion) {
    const dataUrl = this.generarTicket(participante, configuracion);

    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const numeroPadded = participante.numero.toString().padStart(2, '0');
        const file = new File([blob], `ticket-${numeroPadded}.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Ticket #${numeroPadded} - ${configuracion.descripcion || 'Sorteo'}`,
            text: `¡Aquí está tu ticket para ${configuracion.descripcion || 'el sorteo'}! Tu número es el #${numeroPadded}.`,
            files: [file],
          });
          return { exito: true };
        } else {
          return await this.compartirTexto(participante, configuracion);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          return await this.compartirTexto(participante, configuracion);
        }
        return { exito: false, error: 'Compartido cancelado' };
      }
    } else {
      return await this.compartirTexto(participante, configuracion);
    }
  }

  async compartirTexto(participante, configuracion) {
    const numeroPadded = participante.numero.toString().padStart(2, '0');
    const texto = `
🎫 *Ticket de ${configuracion.descripcion || 'Sorteo'}*

📌 *Número:* #${numeroPadded}
👤 *Nombre:* ${participante.nombre}
📞 *Teléfono:* ${participante.telefono}
💰 *Precio:* $${configuracion.precio || 0}
📊 *Estado:* ${participante.pago}

¡Buena suerte! 🍀
        `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket #${numeroPadded}`,
          text: texto,
        });
        return { exito: true };
      } catch (error) {
        if (error.name !== 'AbortError') {
          this.copiarAlPortapapeles(texto);
          return { exito: true, copiado: true };
        }
        return { exito: false, error: 'Compartido cancelado' };
      }
    } else {
      this.copiarAlPortapapeles(texto);
      return { exito: true, copiado: true };
    }
  }

  copiarAlPortapapeles(texto) {
    navigator.clipboard
      .writeText(texto)
      .then(() => {
        return true;
      })
      .catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = texto;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      });
  }

  guardarTicketComoImagen(participante, configuracion) {
    return this.generarTicket(participante, configuracion);
  }
}

export const ticketGenerator = new TicketGenerator();
