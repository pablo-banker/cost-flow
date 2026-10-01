import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from 'typeorm';

import {OrganizationOrmEntity} from '@infrastructure/persistence/typeorm/entities/organization.orm-entity';

@Entity({
    name: 'units',
})
@Index(
    'UQ_units_organization_id_name',
    [
        'organizationId',
        'name',
    ],
    {
        unique: true,
    },
)

@Index(
    'IDX_units_organization_id',
    [
        'organizationId',
    ],
)

export class UnitOrmEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column({
        name: 'organization_id',
        type: 'uuid',
    })
    organizationId!: string;

    @ManyToOne(
        () => OrganizationOrmEntity,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({
        name: 'organization_id',
    })
    organization?: OrganizationOrmEntity;

    @Column({
        type: 'varchar',
        length: 150,
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