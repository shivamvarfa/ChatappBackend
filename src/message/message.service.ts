import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { In, Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { send } from 'process';
import { UpdateMessageDto } from './dto/update-message.dto';
import { onErrorResumeNextWith } from 'rxjs';
import { GraphQLError } from 'graphql';
import { UserBlockedError } from 'src/myCustomError';


@Injectable()
export class MessageService {

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepository: Repository<Message>,
  ) { }


  async findAll(): Promise<Message[]> {
    return this.messageRepository.find({ relations: ['sender', 'receiver'] });
  }


  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const sender = await this.userService.findOne(createMessageDto.sender);
    const receiver = await this.userService.findOne(createMessageDto.receiver);
    if (!sender.blockedUsers) {
      sender.blockedUsers = [];
    }
    if (sender.blockedUsers.includes(createMessageDto.receiver)) {
      throw new HttpException("400", HttpStatus.BAD_REQUEST);
    }
    if (!receiver.blockedUsers) {
      receiver.blockedUsers = [];
  }
  if (receiver.blockedUsers.includes(createMessageDto.sender)) {
    throw new HttpException("300", HttpStatus.BAD_REQUEST);
  }
    if (!sender || !receiver) {
      throw new Error('Invalid sender or receiver');
    }

    const imageData = createMessageDto.imageData || null;

    const message = this.messageRepository.create({
      content: createMessageDto.content,
      sender,
      receiver,
      imageData, // Store as Base64 string
    });
    this.userService.updateLastMessageTimestamp(createMessageDto.receiver);
    return this.messageRepository.save(message);
  }




  async findMessagesBetween(senderId: string, receiverId: string): Promise<Message[]> {
    // Find messages between sender and receiver
    const messages = await this.messageRepository.find({
      where: [
        { sender: { id: senderId }, receiver: { id: receiverId } },
        { sender: { id: receiverId }, receiver: { id: senderId } },
      ],
      order: {
        createdAt: 'ASC',
      },
      relations: ['sender', 'receiver'],
    });
    return messages;
  }


  async markAsReadMessage(senderId: string, receiverId: string): Promise<Message[]> {
    const updated = await this.messageRepository.update(
      {
        sender: { id: receiverId },
        receiver: { id: senderId },
      },
      {
        read: true,
      }
    );


    return this.findMessagesBetween(senderId, receiverId);
  }


  async unReadCounts(senderId: string, receiverIds: string[]): Promise<{ receiverId: string; unreadCount: number }[]> {
    const unreadCounts = await Promise.all(receiverIds.map(async (receiverId) => {
      const count = await this.messageRepository.count({
        where: {
          sender: { id: receiverId },
          receiver: { id: senderId },
          read: false,  // Count only unread messages
        },
      });
      return { receiverId, unreadCount: count };
    }));

    // Update timestamp for each receiver with unread messages
    unreadCounts.forEach(({ receiverId, unreadCount }) => {
      if (unreadCount > 0) {
        this.userService.updateLastMessageTimestamp(receiverId); // Pass receiverId if that's the expected argument
      }
    });

    return unreadCounts;
  }

  async editMessage(id: string, updateMesssageDto: UpdateMessageDto): Promise<Message> {
    const result = await this.messageRepository.findOne({
      where: { id },
    });
    if (!result) {
      throw new Error(`Message with id ${id} not found.`);
    }
    if (updateMesssageDto.content) {
      result.content = updateMesssageDto.content;
    }
    if (updateMesssageDto.deletedUser) {
      // Ensure `deletedUser` is initialized as an array if it is not already
      if (!result.deletedUser) {
        result.deletedUser = [];
      }

      result.deletedUser.push(updateMesssageDto.deletedUser);
    }

    if (updateMesssageDto.deleteUserForEveryone) {
      // Ensure `deletedUser` is initialized as an array if it is not already
      if (!result.deleteUserForEveryone) {
        result.deleteUserForEveryone = [];
      }

      result.deleteUserForEveryone.push(updateMesssageDto.deleteUserForEveryone);
    }
    await this.messageRepository.save(result);

    const updatedMessage = await this.messageRepository.findOne({ where: { id: id } });

    if (!updatedMessage) {
      throw new Error(`Message with id ${id} not found.`);
    }
    return updatedMessage;
  }


  async deleteMessage(id: string, userId: string): Promise<Message> {
    const result = await this.messageRepository.findOne({
      where: { id },
    });
    if (!result) {
      throw new Error(`Message with id ${id} not found.`);
    }
    const updateMessageDto = {
      content: "This message was deleted.",
      deleteUserForEveryone: userId
    }
    return this.editMessage(id, updateMessageDto);
  }

  async deleteMessageForMe(id: string, userId: string): Promise<void> {
    const result = await this.messageRepository.findOne({
      where: { id },
    });
    if (!result) {
      throw new Error(`Message with id ${id} not found.`);
    }
    const updateMessageDto = {
      deletedUser: userId
    }
    this.editMessage(id, updateMessageDto);
  }

}

