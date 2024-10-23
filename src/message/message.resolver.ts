import { Resolver, Mutation, Query, Args, Subscription, ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { PubSub } from 'graphql-subscriptions';
import { Inject, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PropertyMetadata } from '@nestjs/core/injector/instance-wrapper';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ArgsFactory } from '@nestjs/graphql/dist/schema-builder/factories/args.factory';
import { GraphQLError } from 'graphql';

@ObjectType()
export class UnreadCount {
  @Field()
  receiverId: string;

  @Field(() => Int)
  unreadCount: number;
}
@ObjectType()
export class MessageDeleted {
  @Field()
  id: string;
}

@Resolver(() => Message)
export class MessageResolver {
  private readonly pubSub: PubSub;
  constructor(private readonly messageService: MessageService) {
    this.pubSub = new PubSub();
  }



  @Query(() => [Message])
  @UseGuards(JwtAuthGuard)
  async getAllMessages(): Promise<Message[]> {
    return this.messageService.findAll();
  }

  @Mutation(() => Message)
  async createMessage(
    @Args('createMessageDto') createMessageDto: CreateMessageDto
  ): Promise<Message> {
      const message = await this.messageService.create(createMessageDto);
      this.pubSub.publish('messageCreated', { messageCreated: message });
      return message;
  }
  @Subscription(() => Message, {
    resolve: (payload) => payload.messageCreated,
  })
  messageCreated() {
    return this.pubSub.asyncIterator('messageCreated');
  }


  @Query(() => [Message])
  async getMessagesBetween(
    @Args('senderId') senderId: string,
    @Args('receiverId') receiverId: string,
  ): Promise<Message[]> {
    return this.messageService.findMessagesBetween(senderId, receiverId);
   // this.pubSub.publish(MESSAGE_READ_TOPIC, { messageRead: updatedMessages });
  }
  
  
  @Mutation(()=>[Message])
  async markAsRead(@Args('senderId') senderId:string,@Args('receiverId') receiverId:string):Promise<Message[]>{
   const readMessages= this.messageService.markAsReadMessage(senderId,receiverId);
   this.pubSub.publish('messagesMarkedAsRead', { messagesMarkedAsRead: readMessages });
    return readMessages;
  }

  @Subscription(() => [Message], {
    resolve: (payload) => payload.messagesMarkedAsRead,
  })
  messagesMarkedAsRead() {
    return this.pubSub.asyncIterator('messagesMarkedAsRead');
  }


  @Query(() => [UnreadCount])
  async unReadCounts(@Args('senderId') senderId: string,@Args('receiverIds', { type: () => [String] }) receiverIds: string[]): Promise<{ receiverId: string; unreadCount: number }[]> {
    const unreadCounts = await this.messageService.unReadCounts(senderId, receiverIds);
    this.pubSub.publish('unreadCounts', { unreadCounts });
    return unreadCounts;
  }
  
  @Subscription(() => [UnreadCount], {
    filter: (payload, variables) => {
      // Ensure the subscription only provides updates relevant to the client
      return variables.receiverIds.some(id => payload.unreadCounts.some(count => count.receiverId === id));
    },
    resolve: (payload) => payload.unreadCounts,
  })
  unreadCounts(
    @Args('senderId') senderId: string,
    @Args('receiverIds', { type: () => [String] }) receiverIds: string[]
  ) {
    return this.pubSub.asyncIterator('unreadCounts');
  }



  
  @Mutation(()=>Message)
  async editMessage(@Args('id') id:string,@Args('updateMessageDto') updateMessageDto:UpdateMessageDto):Promise<Message>{
    return this.messageService.editMessage(id,updateMessageDto);
  }


  // method for delete messsage for everyone
  @Mutation(() => Message)
  async deleteMessage(@Args('id') id: string,@Args('userId') userId:string): Promise<Message> {
     const message= await this.messageService.deleteMessage(id,userId);
       return message;
  }

  @Mutation(() => Boolean)
  async deleteMessageForMe(@Args('id') id: string,@Args('userId') userId:string): Promise<boolean> {
    try {
      await this.messageService.deleteMessageForMe(id,userId);
      return true;
    } catch (error) {
      return false;
    }
  }
}