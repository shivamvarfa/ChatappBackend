import { Field, ID, ObjectType } from "@nestjs/graphql";
import { User } from "src/user/user.entity";
import { Entity,PrimaryGeneratedColumn,Column,ManyToMany,JoinTable, ManyToOne, JoinColumn } from "typeorm";
@ObjectType()
@Entity()
export class Group{
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column({ unique: true })
    name: string;


    @Field(() => [User])
    @ManyToMany(() => User, user => user.groups)
    @JoinTable()
    members: User[];

    @Field(() => User)
    @ManyToOne(() => User,user=>user.groups ,{ eager: true })
    @JoinColumn()
    adminId: User;
}