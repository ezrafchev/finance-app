import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendVerificationEmailParams {
  to: string;
  name: string;
  verificationUrl: string;
}

export async function sendVerificationEmail({ to, name, verificationUrl }: SendVerificationEmailParams) {
  try {
    // In development, just log the email
    if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_test_key') {
      console.log('='.repeat(80));
      console.log('📧 EMAIL VERIFICATION (Development Mode)');
      console.log('='.repeat(80));
      console.log(`To: ${to}`);
      console.log(`Name: ${name}`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log('='.repeat(80));
      return { success: true, messageId: 'dev-mode' };
    }

    const { data, error } = await resend.emails.send({
      from: 'Finance App <onboarding@resend.dev>',
      to: [to],
      subject: 'Confirme seu e-mail - Finance App',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirme seu e-mail</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Finance App</h1>
            </div>
            <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Olá, ${name}!</h2>
              <p style="color: #4b5563; font-size: 16px;">
                Obrigado por se cadastrar no Finance App. Para completar seu cadastro e começar a usar todas as funcionalidades, 
                precisamos que você confirme seu endereço de e-mail.
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 40px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: 600; 
                          font-size: 16px;
                          display: inline-block;">
                  Confirmar E-mail
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Se você não criou uma conta no Finance App, pode ignorar este e-mail com segurança.
              </p>
              <p style="color: #6b7280; font-size: 14px;">
                Este link de verificação expira em 24 horas.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Finance App. Todos os direitos reservados.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
}
