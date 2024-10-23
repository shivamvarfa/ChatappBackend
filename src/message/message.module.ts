import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessageResolver } from './message.resolver';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { PubSub } from 'graphql-subscriptions';

@Module({
  imports: [TypeOrmModule.forFeature([Message,User]),],
  providers: [MessageService,MessageResolver,UserService,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ]
})
export class MessageModule {}
