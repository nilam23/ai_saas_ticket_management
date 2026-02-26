export class UserAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists for the tenant`);
    this.name = 'UserAlreadyExistsException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserAlreadyExistsException);
    }
  }
}

export class UserNotFoundException extends Error {
  constructor(email: string) {
    super(`User with email ${email} not found for the tenant`);
    this.name = 'UserNotFoundException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserNotFoundException);
    }
  }
}
