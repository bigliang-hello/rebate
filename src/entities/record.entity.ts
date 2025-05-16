import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('records')
export class Record {
    @PrimaryColumn()
    relation_id: string;

    @PrimaryColumn()
    pid: string;

    //是否使用
    @Column({default: false})
    is_use: boolean;

    @Column({nullable: true})
    create_date: string;
}