const axios = require('axios');

class EmailService {
  constructor() {
    this.serviceId = process.env.EMAILJS_SERVICE_ID;
    this.publicKey = process.env.EMAILJS_PUBLIC_KEY;
    this.privateKey = process.env.EMAILJS_PRIVATE_KEY;
    
    console.log('Servicio de email configurado con EmailJS');
  }

  async enviarEmail(templateId, templateParams) {
    try {
      const data = {
        service_id: this.serviceId,
        template_id: templateId,
        user_id: this.publicKey,
        accessToken: this.privateKey,
        template_params: templateParams
      };

      // Simular que viene de un navegador
      const response = await axios.post(
        'https://api.emailjs.com/api/v1.0/email/send',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Origin': 'http://localhost:5555',
            'Referer': 'http://localhost:5555/'
          }
        }
      );

      console.log('Email enviado exitosamente');
      return { 
        success: true, 
        status: response.status,
        text: response.data
      };
    } catch (error) {
      throw error;
    }
  }

  async enviarRecuperacionContrasena(email, token, nombreUsuario) {
    const urlRecuperacion = `${process.env.FRONTEND_URL}/recuperar-contrasena/${token}`;
    
    const templateParams = {
      to_email: email,
      to_name: nombreUsuario,
      url_recuperacion: urlRecuperacion,
      token: token,
      app_name: 'Gestor de Tareas',
      year: new Date().getFullYear()
    };

    return await this.enviarEmail(
      process.env.EMAILJS_TEMPLATE_RECUPERACION,
      templateParams
    );
  }

  async enviarConfirmacionCambioContrasena(email, nombreUsuario) {
    const templateParams = {
      to_email: email,
      to_name: nombreUsuario,
      fecha_cambio: new Date().toLocaleString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      app_name: 'Gestor de Tareas',
      year: new Date().getFullYear()
    };

    return await this.enviarEmail(
      process.env.EMAILJS_TEMPLATE_CONFIRMACION,
      templateParams
    );
  }
}

module.exports = new EmailService();