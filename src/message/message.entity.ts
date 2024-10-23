import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { User } from 'src/user/user.entity';


@ObjectType()
@Entity()
export class Message {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 10000 }) // Increase the length to 1000 characters
  content: string;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field(() => User)
  @ManyToOne(() => User, user => user.sentMessages)
  sender: User;

  @Field(() => User)
  @ManyToOne(() => User, user => user.receivedMessages)
  receiver: User;

  @Field()
  @Column({ default: false })
  read: boolean;


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
