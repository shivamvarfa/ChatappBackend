import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateMessageDto {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  content?: string;

  @Field(()=>String,{nullable:true})
  deletedUser?:string;

  @Field(()=>String,{nullable:true})
  deleteUserForEveryone?:string;
}
