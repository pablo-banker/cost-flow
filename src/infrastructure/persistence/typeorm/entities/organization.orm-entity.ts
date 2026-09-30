import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity({
    name: 'organizations',
})

export class OrganizationOrmEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column({
        type: 'varchar',
        length: 150,
        unique: true,
    })
    name!: string;

    @Column({
        name: 'created_at',
        type: 'timestamptz',
    })
    createdAt!: Date;

    @Column({
        name: 'updated_at',
        type: 'timestamptz',
    })
    updatedAt!: Date;
}