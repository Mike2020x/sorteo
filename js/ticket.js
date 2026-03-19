'use strict';

export class TicketGenerator {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  crearCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 600;
    this.canvas.height = 850;
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
    this.ctx.fillRect(0, 0, this.canvas.width, 120);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 28px Inter, Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(configuracion.descripcion || 'Sorteo', this.canvas.width / 2, 75);

    this.ctx.fillStyle = '#0f172a';
    this.ctx.font = 'bold 160px Inter, Arial, sans-serif';
    this.ctx.fillText(
      `#${participante.numero.toString().padStart(2, '0')}`,
      this.canvas.width / 2,
      280
    );

    this.ctx.strokeStyle = '#e2e8f0';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(50, 320);
    this.ctx.lineTo(this.canvas.width - 50, 320);
    this.ctx.stroke();

    this.ctx.font = 'bold 22px Inter, Arial, sans-serif';
    this.ctx.fillStyle = '#64748b';
    this.ctx.textAlign = 'left';

    let y = 370;
    const leftX = 60;
    const rightX = this.canvas.width - 60;
    const lineHeight = 55;

    this.ctx.fillText('Nombre:', leftX, y);
    this.ctx.fillStyle = '#0f172a';
    this.ctx.font = 'bold 24px Inter, Arial, sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(participante.nombre, rightX, y);

    y += lineHeight;
    this.ctx.fillStyle = '#64748b';
    this.ctx.font = 'bold 22px Inter, Arial, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Teléfono:', leftX, y);
    this.ctx.fillStyle = '#0f172a';
    this.ctx.font = 'bold 24px Inter, Arial, sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(participante.telefono, rightX, y);

    y += lineHeight;
    this.ctx.fillStyle = '#64748b';
    this.ctx.font = 'bold 22px Inter, Arial, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Precio:', leftX, y);
    this.ctx.fillStyle = '#0f172a';
    this.ctx.font = 'bold 24px Inter, Arial, sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`$${configuracion.precio || 0}`, rightX, y);

    y += lineHeight;
    this.ctx.fillStyle = '#64748b';
    this.ctx.font = 'bold 22px Inter, Arial, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Estado:', leftX, y);
    this.ctx.fillStyle = '#0f172a';
    this.ctx.font = 'bold 24px Inter, Arial, sans-serif';
    this.ctx.textAlign = 'right';
    const estadoTexto = participante.pago.charAt(0).toUpperCase() + participante.pago.slice(1);
    this.ctx.fillText(estadoTexto, rightX, y);

    y += lineHeight;
    this.ctx.fillStyle = '#64748b';
    this.ctx.font = 'bold 22px Inter, Arial, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Fecha:', leftX, y);
    this.ctx.fillStyle = '#0f172a';
    this.ctx.font = 'bold 24px Inter, Arial, sans-serif';
    this.ctx.textAlign = 'right';
    const fecha = new Date(participante.fechaRegistro).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    this.ctx.fillText(fecha, rightX, y);

    this.ctx.fillStyle = '#f1f5f9';
    this.ctx.fillRect(0, this.canvas.height - 80, this.canvas.width, 80);

    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = '16px Inter, Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Generado por Sorteo App', this.canvas.width / 2, this.canvas.height - 30);

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
