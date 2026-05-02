import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { AuthenticatedRequest } from '../../driver/common/api-auth.guard';
import type {
  EntityDto,
  SupportTicketsListResponseDto,
} from '../common/user-api.dto';
import { UserApiHelpers } from '../common/user-api.helpers';

@Injectable()
export class UserSupportService {
  constructor(private readonly userApiHelpers: UserApiHelpers) {}

  listSupportTickets(
    req: AuthenticatedRequest,
    query: Record<string, string | undefined>,
  ): Promise<SupportTicketsListResponseDto> {
    const userId = this.userApiHelpers.getUserId(req);
    const role = this.userApiHelpers
      .getHeader(req, 'x-user-role')
      ?.toUpperCase();

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.priority) where.priority = query.priority;

    if (role !== 'ADMIN' && role !== 'SUPPORT') {
      where.userId = userId;
    }

    const paging = this.userApiHelpers.parsePaging(query.page, query.limit);

    return Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: paging.skip,
        take: paging.limit,
      }),
      prisma.supportTicket.count({ where }),
    ]).then(([tickets, total]) => ({
      tickets,
      pagination: {
        page: paging.page,
        limit: paging.limit,
        total,
        pages: Math.ceil(total / paging.limit),
      },
    }));
  }

  createSupportTicket(
    req: AuthenticatedRequest,
    body: Record<string, unknown>,
  ): Promise<EntityDto> {
    const userId = this.userApiHelpers.getUserId(req);

    return prisma.supportTicket.create({
      data: {
        ticketNumber: `TK-${Date.now()}`,
        subject: this.userApiHelpers.asString(body.subject),
        message: this.userApiHelpers.asString(
          body.description,
          this.userApiHelpers.asString(body.message),
        ),
        category:
          typeof body.category === 'string'
            ? (body.category as
                | 'ACCOUNT_ISSUE'
                | 'PAYMENT_PROBLEM'
                | 'TECHNICAL_SUPPORT'
                | 'BOOKING_ISSUE'
                | 'DRIVER_COMPLAINT'
                | 'FEATURE_REQUEST'
                | 'BUG_REPORT'
                | 'OTHER')
            : 'OTHER',
        priority:
          typeof body.priority === 'string'
            ? (body.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')
            : 'MEDIUM',
        userId,
        contactMethod:
          typeof body.contactMethod === 'string'
            ? body.contactMethod
            : undefined,
        phoneNumber:
          typeof body.phoneNumber === 'string' ? body.phoneNumber : undefined,
        attachments: Array.isArray(body.attachments)
          ? body.attachments.filter(
              (item): item is string => typeof item === 'string',
            )
          : [],
      },
    });
  }

  async getSupportTicket(
    req: AuthenticatedRequest,
    id: string,
  ): Promise<EntityDto> {
    const userId = this.userApiHelpers.getUserId(req);
    const role = this.userApiHelpers
      .getHeader(req, 'x-user-role')
      ?.toUpperCase();

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (role !== 'ADMIN' && role !== 'SUPPORT' && ticket.userId !== userId) {
      throw new ForbiddenException('Forbidden');
    }

    return ticket;
  }

  updateSupportTicket(
    req: AuthenticatedRequest,
    id: string,
    body: Record<string, unknown>,
  ): Promise<EntityDto> {
    this.userApiHelpers.getUserId(req);
    const role = this.userApiHelpers
      .getHeader(req, 'x-user-role')
      ?.toUpperCase();

    if (role !== 'ADMIN' && role !== 'SUPPORT') {
      throw new ForbiddenException('Forbidden');
    }

    return prisma.supportTicket.update({
      where: { id },
      data: {
        status:
          typeof body.status === 'string'
            ? (body.status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED')
            : undefined,
        priority:
          typeof body.priority === 'string'
            ? (body.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')
            : undefined,
        category:
          typeof body.category === 'string'
            ? (body.category as
                | 'ACCOUNT_ISSUE'
                | 'PAYMENT_PROBLEM'
                | 'TECHNICAL_SUPPORT'
                | 'BOOKING_ISSUE'
                | 'DRIVER_COMPLAINT'
                | 'FEATURE_REQUEST'
                | 'BUG_REPORT'
                | 'OTHER')
            : undefined,
        assignedTo:
          typeof body.assignedTo === 'string' ? body.assignedTo : undefined,
      },
      include: {
        messages: true,
      },
    });
  }
}
