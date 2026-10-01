import { randomUUID } from 'node:crypto';

import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it} from 'vitest';

import type { QueryRunner, DataSource } from 'typeorm';

import {PersistenceConflictError, PersistenceNotFoundError} from '@application/ports/repositories/persistence-errors';

import { Organization } from '@domain/organization/entities/organization';
import { OrganizationName } from '@domain/organization/value-objects/organization-name';

import {  getAppDataSource } from '@infrastructure/persistence/typeorm/data-source';
import { OrganizationOrmEntity } from '@infrastructure/persistence/typeorm/entities/organization.orm-entity';
import { TypeOrmOrganizationRepository } from '@infrastructure/persistence/typeorm/repositories/typeorm-organization-repository';

describe('TypeOrmOrganizationRepository', () => {
    let appDataSource: DataSource;
    let queryRunner: QueryRunner;
    let repository: TypeOrmOrganizationRepository;

    beforeAll(async () => {
        appDataSource = await getAppDataSource();
    });

    beforeEach(async () => {
        queryRunner = appDataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        await queryRunner.query(`
            TRUNCATE TABLE "units", "organizations"
            RESTART IDENTITY
            CASCADE
        `);

        const typeOrmRepository = queryRunner.manager.getRepository(OrganizationOrmEntity,);
        repository = new TypeOrmOrganizationRepository(typeOrmRepository);
    });

    afterEach(async () => {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
    });

    afterAll(async () => {
        await appDataSource.destroy();
    });

    function makeOrganization(
        name: string,
    ): Organization {
        const now = new Date();

        return new Organization(
            randomUUID(),
            new OrganizationName(name),
            now,
            now,
        );
    }

    it('should create and find an organization by id', async () => {
        const organization =
            makeOrganization('CostFlow');

        await repository.create(organization);

        const found =
            await repository.findById(
                organization.organizationId,
            );

        expect(found.organizationId)
            .toBe(organization.organizationId);

        expect(found.organizationName.name)
            .toBe('CostFlow');
    });

    it('should find all organizations', async () => {
        await repository.create(
            makeOrganization('Organization A'),
        );

        await repository.create(
            makeOrganization('Organization B'),
        );

        const organizations =
            await repository.findAll();

        expect(organizations).toHaveLength(2);

        expect(
            organizations.map(
                organization =>
                    organization.organizationName.name,
            ),
        ).toEqual([
            'Organization A',
            'Organization B',
        ]);
    });

    it('should find an organization by name', async () => {
        const organization =
            makeOrganization('CostFlow');

        await repository.create(organization);

        const found =
            await repository.findByName('CostFlow');

        expect(found.organizationId)
            .toBe(organization.organizationId);
    });

    it('should update an organization', async () => {
        const organization =
            makeOrganization('Old Name');

        await repository.create(organization);

        organization.rename('New Name');

        await repository.update(organization);

        const updated =
            await repository.findById(
                organization.organizationId,
            );

        expect(updated.organizationName.name)
            .toBe('New Name');
    });

    it('should delete an organization', async () => {
        const organization =
            makeOrganization('CostFlow');

        await repository.create(organization);

        await repository.delete(
            organization.organizationId,
        );

        await expect(
            repository.findById(
                organization.organizationId,
            ),
        ).rejects.toBeInstanceOf(
            PersistenceNotFoundError,
        );
    });

    it('should fail when organization does not exist', async () => {
        await expect(
            repository.findById(randomUUID()),
        ).rejects.toBeInstanceOf(
            PersistenceNotFoundError,
        );
    });

    it('should fail when organization name already exists', async () => {
        await repository.create(
            makeOrganization('CostFlow'),
        );

        await expect(
            repository.create(
                makeOrganization('CostFlow'),
            ),
        ).rejects.toBeInstanceOf(
            PersistenceConflictError,
        );
    });
});