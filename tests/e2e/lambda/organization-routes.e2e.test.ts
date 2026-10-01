import {randomUUID} from 'node:crypto';

import type {APIGatewayProxyEvent} from 'aws-lambda';

import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import {InMemoryOrganizationRepository} from '@infrastructure/persistence/memory/repositories/in-memory-organization-repository';

import {
    buildOrganizationModule,
    type OrganizationModule,
} from '@modules/organization.module';

import {createOrganizationHandler} from '@entrypoints/lambda/organization/create-organization';
import {deleteOrganizationHandler} from '@entrypoints/lambda/organization/delete-organization';
import {findAllOrganizationHandler} from '@entrypoints/lambda/organization/find-all-organization';
import {findByIdOrganizationHandler} from '@entrypoints/lambda/organization/find-by-id-organization';
import {findByNameOrganizationHandler} from '@entrypoints/lambda/organization/find-by-name-organization';
import {updateOrganizationHandler} from '@entrypoints/lambda/organization/update-organization';

describe('Organization Lambda handlers', () => {
    let organizationModule: OrganizationModule;

    beforeEach(() => {
        const organizationRepository = new InMemoryOrganizationRepository();

        organizationModule = buildOrganizationModule({
            organizationRepository,
        });
    });

    function getModule(): Promise<OrganizationModule> {
        return Promise.resolve(organizationModule);
    }

    function makeEvent(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
        return {
            body: null,
            headers: {},
            multiValueHeaders: {},
            httpMethod: 'GET',
            isBase64Encoded: false,
            path: '/',
            pathParameters: null,
            queryStringParameters: null,
            multiValueQueryStringParameters: null,
            stageVariables: null,
            requestContext: {} as APIGatewayProxyEvent['requestContext'],
            resource: '/',
            ...overrides,
        };
    }

    async function createOrganization(name: string) {
        const handler = createOrganizationHandler(getModule);

        const response = await handler(makeEvent({
            httpMethod: 'POST',
            path: '/organizations',
            body: JSON.stringify({name}),
        }));

        expect(response.statusCode).toBe(201);

        return JSON.parse(response.body).data;
    }

    describe('POST /organizations', () => {
        it('should create an organization', async () => {
            const handler = createOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations',
                body: JSON.stringify({
                    name: 'CostFlow',
                }),
            }));

            expect(response.statusCode).toBe(201);

            expect(JSON.parse(response.body)).toEqual({
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
            const handler = createOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations',
                body: JSON.stringify({
                    name: '   CostFlow   ',
                }),
            }));

            expect(response.statusCode).toBe(201);
            expect(JSON.parse(response.body).data.name).toBe('CostFlow');
        });

        it('should return 400 when request body is missing', async () => {
            const handler = createOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations',
                body: null,
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Request body is required',
                },
            });
        });

        it('should return 400 when request body is invalid json', async () => {
            const handler = createOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations',
                body: '{invalid-json',
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Request body must be valid JSON',
                },
            });
        });

        it('should return 400 when organization name is not a string', async () => {
            const handler = createOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations',
                body: JSON.stringify({
                    name: 123,
                }),
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Organization name must be a string',
                },
            });
        });

        it('should return 400 when organization name is empty', async () => {
            const handler = createOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations',
                body: JSON.stringify({
                    name: '',
                }),
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NAME_REQUIRED',
                    message: 'Organization name cannot be empty',
                },
            });
        });

        it('should return 400 when organization name contains only whitespace', async () => {
            const handler = createOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations',
                body: JSON.stringify({
                    name: '       ',
                }),
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NAME_REQUIRED',
                    message: 'Organization name cannot be empty',
                },
            });
        });

        it('should return 400 when organization name is too short', async () => {
            const handler = createOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations',
                body: JSON.stringify({
                    name: 'AB',
                }),
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NAME_TOO_SHORT',
                    message: 'Organization name must be longer than 2 characters',
                },
            });
        });

        it('should return 400 when organization name is longer than 150 characters', async () => {
            const handler = createOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations',
                body: JSON.stringify({
                    name: 'A'.repeat(151),
                }),
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NAME_TOO_LONG',
                    message: 'Organization name cannot be longer than 150 characters',
                },
            });
        });

        it('should return 409 when organization already exists', async () => {
            await createOrganization('CostFlow');

            const handler = createOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations',
                body: JSON.stringify({
                    name: 'CostFlow',
                }),
            }));

            expect(response.statusCode).toBe(409);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_ALREADY_EXISTS',
                    message: 'Organization already exists',
                },
            });
        });
    });

    describe('GET /organizations', () => {
        it('should return an empty array when there are no organizations', async () => {
            const handler = findAllOrganizationHandler(getModule);

            const response = await handler();

            expect(response.statusCode).toBe(200);

            expect(JSON.parse(response.body)).toEqual({
                success: true,
                data: [],
            });
        });

        it('should return all organizations', async () => {
            await createOrganization('Organization A');
            await createOrganization('Organization B');

            const handler = findAllOrganizationHandler(getModule);

            const response = await handler();

            expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);

            expect(body.success).toBe(true);
            expect(body.data).toHaveLength(2);

            expect(body.data.map((organization: {name: string}) => organization.name)).toEqual([
                'Organization A',
                'Organization B',
            ]);
        });
    });

    describe('GET /organizations/:id', () => {
        it('should find an organization by id', async () => {
            const created = await createOrganization('CostFlow');

            const handler = findByIdOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: `/organizations/${created.id}`,
                pathParameters: {
                    id: created.id,
                },
            }));

            expect(response.statusCode).toBe(200);

            expect(JSON.parse(response.body)).toEqual({
                success: true,
                data: {
                    id: created.id,
                    name: 'CostFlow',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            });
        });

        it('should return 400 when organization id is missing', async () => {
            const handler = findByIdOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: '/organizations',
                pathParameters: null,
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Organization id is required',
                },
            });
        });

        it('should return 404 when organization does not exist', async () => {
            const id = randomUUID();

            const handler = findByIdOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: `/organizations/${id}`,
                pathParameters: {
                    id,
                },
            }));

            expect(response.statusCode).toBe(404);

            expect(JSON.parse(response.body)).toEqual({
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
            const created = await createOrganization('CostFlow');

            const handler = findByNameOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: '/organizations/name/CostFlow',
                pathParameters: {
                    name: 'CostFlow',
                },
            }));

            expect(response.statusCode).toBe(200);

            expect(JSON.parse(response.body)).toEqual({
                success: true,
                data: {
                    id: created.id,
                    name: 'CostFlow',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            });
        });

        it('should decode encoded organization name', async () => {
            const created = await createOrganization('CostFlow Test');

            const handler = findByNameOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: '/organizations/name/CostFlow%20Test',
                pathParameters: {
                    name: 'CostFlow%20Test',
                },
            }));

            expect(response.statusCode).toBe(200);

            expect(JSON.parse(response.body)).toEqual({
                success: true,
                data: {
                    id: created.id,
                    name: 'CostFlow Test',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            });
        });

        it('should return 400 when organization name is missing', async () => {
            const handler = findByNameOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: '/organizations/name',
                pathParameters: null,
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Organization name is required',
                },
            });
        });

        it('should return 404 when organization does not exist', async () => {
            const handler = findByNameOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: '/organizations/name/Unknown',
                pathParameters: {
                    name: 'Unknown',
                },
            }));

            expect(response.statusCode).toBe(404);

            expect(JSON.parse(response.body)).toEqual({
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
            const created = await createOrganization('Old Name');

            const handler = updateOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'PUT',
                path: `/organizations/${created.id}`,
                pathParameters: {
                    id: created.id,
                },
                body: JSON.stringify({
                    name: 'New Name',
                }),
            }));

            expect(response.statusCode).toBe(200);

            expect(JSON.parse(response.body)).toEqual({
                success: true,
                data: {
                    id: created.id,
                    name: 'New Name',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            });

            const findHandler = findByIdOrganizationHandler(getModule);

            const findResponse = await findHandler(makeEvent({
                httpMethod: 'GET',
                path: `/organizations/${created.id}`,
                pathParameters: {
                    id: created.id,
                },
            }));

            expect(JSON.parse(findResponse.body).data.name).toBe('New Name');
        });

        it('should return 400 when organization id is missing', async () => {
            const handler = updateOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'PUT',
                path: '/organizations',
                body: JSON.stringify({
                    name: 'New Name',
                }),
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Organization id is required',
                },
            });
        });

        it('should return 400 when request body is missing', async () => {
            const created = await createOrganization('CostFlow');

            const handler = updateOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'PUT',
                path: `/organizations/${created.id}`,
                pathParameters: {
                    id: created.id,
                },
                body: null,
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Request body is required',
                },
            });
        });

        it('should return 400 when request body is invalid json', async () => {
            const created = await createOrganization('CostFlow');

            const handler = updateOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'PUT',
                path: `/organizations/${created.id}`,
                pathParameters: {
                    id: created.id,
                },
                body: '{invalid-json',
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Request body must be valid JSON',
                },
            });
        });

        it('should return 400 when organization name is not a string', async () => {
            const created = await createOrganization('CostFlow');

            const handler = updateOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'PUT',
                path: `/organizations/${created.id}`,
                pathParameters: {
                    id: created.id,
                },
                body: JSON.stringify({
                    name: 123,
                }),
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Organization name must be a string',
                },
            });
        });

        it('should return 404 when organization does not exist', async () => {
            const id = randomUUID();

            const handler = updateOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'PUT',
                path: `/organizations/${id}`,
                pathParameters: {
                    id,
                },
                body: JSON.stringify({
                    name: 'New Name',
                }),
            }));

            expect(response.statusCode).toBe(404);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NOT_FOUND',
                    message: 'Organization not found',
                },
            });
        });

        it('should return 400 when new name is invalid', async () => {
            const created = await createOrganization('CostFlow');

            const handler = updateOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'PUT',
                path: `/organizations/${created.id}`,
                pathParameters: {
                    id: created.id,
                },
                body: JSON.stringify({
                    name: '',
                }),
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NAME_REQUIRED',
                    message: 'Organization name cannot be empty',
                },
            });
        });

        it('should return 409 when another organization already uses the new name', async () => {
            await createOrganization('CostFlow');

            const second = await createOrganization('FinanceHub');

            const handler = updateOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'PUT',
                path: `/organizations/${second.id}`,
                pathParameters: {
                    id: second.id,
                },
                body: JSON.stringify({
                    name: 'CostFlow',
                }),
            }));

            expect(response.statusCode).toBe(409);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_ALREADY_EXISTS',
                    message: 'Organization already exists',
                },
            });
        });
    });

    describe('DELETE /organizations/:id', () => {
        it('should delete an organization', async () => {
            const created = await createOrganization('CostFlow');

            const handler = deleteOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'DELETE',
                path: `/organizations/${created.id}`,
                pathParameters: {
                    id: created.id,
                },
            }));

            expect(response.statusCode).toBe(204);
            expect(response.body).toBe('');

            const findHandler = findByIdOrganizationHandler(getModule);

            const findResponse = await findHandler(makeEvent({
                httpMethod: 'GET',
                path: `/organizations/${created.id}`,
                pathParameters: {
                    id: created.id,
                },
            }));

            expect(findResponse.statusCode).toBe(404);

            expect(JSON.parse(findResponse.body)).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NOT_FOUND',
                    message: 'Organization not found',
                },
            });
        });

        it('should return 400 when organization id is missing', async () => {
            const handler = deleteOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'DELETE',
                path: '/organizations',
                pathParameters: null,
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Organization id is required',
                },
            });
        });

        it('should return 404 when organization does not exist', async () => {
            const id = randomUUID();

            const handler = deleteOrganizationHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'DELETE',
                path: `/organizations/${id}`,
                pathParameters: {
                    id,
                },
            }));

            expect(response.statusCode).toBe(404);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'ORGANIZATION_NOT_FOUND',
                    message: 'Organization not found',
                },
            });
        });
    });
});