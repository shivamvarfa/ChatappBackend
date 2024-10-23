import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { User } from './user/user.entity';
import { Message } from './message/message.entity';
import { PubSub } from 'graphql-subscriptions';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { GroupModule } from './group/group.module';
import { Group } from './group/group.entity';
import { GroupMessage } from './group/group-message.entity';

@Module({
  imports: [UserModule, MessageModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: true,
      subscriptions: {
        'subscriptions-transport-ws': {
          path: '/graphql',
          onConnect: (connectionParams) => {
            return { pubsub: new PubSub() };
          },
        },
      },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'cdn@123456',
      database: 'chat',
      entities: [User,Message,Group,GroupMessage],
      synchronize: true,
    }),
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'secretkey', // Replace with your actual secret
      signOptions: { expiresIn: '1h' },
    }),
    GroupModule,
  ],
  controllers: [AppController],
  providers: [AppService,{
    provide: 'PUB_SUB',
    useValue: new PubSub(), // Provide PubSub instance for subscriptions
  },],
})
export class AppModule {}
