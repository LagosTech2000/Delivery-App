import sgMail from '@sendgrid/mail';
import { env } from './environment';
import logger from '../utils/logger';

sgMail.setApiKey(env.SENDGRID_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  private static fromEmail = env.SENDGRID_FROM_EMAIL;
  private static fromName = env.SENDGRID_FROM_NAME;

  static async send(options: EmailOptions): Promise<boolean> {
    try {
      await sgMail.send({
        to: options.to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
      });

      logger.info(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error: any) {
      logger.error(`Failed to send email to ${options.to}:`, error.response?.body || error.message);
      return false;
    }
  }

  static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Welcome to Delivery App!',
      text: `Hi ${name},\n\nWelcome to Delivery App! We're excited to have you on board.\n\nBest regards,\nDelivery App Team`,
      html: `
        <h1>Welcome to Delivery App!</h1>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We're excited to have you on board!</p>
        <p>Best regards,<br/>Delivery App Team</p>
      `,
    });
  }

  static async sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email/${token}`;

    return this.send({
      to: email,
      subject: 'Verify Your Email Address',
      text: `Hi ${name},\n\nPlease verify your email address by clicking the link below:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nDelivery App Team`,
      html: `
        <h1>Verify Your Email Address</h1>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Please verify your email address by clicking the button below:</p>
        <p style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p><small>This link will expire in 24 hours.</small></p>
        <p>Best regards,<br/>Delivery App Team</p>
      `,
    });
  }

  static async sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password/${token}`;

    return this.send({
      to: email,
      subject: 'Reset Your Password',
      text: `Hi ${name},\n\nYou requested to reset your password. Click the link below to reset it:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nDelivery App Team`,
      html: `
        <h1>Reset Your Password</h1>
        <p>Hi <strong>${name}</strong>,</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p><small>This link will expire in 1 hour.</small></p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br/>Delivery App Team</p>
      `,
    });
  }

  static async sendRequestCreatedEmail(
    email: string,
    customerName: string,
    requestId: string,
    productName: string
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Request Created Successfully',
      text: `Hi ${customerName},\n\nYour delivery request for "${productName}" has been created successfully.\n\nRequest ID: ${requestId}\n\nWe'll notify you when an agent claims your request.\n\nBest regards,\nDelivery App Team`,
      html: `
        <h1>Request Created Successfully</h1>
        <p>Hi <strong>${customerName}</strong>,</p>
        <p>Your delivery request for <strong>"${productName}"</strong> has been created successfully.</p>
        <p><strong>Request ID:</strong> ${requestId}</p>
        <p>We'll notify you when an agent claims your request.</p>
        <p>Best regards,<br/>Delivery App Team</p>
      `,
    });
  }

  static async sendRequestClaimedEmail(
    email: string,
    customerName: string,
    agentName: string,
    productName: string
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Your Request Has Been Claimed',
      text: `Hi ${customerName},\n\n${agentName} has claimed your delivery request for "${productName}".\n\nThey will provide you with a resolution soon.\n\nBest regards,\nDelivery App Team`,
      html: `
        <h1>Your Request Has Been Claimed</h1>
        <p>Hi <strong>${customerName}</strong>,</p>
        <p><strong>${agentName}</strong> has claimed your delivery request for <strong>"${productName}"</strong>.</p>
        <p>They will provide you with a resolution soon.</p>
        <p>Best regards,<br/>Delivery App Team</p>
      `,
    });
  }

  static async sendResolutionProvidedEmail(
    email: string,
    customerName: string,
    productName: string,
    total: number,
    estimatedDays: number
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Resolution Provided for Your Request',
      text: `Hi ${customerName},\n\nAn agent has provided a resolution for your delivery request "${productName}".\n\nTotal Cost: $${total}\nEstimated Delivery: ${estimatedDays} days\n\nPlease log in to accept or reject the resolution.\n\nBest regards,\nDelivery App Team`,
      html: `
        <h1>Resolution Provided</h1>
        <p>Hi <strong>${customerName}</strong>,</p>
        <p>An agent has provided a resolution for your delivery request <strong>"${productName}"</strong>.</p>
        <p><strong>Total Cost:</strong> $${total}<br/>
        <strong>Estimated Delivery:</strong> ${estimatedDays} days</p>
        <p>Please log in to accept or reject the resolution.</p>
        <p>Best regards,<br/>Delivery App Team</p>
      `,
    });
  }

  static async sendResolutionAcceptedEmail(
    email: string,
    agentName: string,
    productName: string
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Customer Accepted Your Resolution',
      text: `Hi ${agentName},\n\nThe customer has accepted your resolution for "${productName}".\n\nYou can now proceed with the delivery.\n\nBest regards,\nDelivery App Team`,
      html: `
        <h1>Customer Accepted Your Resolution</h1>
        <p>Hi <strong>${agentName}</strong>,</p>
        <p>The customer has accepted your resolution for <strong>"${productName}"</strong>.</p>
        <p>You can now proceed with the delivery.</p>
        <p>Best regards,<br/>Delivery App Team</p>
      `,
    });
  }

  static async sendResolutionRejectedEmail(
    email: string,
    agentName: string,
    productName: string,
    reason: string | null
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Customer Rejected Your Resolution',
      text: `Hi ${agentName},\n\nThe customer has rejected your resolution for "${productName}".\n\n${reason ? `Reason: ${reason}` : ''}\n\nBest regards,\nDelivery App Team`,
      html: `
        <h1>Customer Rejected Your Resolution</h1>
        <p>Hi <strong>${agentName}</strong>,</p>
        <p>The customer has rejected your resolution for <strong>"${productName}"</strong>.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Best regards,<br/>Delivery App Team</p>
      `,
    });
  }
}

export default EmailService;
