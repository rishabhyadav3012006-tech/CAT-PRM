import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
  meta?: ApiResponse['meta']
) => {
  const responsePayload: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta
  };
  return res.status(statusCode).json(responsePayload);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: any
) => {
  const responsePayload: ApiResponse = {
    success: false,
    message,
    errors
  };
  return res.status(statusCode).json(responsePayload);
};

