import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Group } from './group.entity';
import { User } from '../user/user.entity';

@ObjectType()
@Entity()
export class GroupMessage {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  content: string;

  @Field(() => User)
  @ManyToOne(() => User)
  sender: User;

  @Field(() => Group)
  @ManyToOne(() => Group)
  group: Group;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  imageData?: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  deletedUser?: string[];

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  deleteUserForEveryone?: string[];
}
