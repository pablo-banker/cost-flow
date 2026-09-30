import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import { CreateOrganization } from '@application/organization/use-cases/create-organization';
import { FindAllOrganization } from '@application/organization/use-cases/find-all-organization';

import {
    InMemoryOrganizationRepository,
} from '@infrastructure/persistence/memory/repositories/in-memory-organization-repository';

describe('FindAllOrganization', () => {
    let repository: InMemoryOrganizationRepository;
    let createOrganization: CreateOrganization;
    let findAllOrganization: FindAllOrganization;

    beforeEach(() => {
        repository = new InMemoryOrganizationRepository();

        createOrganization =
            new CreateOrganization(repository);

        findAllOrganization =
            new FindAllOrganization(repository);
    });

    it('should return an empty array when there are no organizations', async () => {
        const organizations =
            await findAllOrganization.execute();

        expect(organizations).toEqual([]);
    });

    it('should return all organizations', async () => {
        await createOrganization.execute({
            name: 'Organization A',
        });

        await createOrganization.execute({
            name: 'Organization B',
        });

        const organizations =
            await findAllOrganization.execute();

        expect(organizations).toHaveLength(2);

        expect(
            organizations.map(
                organization => organization.name,
            ),
        ).toEqual([
            'Organization A',
            'Organization B',
        ]);
    });
});