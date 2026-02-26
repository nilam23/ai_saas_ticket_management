import { UserInfoInRequest } from 'src/modules/user/types/user.type';

declare global {
  namespace Express {
    interface Request {
      tenantId: string;
      user: UserInfoInRequest;
    }
  }
}
