import { Args, Field, Mutation, ObjectType, Query, Resolver, Subscription } from "@nestjs/graphql";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AuthService } from "src/auth/auth.service";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { BlobOptions } from "buffer";



@ObjectType()
class VerifyTokenResponse {
  @Field(() => Boolean)
  valid: boolean;
}
@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;

  @Field()
  id: string;
}

@Resolver(() => () => User)
export class UserResolver {

  private readonly pubSub: PubSub;
  constructor(private readonly userService: UserService,private readonly authService:AuthService) {
    this.pubSub = new PubSub();
   }

  @Query(() => User)
  async getUser(@Args('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Query(() => [User])
  async getAllUser(@Args('id') id:string): Promise<User[]> {
    return this.userService.findAll(id);
  }


  @Mutation(() => User)
  async createUser(@Args('createUserDto') createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Mutation(() => User)
  async updateUser(@Args('id') id: string, @Args('updateUserDto') updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userService.update(id, updateUserDto);
    this.pubSub.publish('userUpdated', { userUpdated: updatedUser, id });
    return updatedUser;
  }
  @Subscription(() => User, {
    filter: (payload, variables) => payload.userUpdated.id === variables.id,
  })
  userUpdated(@Args('id') id: string) {
    return this.pubSub.asyncIterator('userUpdated');
  }

  @Mutation(() => LoginResponse)
  async login(@Args('email') email: string, @Args('password') password: string): Promise<LoginResponse> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const { access_token,id } = await this.authService.login(user.id,user);
    return {access_token,id};
  }

  @Mutation(() => VerifyTokenResponse)
  async verifyToken(@Args('token') token: string): Promise<VerifyTokenResponse> {
    try {
      const result = await this.authService.verifyTokenMutation(token);
      return result;
    } catch (error) {
      // Handle the error according to your application's needs
      throw new Error(error.message);
    }
  }

  @Mutation(()=>User)
  async logOut(@Args('id') id:string):Promise<User>{
    return this.userService.logOut(id);
  }
   
  @Query(()=>String)
  async sentOtp(@Args('email') email:string){
    if(!email){
      throw new BadRequestException('email is required');
    }
    return this.userService.sentotp(email);
  }


   @Query(()=>Boolean)
   async verifyOtp(@Args('otp') otp:string){
    if(!otp){
      throw new BadRequestException('otp is required');
    }
    return this.userService.verifyotp(otp);
   }

   @Query(()=>Boolean)
   async checkBlockUser(@Args('userId') userId:string,@Args('recevierId') recevierId:string):Promise<boolean>{
    return this.userService.checkUserBlocked(userId,recevierId);
   }


   @Mutation(() => User)
   async blockUser(@Args('userId') userId: string, @Args('blockUserId') blockUserId: string): Promise<User> {
     return this.userService.blockUser(userId, blockUserId);
   }

 @Mutation(() => User)
  async unblockUser(@Args('userId') userId: string, @Args('unblockUserId') unblockUserId: string): Promise<User> {
    return this.userService.unblockUser(userId, unblockUserId);
  }
}