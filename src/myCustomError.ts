// src/errors/user-blocked-error.ts
import { ApolloError } from 'apollo-server-express';

export class UserBlockedError extends ApolloError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, 'USER_BLOCKED', extensions);
  }
}

