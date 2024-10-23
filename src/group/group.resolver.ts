import { Args, Field, Mutation, ObjectType, Query, Subscription } from "@nestjs/graphql";
import { GroupService } from "./group.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { Group } from "./group.entity";
import { GroupMessage } from "./group-message.entity";
import { CreateGroupMessageDto } from "./dto/create-group-message.dto";
import { User } from "src/user/user.entity";
import { PubSub } from "graphql-subscriptions";
import { UpdateGroupMessageDto } from "./dto/update-group-message.dto";
import { UpdateGroupDto } from "./dto/update-create-group.dto";

@ObjectType()
export class GroupMessagePayload {
  @Field(() => GroupMessage)
  message: GroupMessage;

  @Field(() => Group)
  group: Group;
}
@ObjectType()
export class GroupMember {
  @Field(() => User)
  user: User;

  @Field(() => Boolean)
  admin: boolean;
}

@ObjectType()
export class GroupResolver {
  private readonly pubSub: PubSub;
  constructor(private readonly groupService: GroupService) {
    this.pubSub = new PubSub();
  }

  @Mutation(() => Group)
  async createGroup(@Args('createGroupDto') createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupService.createGroup(createGroupDto);
  }

  @Mutation(() => GroupMessage)
  async createGroupMessage(@Args('createGroupMessageDto') createGroupMessageDto: CreateGroupMessageDto): Promise<GroupMessage> {
    const message = await this.groupService.createGroupMessage(createGroupMessageDto);
    if (!message.id) {
      throw new Error('Created message does not have an ID.');
    }
    const group = await this.groupService.findGroupById(createGroupMessageDto.groupId);
    this.pubSub.publish('groupMessageCreated', {
      groupMessageCreated: {
        message: message,
        group: group,
      },
    });
    return message;
  }
  @Subscription(() => GroupMessagePayload, {
    resolve: (payload) => payload.groupMessageCreated,
  })
  groupMessageCreated() {
    return this.pubSub.asyncIterator('groupMessageCreated');
  }



  @Query(() => [GroupMessage])
  async getGroupMessages(@Args('groupId') groupId: string): Promise<GroupMessage[]> {
    return this.groupService.findGroupMessages(groupId);
  }

  @Query(() => Group)
  async getGroup(@Args('id') id: string): Promise<Group> {
    return this.groupService.findGroupById(id);
  }


  @Query(() => [Group])
  async getGroupByUserId(@Args('userId') userId: string): Promise<Group[]> {
    return this.groupService.findGroupByUserId(userId);
  }

  @Query(() => [GroupMember]) // Define return type as an array of User
  async getMembersByGroupId(@Args('groupId') groupId: string): Promise<GroupMember[]> {
    return this.groupService.findMembersByGroupId(groupId);
  }


  @Mutation(() => GroupMessage)
  async editGroupMessage(@Args('id') id: string, @Args('updateGroupMessageDto') updateGroupMessageDto: UpdateGroupMessageDto): Promise<GroupMessage> {
    return this.groupService.editGroupMessage(id, updateGroupMessageDto);
  }

 // method for delete messsage for everyone
 @Mutation(() => GroupMessage)
 async deleteGroupMessage(@Args('id') id: string,@Args('userId') userId:string): Promise<GroupMessage> {
    const message= await this.groupService.deleteMessage(id,userId);
      return message;
 }

  @Mutation(() => Group)
  async updateGroup(@Args('id') id: string, @Args('updateGroupDto') updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.groupService.updateGroup(id, updateGroupDto);
    if (!group) {
      throw new Error('Group not found or update failed.');
    }
    return group;
  }

  @Mutation(() => Boolean)
  async deleteGroupMessageForMe(@Args('id') id: string,@Args('userId') userId:string): Promise<boolean> {
    try {
      await this.groupService.deleteMessageForMe(id,userId);
      return true;
    } catch (error) {
      return false;
    }
  }
}