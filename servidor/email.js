const Brevo = require('@getbrevo/brevo');
let emailAPI = new Brevo.TransactionalEmailsApi();
emailAPI.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;
const urlConfirmar = process.env.urlConfirmar;

module.exports.enviarEmail = async function (direccion, key, mensaje) {
    let message = new Brevo.SendSmtpEmail();
    message.subject = mensaje;
    message.textContent = "Hello world!";
    message.htmlContent= '<p>Bienvenido a Sistema</p><p><a href="'+urlConfirmar+'confirmarUsuario/'+direccion+'/'+key+'">Pulsa aquí para confirmar cuenta</a></p>'
    message.sender = { name: "JFBL", email: "jesusfbarrajon@gmail.com" };
    message.to = [{ email: direccion, name: direccion }];
    emailAPI.sendTransacEmail(message).then(res => {
        console.log(JSON.stringify(res.body));
    }).catch(err => {
        console.error("Error sending email:", err);
    });
}