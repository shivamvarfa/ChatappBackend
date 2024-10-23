import { Injectable, NotFoundException } from '@nestjs/common';
import { Group } from './group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupMessage } from './group-message.entity';
import { User } from 'src/user/user.entity';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';
import { GroupMember } from './group.resolver';
import { UpdateGroupMessageDto } from './dto/update-group-message.dto';
import { UpdateGroupDto } from './dto/update-create-group.dto';

@Injectable()
export class GroupService {

  constructor(@InjectRepository(Group) private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMessage) private readonly groupMessageRepository: Repository<GroupMessage>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,) { }


  async createGroup(createGroupDto: CreateGroupDto): Promise<Group> {
    // Fetch the users who are members of the group
    const users = await this.userRepository.find({
      where: { id: In(createGroupDto.members) },
    });

    // Fetch the admin user
    const admin = await this.userRepository.findOne({
      where: { id: createGroupDto.adminId }
    });
    if (!admin) {
      throw new Error(`Admin user with ID ${createGroupDto.adminId} not found`);
    }
    const group = this.groupRepository.create({
      name: createGroupDto.name,
      members: users,
      adminId: admin,
    });

    // Save and return the group
    return this.groupRepository.save(group);
  }


  async createGroupMessage(createGroupMessageDto: CreateGroupMessageDto): Promise<GroupMessage> {
    const { content, groupId, senderId } = createGroupMessageDto;
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });
    if (!sender) {
      throw new Error('Sender not found');
    }
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members']
    });
    if (!group) {
      throw new Error('Group not found');
    }

    const imageData = createGroupMessageDto.imageData || null;
    const groupMessage = this.groupMessageRepository.create({
      content,
      group,
      sender,
      imageData,
    });

    return await this.groupMessageRepository.save(groupMessage);
  }

  async findGroupMessages(groupId: string): Promise<GroupMessage[]> {
    return this.groupMessageRepository.find({
      where: {
        group: { id: groupId },
      },
      relations: ['sender', 'group'],
      order: { createdAt: 'ASC' }
    });
  }


  async findGroupById(groupId: string): Promise<Group> {
    return this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members', 'adminId'], // This ensures members are loaded with the group
    });
  }

  async findGroupByUserId(userId: string): Promise<Group[]> {
    // Fetch groups where the specified user is either a member or the admin
    const groups = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.members', 'member')
      .leftJoinAndSelect('group.adminId', 'admin')
      .where('member.id = :userId OR admin.id = :userId', { userId })
      .getMany();

    return groups;
  }


  async findMembersByGroupId(groupId: string): Promise<GroupMember[]> {
    // Fetch the group along with its members
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members'],
    });

    if (!group) {
      throw new Error('Group not found');
    }

    return group.members.map(member => ({
      user: member,
      admin: member.id === group.adminId.id,
    }));
  }

// edit the group message like delete,delete all,deleteme 
  async editGroupMessage(id: string, updateGroupMesssageDto: UpdateGroupMessageDto): Promise<GroupMessage> {
    const result = await this.groupMessageRepository.findOne({
      where: { id },
    });
    if (!result) {
      throw new Error(`Message with id ${id} not found.`);
    }
    if (updateGroupMesssageDto.content) {
      result.content = updateGroupMesssageDto.content;
    }
    if (updateGroupMesssageDto.deletedUser) {
      // Ensure `deletedUser` is initialized as an array if it is not already
      if (!result.deletedUser) {
        result.deletedUser = [];
      }

      result.deletedUser.push(updateGroupMesssageDto.deletedUser);
    }

    if (updateGroupMesssageDto.deleteUserForEveryone) {
      // Ensure `deletedUser` is initialized as an array if it is not already
      if (!result.deleteUserForEveryone) {
        result.deleteUserForEveryone = [];
      }

      result.deleteUserForEveryone.push(updateGroupMesssageDto.deleteUserForEveryone);
    }
    await this.groupMessageRepository.save(result);

    const updatedMessage = await this.groupMessageRepository.findOne({ where: { id: id } });

    if (!updatedMessage) {
      throw new Error(`Message with id ${id} not found.`);
    }
    return updatedMessage;
  }


  async deleteMessage(id: string,userId:string): Promise<GroupMessage> {
    const result = await this.groupMessageRepository.findOne({
      where: { id },
    });
    if (!result) {
      throw new Error(`Message with id ${id} not found.`);
    }
    const updateMessageDto={
      content:"This message was deleted.",
      deleteUserForEveryone:userId
    }
    return this.editGroupMessage(id,updateMessageDto);
  }
  async deleteMessageForMe(id: string,userId:string): Promise<void> {
    const result = await this.groupMessageRepository.findOne({
      where: { id },
    });
    if (!result) {
      throw new Error(`Message with id ${id} not found.`);
    }
    const updateMessageDto={
      deletedUser:userId
    }
    this.editGroupMessage(id,updateMessageDto);
  }

  async updateGroup(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['members', 'adminId']  // Load relations if needed
    });
    if (!group) {
      throw new Error(`Group with id ${id} not found`);
    }

    // Update fields in the group
    if (updateGroupDto.name) {
      group.name = updateGroupDto.name;
    }

    if (updateGroupDto.addMembers) {
      const newMembers = await Promise.all(
        updateGroupDto.addMembers.map(memberId => this.userRepository.findOne({ where: { id: memberId } }))
      );
      group.members = [...new Set([...group.members, ...newMembers])];
    }

    if (updateGroupDto.removeMembers) {
      // Remove members
      group.members = group.members.filter(member => !updateGroupDto.removeMembers.includes(member.id));
    }
  
    if (updateGroupDto.adminId) {
      // Set new admin
      const newAdmin = await this.userRepository.findOne({ where: { id: updateGroupDto.adminId } });
      if (!newAdmin) {
        throw new Error(`User with id ${updateGroupDto.adminId} not found`);
      }
      group.adminId = newAdmin;
    }
  
    // Save the updated group entity
      await this.groupRepository.save(group);
 
    return group;
  }
}
