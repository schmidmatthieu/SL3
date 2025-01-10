import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecoveryService } from '../services/recovery.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecoveryLog } from '../schemas/recovery-log.schema';

@Injectable()
export class RecoveryTask {
  private readonly logger = new Logger(RecoveryTask.name);

  constructor(
    private readonly recoveryService: RecoveryService,
    @InjectModel(RecoveryLog.name) private recoveryLogModel: Model<RecoveryLog>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleDetection() {
    try {
      this.logger.log('Starting inconsistency detection...');
      const logs = await this.recoveryService.detectInconsistencies();
      this.logger.log(`Detected ${logs.length} inconsistencies`);

      if (logs.length > 0) {
        await this.recoveryService.repairInconsistencies();
        this.logger.log('Completed repair process');
      }
    } catch (error) {
      this.logger.error(`Error in recovery task: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldLogs() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.recoveryLogModel.deleteMany({
        status: { $in: ['repaired', 'failed'] },
        createdAt: { $lt: thirtyDaysAgo },
      });

      this.logger.log(`Cleaned up ${result.deletedCount} old recovery logs`);
    } catch (error) {
      this.logger.error(`Error cleaning up old logs: ${error.message}`);
    }
  }
}
