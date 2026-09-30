import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import { buildAppModule } from '@modules/app.module';

describe('Organization routes', () => {
    let app: ReturnType<typeof buildAppModule>;

    beforeEach(() => {
        app = buildAppModule({
            persistence: {
                driver: 'memory',
            },
        });
    });

    afterEach(async () => {
        await app.server.close();
    });

    async function createOrganization(
        name: string,
    ) {
        const response = await app.server.inject({
            method: 'POST',
            url: '/organizations',
            payload: {
                name,
            },
        });

        expect(response.statusCode).toBe(201);

        return response.json().data;
    }

    describe('POST /organizations', () => {
        it('should create an organization', async () => {
            const response = await app.server.inject({
                method: 'POST',
                url: '/organizations',
                payload: {
                    name: 'CostFlow',
                },
            });

            expect(response.statusCode).toBe(201);

            expect(response.json()).toEqual({
                success: true,
                data: {
                    id: expect.any(String),
                    name: 'CostFlow',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            });
        });

        it('should normalize organization name', async () => {
            const response = await app.server.inject({
                method: 'POST',
                url: '/organizations',
                payload: {
                    name: '   CostFlow   ',
                },
            });

            expect(response.statusCode).toBe(201);

            expect(response.json().data.name)
                .toBe('CostFlow');
        });

        it('should return 400 when organization name is empty', async () => {
            const response = await app.server.inject({
                method: 'POST',
                url: '/organizations',
                payload: {
                    name: '',
                },
            });

            expect(response.statusCode).toBe(400);

            expect(response.json()).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NAME_REQUIRED',
                    message:
                        'Organization name cannot be empty',
                },
            });
        });

        it('should return 400 when organization name contains only whitespace', async () => {
            const response = await app.server.inject({
                method: 'POST',
                url: '/organizations',
                payload: {
                    name: '       ',
                },
            });

            expect(response.statusCode).toBe(400);

            expect(response.json()).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NAME_REQUIRED',
                    message:
                        'Organization name cannot be empty',
                },
            });
        });

        it('should return 400 when organization name is longer than 150 characters', async () => {
            const response = await app.server.inject({
                method: 'POST',
                url: '/organizations',
                payload: {
                    name: 'A'.repeat(151),
                },
            });

            expect(response.statusCode).toBe(400);

            expect(response.json()).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NAME_TOO_LONG',
                    message:
                        'Organization name cannot be longer than 150 characters',
                },
            });
        });

        it('should return 409 when organization already exists', async () => {
            await createOrganization('CostFlow');

            const response = await app.server.inject({
                method: 'POST',
                url: '/organizations',
                payload: {
                    name: 'CostFlow',
                },
            });

            expect(response.statusCode).toBe(409);

            expect(response.json()).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_ALREADY_EXISTS',
                    message:
                        'Organization already exists',
                },
            });
        });
    });

    describe('GET /organizations', () => {
        it('should return an empty array when there are no organizations', async () => {
            const response = await app.server.inject({
                method: 'GET',
                url: '/organizations',
            });

            expect(response.statusCode).toBe(200);

            expect(response.json()).toEqual({
                success: true,
                data: [],
            });
        });

        it('should return all organizations', async () => {
            await createOrganization('Organization A');
            await createOrganization('Organization B');

            const response = await app.server.inject({
                method: 'GET',
                url: '/organizations',
            });

            expect(response.statusCode).toBe(200);

            const body = response.json();

            expect(body.success).toBe(true);
            expect(body.data).toHaveLength(2);

            expect(
                body.data.map(
                    (organization: { name: string }) =>
                        organization.name,
                ),
            ).toEqual([
                'Organization A',
                'Organization B',
            ]);
        });
    });

    describe('GET /organizations/:id', () => {
        it('should find an organization by id', async () => {
            const created =
                await createOrganization('CostFlow');

            const response = await app.server.inject({
                method: 'GET',
                url: `/organizations/${created.id}`,
            });

            expect(response.statusCode).toBe(200);

            expect(response.json()).toEqual({
                success: true,
                data: {
                    id: created.id,
                    name: 'CostFlow',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            });
        });

        it('should return 404 when organization does not exist', async () => {
            const response = await app.server.inject({
                method: 'GET',
                url: '/organizations/non-existing-id',
            });

            expect(response.statusCode).toBe(404);

            expect(response.json()).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NOT_FOUND',
                    message: 'Organization not found',
                },
            });
        });
    });

    describe('GET /organizations/name/:name', () => {
        it('should find an organization by name', async () => {
            const created =
                await createOrganization('CostFlow');

            const response = await app.server.inject({
                method: 'GET',
                url: '/organizations/name/CostFlow',
            });

            expect(response.statusCode).toBe(200);

            expect(response.json()).toEqual({
                success: true,
                data: {
                    id: created.id,
                    name: 'CostFlow',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            });
        });

        it('should return 404 when organization does not exist', async () => {
            const response = await app.server.inject({
                method: 'GET',
                url: '/organizations/name/Unknown',
            });

            expect(response.statusCode).toBe(404);

            expect(response.json()).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NOT_FOUND',
                    message: 'Organization not found',
                },
            });
        });
    });

    describe('PUT /organizations/:id', () => {
        it('should update an organization', async () => {
            const created =
                await createOrganization('Old Name');

            const response = await app.server.inject({
                method: 'PUT',
                url: `/organizations/${created.id}`,
                payload: {
                    name: 'New Name',
                },
            });

            expect(response.statusCode).toBe(201);

            expect(response.json()).toEqual({
                success: true,
                data: {
                    id: created.id,
                    name: 'New Name',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            });

            const findResponse =
                await app.server.inject({
                    method: 'GET',
                    url: `/organizations/${created.id}`,
                });

            expect(
                findResponse.json().data.name,
            ).toBe('New Name');
        });

        it('should return 404 when organization does not exist', async () => {
            const response = await app.server.inject({
                method: 'PUT',
                url: '/organizations/non-existing-id',
                payload: {
                    name: 'New Name',
                },
            });

            expect(response.statusCode).toBe(404);

            expect(response.json()).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NOT_FOUND',
                    message: 'Organization not found',
                },
            });
        });

        it('should return 400 when new name is invalid', async () => {
            const created =
                await createOrganization('CostFlow');

            const response = await app.server.inject({
                method: 'PUT',
                url: `/organizations/${created.id}`,
                payload: {
                    name: '',
                },
            });

            expect(response.statusCode).toBe(400);

            expect(response.json()).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NAME_REQUIRED',
                    message:
                        'Organization name cannot be empty',
                },
            });
        });

        it('should return 409 when another organization already uses the new name', async () => {
            await createOrganization('CostFlow');

            const second =
                await createOrganization('FinanceHub');

            const response = await app.server.inject({
                method: 'PUT',
                url: `/organizations/${second.id}`,
                payload: {
                    name: 'CostFlow',
                },
            });

            expect(response.statusCode).toBe(409);

            expect(response.json()).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_ALREADY_EXISTS',
                    message:
                        'Organization already exists',
                },
            });
        });
    });

    describe('DELETE /organizations/:id', () => {
        it('should delete an organization', async () => {
            const created =
                await createOrganization('CostFlow');

            const response = await app.server.inject({
                method: 'DELETE',
                url: `/organizations/${created.id}`,
            });

            expect(response.statusCode).toBe(204);

            const findResponse =
                await app.server.inject({
                    method: 'GET',
                    url: `/organizations/${created.id}`,
                });

            expect(findResponse.statusCode).toBe(404);

            expect(findResponse.json()).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NOT_FOUND',
                    message: 'Organization not found',
                },
            });
        });

        it('should return 404 when organization does not exist', async () => {
            const response = await app.server.inject({
                method: 'DELETE',
                url: '/organizations/non-existing-id',
            });

            expect(response.statusCode).toBe(404);

            expect(response.json()).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NOT_FOUND',
                    message: 'Organization not found',
                },
            });
        });
    });
});