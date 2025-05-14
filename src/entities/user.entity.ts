import { Entity, PrimaryGeneratedColumn, Column, Decimal128 } from "typeorm";

@Entity('user')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    openid: string;

    @Column()
    nickname: string;

    @Column({ nullable: true  })
    ali_phone: string;

    @Column({ nullable: true  })
    ali_name: string;

    @Column({ nullable: true  })
    relation_id: string;

    @Column('decimal', { nullable: true, default: 0.00 })
    amount: number;
}