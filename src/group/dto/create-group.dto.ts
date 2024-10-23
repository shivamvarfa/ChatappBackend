import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateGroupDto {
  @Field()
  name: string;

  @Field(() => [String])
  members: string[]; // IDs of users

  @Field(()=>String )
  adminId:string;
}

