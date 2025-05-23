import { PrismaClient } from '@prisma/client';
import { ActivityResponse, ActivityFilterQuery } from '../model/activity.types';
import { PaginationQuery } from '../model/paging';

const prisma = new PrismaClient();

export class ActivityService {
  static async getUserActivities(userId: number, filter: ActivityFilterQuery): Promise<ActivityResponse[]> {
    const where: any = { userId };
    
    if (filter.type) {
      where.activityType = filter.type;
    }

    const activities = await prisma.userActivity.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: filter.limit || 20,
      skip: ((filter.page || 1) - 1) * (filter.limit || 20)
    });

    return activities.map((activity) => ({
      id: activity.id,
      activityType: activity.activityType,
      referenceType: activity.referenceType,
      referenceId: activity.referenceId,
      createdAt: activity.createdAt,
      showInProfile: activity.showInProfile,
      user: activity.user,
    }));
      
  }

  static async createActivity(userId: number, type: string, referenceType: string, referenceId: number): Promise<void> {
    await prisma.userActivity.create({
      data: {
        userId,
        activityType: type,
        referenceType,
        referenceId
      }
    });
  }
}