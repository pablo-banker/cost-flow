import {UnitOrmEntity} from '@infrastructure/persistence/typeorm/entities/unit.orm-entity';
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
    name: 'cost_centers',
})
@Index(
    'UQ_cost_centers_organization_id_unit_id_name',
    [
        'organizationId',
        'unitId',
        'name',
    ],
    {
        unique: true,
    },
)

@Index(
    'IDX_cost_centers_organization_id',
    [
        'organizationId',
    ],
)

@Index('UQ_cost_centers_organization_id_unit_id_code', ['organizationId', 'unitId', 'code'], {unique: true})
@Index('IDX_cost_centers_unit_id', ['unitId'])
@Index('IDX_cost_centers_organization_id_unit_id', ['organizationId', 'unitId'])
export class CostCenterOrmEntity {
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

    @Column({name: 'unit_id', type: 'uuid'})
    unitId!: string;

    @ManyToOne(() => UnitOrmEntity, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'unit_id'})
    unit?: UnitOrmEntity;

    @Column({type: 'varchar', length: 50})
    code!: string;

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
