import { InputType, Field, ID, ObjectType, Int } from '@nestjs/graphql';

@InputType()
export class CreateUserDto {
 @Field(() => ID)
  username: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field({ nullable: true })
  profileImage?: string;

  @Field({nullable:true})
  isTyping?:boolean;

  @Field({ nullable: true })
  phoneNumber?: string; // New field

  @Field(() => [String], { nullable: true }) // Correctly define as an array of strings
  blockedUsers?: string[];
}






