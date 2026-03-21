import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import {
  CreateUserInput,
  GetTenantUsersOutput,
  GetUserDataInput,
} from '../types/user.type';
import { hashPassword } from 'src/modules/auth/utils/password.utils';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findUserByEmail(
    getUserDataInput: GetUserDataInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          email: getUserDataInput.email,
          tenantId: getUserDataInput.tenantId,
        },
      },
    });
  }

  public async createUser(createUserInput: CreateUserInput): Promise<User> {
    const hashedPassword = await hashPassword(createUserInput.password);
    const userData: Prisma.UserCreateInput = {
      name: createUserInput.name,
      email: createUserInput.email,
      passwordHash: hashedPassword,
      tenant: {
        connect: {
          id: createUserInput.tenantId,
        },
      },
      ...(createUserInput.role && { role: createUserInput.role }),
      agentLevel: createUserInput.agentLevel,
    };

    return this.prisma.user.create({
      data: userData,
    });
  }

  public async getUsersByTenantId(
    tenantId: string,
  ): Promise<GetTenantUsersOutput> {
    return this.prisma.user.findMany({
      where: {
        tenantId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        agentLevel: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
