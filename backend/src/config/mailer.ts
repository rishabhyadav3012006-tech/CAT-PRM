import nodemailer from 'nodemailer';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let transporter: nodemailer.Transporter;

export const initMailer = async (): Promise<nodemailer.Transporter> => {
  if (transporter) return transporter;

  try {
    if (env.SMTP_USER === 'dev_smtp_user' || env.SMTP_USER === 'mock_smtp_user') {
      logger.info('Nodemailer running in development JSON transport mode (emails simulated in memory/logs).');
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
      return transporter;
    }

    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });

    logger.info(`Nodemailer initialized with host: ${env.SMTP_HOST}:${env.SMTP_PORT}`);
    return transporter;
  } catch (error: any) {
    logger.warn(`Failed to initialize primary mail transporter (${error.message}). Creating JSON test transporter fallback.`);
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
    return transporter;
  }
};

export const getMailer = () => transporter;
