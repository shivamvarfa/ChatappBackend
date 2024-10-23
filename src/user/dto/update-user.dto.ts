import { InputType, Field, ID } from '@nestjs/graphql';


@InputType()
export class UpdateUserDto {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  oldPassword?: string;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field({ nullable: true })
  profileImage?: string;

  @Field({nullable:true})
  isTyping?:boolean;

  @Field({ nullable: true })
  phoneNumber?: string;


  @Field(() => [String], { nullable: true }) // Correctly define as an array of strings
  blockedUsers?: string[];
}
