import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { send } from 'process';

@Injectable()
export class UserService {
   verifyOtp:string='';
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      //   relations: ['category'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }


  async findAll(id: string): Promise<User[]> {
    return this.userRepository.find({
      where: {
        id: Not(id), // Exclude the user with the given ID
      },
    });

  }


  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }



  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const profileData = updateUserDto.profileImage || null;
    // Verify and update password if provided
    if (updateUserDto.password) {
      if (!updateUserDto.oldPassword) {
        throw new BadRequestException('Old password is required to change the password');
      }
      const isOldPasswordValid = await bcrypt.compare(updateUserDto.oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new BadRequestException('Old password is incorrect');
      }
      // Hash and set the new password
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    if (updateUserDto.username) {
      user.username = updateUserDto.username;
    }
    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    if (updateUserDto.profileImage === null || updateUserDto.profileImage === '') {
      user.profileImage = null;
    } else if (updateUserDto.profileImage) {
      user.profileImage = updateUserDto.profileImage;
    }
    if(updateUserDto.isTyping){
      user.isTyping=true;
    }
    if(!updateUserDto.isTyping){
      user.isTyping=false;
    }
    if(updateUserDto.phoneNumber){
      user.phoneNumber=updateUserDto.phoneNumber;
    }
    return this.userRepository.save(user);
  }

  async logOut(id: string): Promise<User> {
    const currentTimestamp = new Date();
    const updateResult = await this.userRepository.update(id, {
      logOutTimer: currentTimestamp,
      isLogin: false,
    });

    if (updateResult.affected === 0) {
      throw new Error('User not found or update failed');
    }


    const updatedUser = await this.userRepository.findOne({
      where: { id },
    });

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  }

  async sentotp(email:string){
    const user = await this.userRepository.findOne({ 
      where:{email}
     });
      if(!user){
          throw new NotFoundException('User with email not found');
      }
      const otp=Math.floor(100000 + Math.random() * 900000).toString();
      this.verifyOtp=otp;
      return otp;
   }

   async verifyotp(otp:string){
    return this.verifyOtp==otp;
  }


  async updateLastMessageTimestamp(userId: string): Promise<User> {
    const currentTimestamp = new Date();
    const user = await this.userRepository.findOne({
      where:{id:userId}
    });
    if (user) {
      user.lastMessageTimestamp = currentTimestamp;
      return this.userRepository.save(user);
    }
    throw new Error('User not found');
  }
  

  async checkUserBlocked(userId:string,receiverId:string):Promise<boolean>{
    const sender = await this.userRepository.findOne({
      where:{id:userId}
    });
    const receiver = await this.userRepository.findOne({
      where:{id:receiverId}
    });
    if (!receiver.blockedUsers) {
      receiver.blockedUsers = [];
    }
    if (receiver.blockedUsers.includes(userId)) {
      return  true;
    }else{
      return false;
    }
  }
  async blockUser(id: string, blockUserId: string): Promise<User> {
    const receiver = await this.userRepository.findOne({
      where: { id:blockUserId },
    });
    if (!receiver.blockedUsers) {
      receiver.blockedUsers = [];
    }
    receiver.blockedUsers.push(id);
    return this.userRepository.save(receiver);
  }

  async unblockUser(userId: string, unblockUserId: string): Promise<User> {
    const receiver = await this.userRepository.findOne({
      where:{id:unblockUserId}
    });
    receiver.blockedUsers = receiver.blockedUsers.filter(id => id !== userId);
    return this.userRepository.save(receiver);
  }
}
