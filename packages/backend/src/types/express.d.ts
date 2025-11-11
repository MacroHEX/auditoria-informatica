import { User } from '@prisma/client';

// Extender el tipo Request de Express para futura implementación de autenticación
declare global {
  namespace Express {
    interface Request {
      user?: User; // Para futura implementación de autenticación
    }
  }
}