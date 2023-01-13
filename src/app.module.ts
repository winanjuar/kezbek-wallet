import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletBalanceActual } from './entity/wallet-balance-actual.entity';
import { WalletBalanceHistory } from './entity/wallet-balance-history.entity';
import { WalletTransaction } from './entity/wallet-transaction.entity';
import { WalletBalanceActualRepository } from './repository/wallet-balance-actual.repository';
import { WalletBalanceHistoryRepository } from './repository/wallet-balance-history.repository';
import { WalletTransactionRepository } from './repository/wallet-transaction.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env` }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRESQL_HOST'),
        port: configService.get<number>('POSTGRESQL_PORT'),
        username: configService.get<string>('POSTGRESQL_USERNAME'),
        password: configService.get<string>('POSTGRESQL_PASSWORD'),
        database: configService.get<string>('POSTGRESQL_DATABASE'),
        entities: [
          WalletTransaction,
          WalletBalanceHistory,
          WalletBalanceActual,
        ],
        synchronize: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    WalletTransactionRepository,
    WalletBalanceActualRepository,
    WalletBalanceHistoryRepository,
  ],
})
export class AppModule {}
