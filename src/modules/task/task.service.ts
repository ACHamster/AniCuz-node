import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { isSameDay } from 'date-fns';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(private prisma: PrismaService) {}

  async checkAndCompleteTask(userId: number, taskCode: string) {
    const taskRule = await this.prisma.taskRule.findUnique({
      where: { code: taskCode },
    });

    if (!taskRule || !taskRule) {
      return;
    }

    let userProgress = await this.prisma.userTaskProgress.findUnique({
      where: {
        userId_taskRuleId: { userId, taskRuleId: taskRule.id },
      },
    });

    // 在没有任务记录的时候进行创建
    if (!userProgress) {
      userProgress = await this.prisma.userTaskProgress.create({
        data: { userId, taskRuleId: taskRule.id, count: 0 },
      });
    }

    // 判断每日任务的重置逻辑
    if (taskRule.type === 'DAILY') {
      const isToday = isSameDay(new Date(), userProgress.lastUpdate);
      if (!isToday) {
        // 如果上次更新不是今天，说明是新的一天，重置计数
        userProgress.count = 0;
        userProgress.status = 'IN_PROGRESS';
      }
    }

    if (userProgress.count >= taskRule.limit) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { point: { increment: taskRule.reward } },
      });

      await tx.pointLog.create({
        data: {
          userId,
          amount: taskRule.reward,
          reason: `完成任务: ${taskRule.name}`,
        },
      });

      await tx.userTaskProgress.update({
        where: { id: userProgress.id },
        data: {
          count: { increment: 1 },
          lastUpdate: new Date(),
          // 如果做完这次正好达到上限，标记为 COMPLETED
          status:
            userProgress.count + 1 >= taskRule.limit
              ? 'COMPLETED'
              : 'IN_PROGRESS',
        },
      });
    });

    this.logger.log(
      `User ${userId} completed task ${taskCode}, +${taskRule.reward} points`,
    );
  }

  // 事件监听区
  @OnEvent('article.created')
  async handleArticleCreatedEvent(payload: { userId: number }) {
    await this.checkAndCompleteTask(payload.userId, 'article:publish');
  }
}
