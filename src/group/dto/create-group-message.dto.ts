import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateGroupMessageDto {
  @Field()
  content: string;

  @Field()
  groupId: string;

  @Field()
  senderId: string;

  @Field({ nullable: true })
  imageData?: string;

  @Field(() => [String], { nullable: true }) // Correctly define as an array of strings
  deletedUser?: string[];

  @Field(() => [String], { nullable: true }) // Correctly define as an array of strings
  deleteUserForEveryone?: string[];
}
