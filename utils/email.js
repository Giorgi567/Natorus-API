const pug = require('pug');
const nodemailer = require('nodemailer');
const { fromString } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Giorgi Gvintidze <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTestAccount({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      from: this.from,
      url: this.url,
      subject: this.subject
    });

    // 2)define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: fromString(html)
    };

    // 3)create
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(`Welcome`, `Welcome to natorus API`);
  }

  async resetPassword() {
    await this.send(
      'passwordReset',
      'Your Password reset token (valid for only 10 minutes)'
    );
  }
};
