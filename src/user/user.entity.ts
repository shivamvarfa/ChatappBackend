import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Message } from 'src/message/message.entity';
import { Group } from 'src/group/group.entity';


@ObjectType()
@Entity()
export class User {
  @Field(()=>ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  username: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
  
  @Field(() => [Message])
  @OneToMany(() => Message, message => message.sender)
  sentMessages: Message[];

  @Field(() => [Message])
  @OneToMany(() => Message, message => message.receiver)
  receivedMessages: Message[];

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  logOutTimer: Date;

  @Field()
  @Column({ type: 'boolean',default:()=>false})
  isLogin: boolean;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  profileImage?: string;

  @Field(() => [Group])
  @ManyToMany(() => Group, group => group.members)
  groups: Group[];  


  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastMessageTimestamp: Date;

  @Field()
  @Column({ type: 'boolean',default:()=>false})
  isTyping: boolean;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 10, nullable: true }) // Adjust length as necessary
  phoneNumber?: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  blockedUsers: string[]; 
}
