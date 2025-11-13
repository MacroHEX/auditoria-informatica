import {NextFunction, Request, Response} from 'express';

export interface ErrorConCodigo extends Error {
  statusCode?: number;
}

export function errorHandler(
  error: ErrorConCodigo,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error capturado por el middleware:', error);

  const statusCode = error.statusCode || 500;
  const mensaje = error.message || 'Error interno del servidor';

  // En desarrollo, incluir stack trace
  const respuesta: any = {
    error: mensaje,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  if (process.env.NODE_ENV === 'development') {
    respuesta.stack = error.stack;
  }

  res.status(statusCode).json(respuesta);
}