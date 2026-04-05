import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { AuthenticatedRequest } from '../../driver/common/api-auth.guard';
import type {
  ApiMessageDto,
  EntityDto,
  ReportsListResponseDto,
} from '../common/user-api.dto';
import { UserApiHelpers } from '../common/user-api.helpers';

@Injectable()
export class UserReportsService {
  constructor(private readonly userApiHelpers: UserApiHelpers) {}

  listReports(
    req: AuthenticatedRequest,
    query: Record<string, string | undefined>,
  ): Promise<ReportsListResponseDto> {
    const userId = this.userApiHelpers.getUserId(req);
    const role = this.userApiHelpers
      .getHeader(req, 'x-user-role')
      ?.toUpperCase();

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;

    if (role !== 'ADMIN' && role !== 'SUPPORT') {
      where.reporterId = userId;
    }

    const paging = this.userApiHelpers.parsePaging(query.page, query.limit);

    return Promise.all([
      prisma.report.findMany({
        where,
        include: {
          taxi: true,
          driver: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: paging.skip,
        take: paging.limit,
      }),
      prisma.report.count({ where }),
    ]).then(([reports, total]) => ({
      reports,
      pagination: {
        page: paging.page,
        limit: paging.limit,
        total,
        pages: Math.ceil(total / paging.limit),
      },
    }));
  }

  createReport(
    req: AuthenticatedRequest,
    body: Record<string, unknown>,
  ): Promise<EntityDto> {
    const userId = this.userApiHelpers.getUserId(req);

    const reportedType =
      typeof body.reportedType === 'string' ? body.reportedType : 'OTHER';
    const reportedId =
      typeof body.reportedId === 'string' ? body.reportedId : undefined;

    const typeMap: Record<
      string,
      | 'DRIVER_BEHAVIOR'
      | 'VEHICLE_CONDITION'
      | 'ROUTE_DEVIATION'
      | 'OVERCHARGING'
      | 'SAFETY_CONCERN'
      | 'OTHER'
    > = {
      DRIVER: 'DRIVER_BEHAVIOR',
      TAXI: 'VEHICLE_CONDITION',
      ROUTE: 'ROUTE_DEVIATION',
      PAYMENT: 'OVERCHARGING',
      SAFETY: 'SAFETY_CONCERN',
      OTHER: 'OTHER',
    };

    const type =
      typeMap[reportedType.toUpperCase()] ??
      (typeof body.category === 'string' && typeMap[body.category.toUpperCase()]
        ? typeMap[body.category.toUpperCase()]
        : 'OTHER');

    return prisma.report.create({
      data: {
        type,
        description: this.userApiHelpers.asString(
          body.description,
          this.userApiHelpers.asString(body.title),
        ),
        status: 'OPEN',
        reporterId: userId,
        driverId:
          reportedType.toUpperCase() === 'DRIVER' ? reportedId : undefined,
        taxiId: reportedType.toUpperCase() === 'TAXI' ? reportedId : undefined,
        images: Array.isArray(body.evidence)
          ? body.evidence.filter(
              (item): item is string => typeof item === 'string',
            )
          : [],
      },
    });
  }

  async getReportById(
    req: AuthenticatedRequest,
    id: string,
  ): Promise<EntityDto> {
    const userId = this.userApiHelpers.getUserId(req);
    const role = this.userApiHelpers
      .getHeader(req, 'x-user-role')
      ?.toUpperCase();

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        taxi: true,
        driver: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (
      role !== 'ADMIN' &&
      role !== 'SUPPORT' &&
      report.reporterId !== userId
    ) {
      throw new ForbiddenException('Forbidden');
    }

    return report;
  }

  updateReport(
    req: AuthenticatedRequest,
    id: string,
    body: Record<string, unknown>,
  ): Promise<EntityDto> {
    const userId = this.userApiHelpers.getUserId(req);
    const role = this.userApiHelpers
      .getHeader(req, 'x-user-role')
      ?.toUpperCase();

    return prisma.report.findUnique({ where: { id } }).then(async (report) => {
      if (!report) {
        throw new NotFoundException('Report not found');
      }

      if (
        role !== 'ADMIN' &&
        role !== 'SUPPORT' &&
        report.reporterId !== userId
      ) {
        throw new ForbiddenException('Forbidden');
      }

      return prisma.report.update({
        where: { id },
        data: {
          status:
            typeof body.status === 'string'
              ? (body.status as 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED')
              : undefined,
          assignedTo:
            typeof body.assignedTo === 'string' ? body.assignedTo : undefined,
          resolutionNotes:
            typeof body.resolution === 'string' ? body.resolution : undefined,
          closedAt:
            typeof body.status === 'string' && body.status === 'CLOSED'
              ? new Date()
              : undefined,
        },
      });
    });
  }

  async deleteReport(
    req: AuthenticatedRequest,
    id: string,
  ): Promise<ApiMessageDto> {
    const userId = this.userApiHelpers.getUserId(req);
    const role = this.userApiHelpers
      .getHeader(req, 'x-user-role')
      ?.toUpperCase();

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (role !== 'ADMIN' && report.reporterId !== userId) {
      throw new ForbiddenException('Forbidden');
    }

    await prisma.report.delete({ where: { id } });
    return { message: 'Report deleted successfully' };
  }
}
