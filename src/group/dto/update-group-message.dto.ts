import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateGroupMessageDto {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(()=>String,{ nullable: true })
  content?: string; 

  @Field({ nullable: true })
  groupId?: string; 

  @Field({ nullable: true })
  senderId?: string; 

  @Field(()=>String,{nullable:true})
  deletedUser?:string;

  @Field(()=>String,{nullable:true})
  deleteUserForEveryone?:string;
}
