import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { UserResolver } from 'src/user/user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { GroupMessage } from './group-message.entity';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { GroupResolver } from './group.resolver';
import { PubSub } from 'graphql-subscriptions';


@Module({
  imports: [TypeOrmModule.forFeature([Group,GroupMessage,User]),],
  providers: [GroupService,GroupResolver,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ]
})
export class GroupModule {}
