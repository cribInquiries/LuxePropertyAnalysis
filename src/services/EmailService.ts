import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  public async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: 'Welcome to Luxe Property Analysis',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Welcome to Luxe Property Analysis, ${firstName}!</h2>
            <p>Thank you for joining our platform. We're excited to help you with your property analysis needs.</p>
            <p>You can now:</p>
            <ul>
              <li>Browse luxury properties</li>
              <li>Create detailed property analyses</li>
              <li>Save your favorite properties</li>
              <li>Connect with real estate professionals</li>
            </ul>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>The Luxe Property Analysis Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  public async sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Password Reset Request</h2>
            <p>Hello ${firstName},</p>
            <p>You requested a password reset for your Luxe Property Analysis account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this reset, please ignore this email.</p>
            <p>Best regards,<br>The Luxe Property Analysis Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  public async sendPropertyInquiryNotification(
    propertyOwnerEmail: string,
    propertyTitle: string,
    inquirerName: string,
    message: string,
    inquirerEmail: string,
    inquirerPhone?: string
  ): Promise<void> {
    try {
      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: propertyOwnerEmail,
        subject: `New Inquiry for ${propertyTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">New Property Inquiry</h2>
            <p>You have received a new inquiry for your property: <strong>${propertyTitle}</strong></p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Inquirer Details:</h3>
              <p><strong>Name:</strong> ${inquirerName}</p>
              <p><strong>Email:</strong> ${inquirerEmail}</p>
              ${inquirerPhone ? `<p><strong>Phone:</strong> ${inquirerPhone}</p>` : ''}
              <h3>Message:</h3>
              <p>${message}</p>
            </div>
            <p>Please respond to the inquirer as soon as possible.</p>
            <p>Best regards,<br>The Luxe Property Analysis Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Property inquiry notification sent to: ${propertyOwnerEmail}`);
    } catch (error) {
      logger.error('Failed to send property inquiry notification:', error);
      throw error;
    }
  }

  public async sendAnalysisSharedNotification(
    email: string,
    analystName: string,
    analysisTitle: string,
    propertyTitle: string
  ): Promise<void> {
    try {
      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: `New Analysis Shared: ${analysisTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">New Analysis Available</h2>
            <p>${analystName} has shared a new analysis with you.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Analysis Details:</h3>
              <p><strong>Title:</strong> ${analysisTitle}</p>
              <p><strong>Property:</strong> ${propertyTitle}</p>
              <p><strong>Analyst:</strong> ${analystName}</p>
            </div>
            <p>You can view the full analysis on our platform.</p>
            <p>Best regards,<br>The Luxe Property Analysis Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Analysis shared notification sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send analysis shared notification:', error);
      throw error;
    }
  }

  public async sendGenericEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<void> {
    try {
      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to,
        subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Generic email sent to: ${to}`);
    } catch (error) {
      logger.error('Failed to send generic email:', error);
      throw error;
    }
  }
}
