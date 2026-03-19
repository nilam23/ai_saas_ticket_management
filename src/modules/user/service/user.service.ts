import { UserRepository } from '../repository/user.repository';
import { Injectable, Logger } from '@nestjs/common';
import { UserRole, User } from '@prisma/client';
import {
  UserAlreadyExistsException,
  UserNotFoundException,
} from '../exceptions';
import {
  CreateUserInput,
  GetTenantUsersInput,
  GetTenantUsersOutput,
  GetUserDataInput,
} from '../types/user.type';
import { AuditService } from 'src/modules/audit/service/audit.service';
import {
  AuditLogAction,
  AuditLogEntityType,
} from 'src/modules/audit/enums/audit-log.enum';
import { AuditContext } from 'src/modules/audit/types/audit.type';
import { KafkaProducer } from 'src/infra/kafka/service/kafka-producer.service';
import { KafkaTopic } from 'src/infra/kafka/enums/kafka.enum';
import { AgentCreatedEvent } from '../events/agent-created.event';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditService: AuditService,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  public async getUserData(getUserDataInput: GetUserDataInput): Promise<User> {
    this.logger.debug(
      `Getting user data. Email: ${getUserDataInput.email}, TenantId: ${getUserDataInput.tenantId}`,
    );
    const user = await this.userRepository.findUserByEmail(getUserDataInput);

    if (!user) {
      this.logger.error(
        `User not found. Email: ${getUserDataInput.email}, TenantID: ${getUserDataInput.tenantId}`,
      );
      throw new UserNotFoundException(getUserDataInput.email);
    }

    return user;
  }

  public async createUser(
    createUserInput: CreateUserInput,
    auditContext?: AuditContext,
  ): Promise<User> {
    const { name, email, tenantId, agentSkills, role } = createUserInput;
    this.logger.debug(
      `Checking user existence within tenant. Email: ${email}, TenantID: ${tenantId}`,
    );
    const user = await this.userRepository.findUserByEmail(createUserInput);

    if (user) {
      this.logger.error(
        `User already exists. Email: ${email}, TenantID: ${tenantId}`,
      );
      throw new UserAlreadyExistsException(email);
    }

    this.logger.debug(`Creating user. Email: ${email}, TenantID: ${tenantId}`);
    const newUser = await this.userRepository.createUser(createUserInput);

    if (newUser.role === UserRole.AGENT) {
      this.logger.debug(
        `An agent has been created. AgentID: ${newUser.id}, TenantID: ${newUser.tenantId}`,
      );
      const event = new AgentCreatedEvent({
        agentId: newUser.id,
        tenantId: newUser.tenantId,
        skills: agentSkills!,
      });
      this.logger.debug(
        `Emitting event. Topic: ${KafkaTopic.EVENT_BUS}, Event: ${event.name}, Event ID: ${event.id}`,
      );
      this.kafkaProducer.emit(KafkaTopic.EVENT_BUS, event);
    }

    if (auditContext) {
      await this.auditService.createAuditLog({
        tenantId: tenantId,
        actorUserId: auditContext.actorUserId!,
        action:
          role === UserRole.ADMIN
            ? AuditLogAction.ADMIN_CREATE
            : AuditLogAction.AGENT_CREATE,
        entityType: AuditLogEntityType.USER,
        entityId: newUser.id,
        afterState: {
          id: newUser.id,
          email: email,
          name: name,
          role: role,
          tenantId: tenantId,
        },
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
      });
    }

    return newUser;
  }

  public async getUsersByTenantId(
    getTenantUsersInput: GetTenantUsersInput,
  ): Promise<GetTenantUsersOutput> {
    this.logger.debug(
      `Getting tenant users. TenantID: ${getTenantUsersInput.tenantId}`,
    );
    return this.userRepository.getUsersByTenantId(getTenantUsersInput.tenantId);
  }
}
