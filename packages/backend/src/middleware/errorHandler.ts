import { Request, Response, NextFunction } from 'express';

// 📝 PUNTO DE AUDITORÍA (Respond): 
// Middleware centralizado para manejo de errores
// Permite una respuesta consistente ante excepciones

export interface ErrorConCodigo extends Error {
  statusCode?: number;
}

export function errorHandler(
  error: ErrorConCodigo,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('💥 Error capturado por el middleware:', error);

  // 📝 PUNTO DE AUDITORÍA (Recover): 
  // El sistema intenta recuperarse enviando una respuesta de error
  // en lugar de caerse completamente

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