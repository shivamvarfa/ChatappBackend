import { Field, ID, InputType } from "@nestjs/graphql";


@InputType()
export class UpdateGroupDto{

    // @Field(()=>ID, { nullable: true })
    // id?:string;

    @Field({nullable:true})
    name?:string;

    @Field(()=>[String],{nullable:true})
    addMembers?:string[];

    @Field(()=>[String],{nullable:true})
    removeMembers?:string[];

    @Field(()=>String,{nullable:true})
    adminId:string;
}