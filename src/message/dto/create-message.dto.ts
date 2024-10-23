import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateMessageDto {
  @Field(()=>String)
  content: string;

  @Field(() => String)
  sender: string;

  @Field(() => String)
  receiver: string;

  @Field({ nullable: true })
  imageData?: string;

  @Field(() => [String], { nullable: true }) // Correctly define as an array of strings
  deletedUser?: string[];

  @Field(() => [String], { nullable: true }) // Correctly define as an array of strings
  deleteUserForEveryone?: string[];
}
