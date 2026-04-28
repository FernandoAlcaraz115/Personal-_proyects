const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendConfirmacion({ nombre, email, tour, personas, total, folio }) {
  await transporter.sendMail({
    from: `"Fernando Travels ✈️" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Confirmación de reserva ${folio} · Fernando Travels`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;
                  border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1d4ed8,#075985);
                    padding:28px 32px;text-align:center;color:#fff;">
          <p style="font-size:2rem;margin:0;">✈️</p>
          <h1 style="margin:8px 0 4px;font-size:1.3rem;font-weight:700;">Fernando Travels</h1>
          <p style="margin:0;opacity:.8;font-size:.9rem;">Confirmación de reserva</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="color:#1e293b;font-size:15px;">
            Hola <strong>${nombre}</strong>, tu reserva ha sido confirmada. 🎉
          </p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
            <tr style="background:#f8fafc;">
              <td style="padding:10px 14px;font-weight:600;color:#64748b;width:40%;">Tour</td>
              <td style="padding:10px 14px;color:#1e293b;">${tour}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-weight:600;color:#64748b;">Personas</td>
              <td style="padding:10px 14px;color:#1e293b;">${personas}</td>
            </tr>
            <tr style="background:#f8fafc;">
              <td style="padding:10px 14px;font-weight:600;color:#64748b;">Total</td>
              <td style="padding:10px 14px;color:#1e293b;font-weight:700;">
                $${total.toLocaleString('es-MX')} MXN
              </td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-weight:600;color:#64748b;">Folio</td>
              <td style="padding:10px 14px;font-family:monospace;color:#2563eb;">${folio}</td>
            </tr>
          </table>

          <p style="color:#64748b;font-size:13px;line-height:1.6;">
            Nos pondremos en contacto contigo para los detalles del viaje.<br>
            Guarda tu folio <strong>${folio}</strong> como referencia.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;padding:16px 32px;text-align:center;
                    border-top:1px solid #e2e8f0;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">
            © 2026 Fernando Travels · Este correo es una confirmación automática.
          </p>
        </div>
      </div>
    `,
  });
}

module.exports = { sendConfirmacion };
