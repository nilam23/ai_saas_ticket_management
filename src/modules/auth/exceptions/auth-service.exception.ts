export class InvalidPasswordException extends Error {
  constructor() {
    super('Invalid password');
    this.name = 'InvalidPasswordException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidPasswordException);
    }
  }
}
