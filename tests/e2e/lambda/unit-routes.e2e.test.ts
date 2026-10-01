import type {APIGatewayProxyEvent} from 'aws-lambda';

import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';

import {Organization} from '@domain/organization/entities/organization';
import {OrganizationName} from '@domain/organization/value-objects/organization-name';

import {InMemoryOrganizationRepository} from '@infrastructure/persistence/memory/repositories/in-memory-organization-repository';
import {InMemoryUnitRepository} from '@infrastructure/persistence/memory/repositories/in-memory-unit-repository';

import {
    buildUnitModule,
    type UnitModule,
} from '@modules/unit.module';

import {createUnitHandler} from '@entrypoints/lambda/unit/create-unit';
import {deleteUnitHandler} from '@entrypoints/lambda/unit/delete-unit';
import {findAllUnitsHandler} from '@entrypoints/lambda/unit/find-all-units';
import {findByIdUnitHandler} from '@entrypoints/lambda/unit/find-by-id-unit';
import {findByNameUnitHandler} from '@entrypoints/lambda/unit/find-by-name-unit';
import {updateUnitHandler} from '@entrypoints/lambda/unit/update-unit';

describe('Unit Lambda handlers', () => {
    let organizationRepository: InMemoryOrganizationRepository;
    let unitRepository: InMemoryUnitRepository;
    let unitModule: UnitModule;

    beforeEach(async () => {
        organizationRepository = new InMemoryOrganizationRepository();
        unitRepository = new InMemoryUnitRepository();

        unitModule = buildUnitModule({
            organizationRepository,
            unitRepository,
        });

        await createOrganization(
            'org-123',
            'Organization A',
        );

        await createOrganization(
            'org-456',
            'Organization B',
        );
    });

    function getModule(): Promise<UnitModule> {
        return Promise.resolve(unitModule);
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

    async function createOrganization(id: string, name: string): Promise<void> {
        const now = new Date();

        const organization = new Organization(
            id,
            new OrganizationName(name),
            now,
            now,
        );

        await organizationRepository.create(organization);
    }

    async function createUnit(organizationId: string, name: string) {
        const handler = createUnitHandler(getModule);

        const response = await handler(makeEvent({
            httpMethod: 'POST',
            path: `/organizations/${organizationId}/units`,
            pathParameters: {
                organizationId,
            },
            body: JSON.stringify({
                name,
            }),
        }));

        expect(response.statusCode).toBe(201);

        return JSON.parse(response.body).data;
    }

    describe('POST /organizations/:organizationId/units', () => {
        it('should create a unit', async () => {
            const handler = createUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations/org-123/units',
                pathParameters: {
                    organizationId: 'org-123',
                },
                body: JSON.stringify({
                    name: 'Matriz',
                }),
            }));

            expect(response.statusCode).toBe(201);

            expect(JSON.parse(response.body)).toEqual({
                success: true,
                data: {
                    id: expect.any(String),
                    organizationId: 'org-123',
                    name: 'Matriz',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            });
        });

        it('should normalize unit name', async () => {
            const handler = createUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations/org-123/units',
                pathParameters: {
                    organizationId: 'org-123',
                },
                body: JSON.stringify({
                    name: '   Matriz   ',
                }),
            }));

            expect(response.statusCode).toBe(201);
            expect(JSON.parse(response.body).data.name).toBe('Matriz');
        });

        it('should return 404 when organization does not exist', async () => {
            const handler = createUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations/org-999/units',
                pathParameters: {
                    organizationId: 'org-999',
                },
                body: JSON.stringify({
                    name: 'Matriz',
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

        it('should return 400 when organization id is missing', async () => {
            const handler = createUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations/units',
                pathParameters: null,
                body: JSON.stringify({
                    name: 'Matriz',
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
            const handler = createUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations/org-123/units',
                pathParameters: {
                    organizationId: 'org-123',
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
            const handler = createUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations/org-123/units',
                pathParameters: {
                    organizationId: 'org-123',
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

        it('should return 400 when unit name is not a string', async () => {
            const handler = createUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations/org-123/units',
                pathParameters: {
                    organizationId: 'org-123',
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
                    message: 'Unit name must be a string',
                },
            });
        });

        it('should return 400 when unit name is empty', async () => {
            const handler = createUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations/org-123/units',
                pathParameters: {
                    organizationId: 'org-123',
                },
                body: JSON.stringify({
                    name: '',
                }),
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'UNIT_NAME_REQUIRED',
                    message: 'Unit name cannot be empty',
                },
            });
        });

        it('should return 400 when unit name is too short', async () => {
            const handler = createUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations/org-123/units',
                pathParameters: {
                    organizationId: 'org-123',
                },
                body: JSON.stringify({
                    name: 'AB',
                }),
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'UNIT_NAME_TOO_SHORT',
                    message: 'Unit name must be longer than 2 characters',
                },
            });
        });

        it('should return 400 when unit name is longer than 150 characters', async () => {
            const handler = createUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations/org-123/units',
                pathParameters: {
                    organizationId: 'org-123',
                },
                body: JSON.stringify({
                    name: 'A'.repeat(151),
                }),
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'UNIT_NAME_TOO_LONG',
                    message: 'Unit name cannot be longer than 150 characters',
                },
            });
        });

        it('should return 409 when unit already exists in the organization', async () => {
            await createUnit(
                'org-123',
                'Matriz',
            );

            const handler = createUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'POST',
                path: '/organizations/org-123/units',
                pathParameters: {
                    organizationId: 'org-123',
                },
                body: JSON.stringify({
                    name: 'Matriz',
                }),
            }));

            expect(response.statusCode).toBe(409);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'UNIT_ALREADY_EXISTS',
                    message: 'Unit already exists',
                },
            });
        });

        it('should allow same unit name in different organizations', async () => {
            const first = await createUnit(
                'org-123',
                'Matriz',
            );

            const second = await createUnit(
                'org-456',
                'Matriz',
            );

            expect(first.organizationId).toBe('org-123');
            expect(second.organizationId).toBe('org-456');
            expect(first.id).not.toBe(second.id);
        });
    });

    describe('GET /organizations/:organizationId/units', () => {
        it('should return an empty array when organization has no units', async () => {
            const handler = findAllUnitsHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: '/organizations/org-123/units',
                pathParameters: {
                    organizationId: 'org-123',
                },
            }));

            expect(response.statusCode).toBe(200);

            expect(JSON.parse(response.body)).toEqual({
                success: true,
                data: [],
            });
        });

        it('should return only units from the organization', async () => {
            await createUnit(
                'org-123',
                'Matriz',
            );

            await createUnit(
                'org-123',
                'Filial',
            );

            await createUnit(
                'org-456',
                'Outra Unidade',
            );

            const handler = findAllUnitsHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: '/organizations/org-123/units',
                pathParameters: {
                    organizationId: 'org-123',
                },
            }));

            expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);

            expect(body.success).toBe(true);
            expect(body.data).toHaveLength(2);

            expect(
                body.data.map(
                    (unit: {name: string}) => unit.name,
                ),
            ).toEqual([
                'Matriz',
                'Filial',
            ]);

            expect(
                body.data.every(
                    (unit: {organizationId: string}) =>
                        unit.organizationId === 'org-123',
                ),
            ).toBe(true);
        });

        it('should return 400 when organization id is missing', async () => {
            const handler = findAllUnitsHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: '/organizations/units',
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
    });

    describe('GET /organizations/:organizationId/units/:id', () => {
        it('should find a unit by id', async () => {
            const created = await createUnit(
                'org-123',
                'Matriz',
            );

            const handler = findByIdUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: `/organizations/org-123/units/${created.id}`,
                pathParameters: {
                    organizationId: 'org-123',
                    id: created.id,
                },
            }));

            expect(response.statusCode).toBe(200);

            expect(JSON.parse(response.body)).toEqual({
                success: true,
                data: {
                    id: created.id,
                    organizationId: 'org-123',
                    name: 'Matriz',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            });
        });

        it('should return 400 when unit id is missing', async () => {
            const handler = findByIdUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: '/organizations/org-123/units',
                pathParameters: {
                    organizationId: 'org-123',
                },
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Unit id is required',
                },
            });
        });

        it('should return 404 when unit does not exist', async () => {
            const handler = findByIdUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: '/organizations/org-123/units/unit-123',
                pathParameters: {
                    organizationId: 'org-123',
                    id: 'unit-123',
                },
            }));

            expect(response.statusCode).toBe(404);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'UNIT_NOT_FOUND',
                    message: 'Unit not found',
                },
            });
        });

        it('should not find a unit from another organization', async () => {
            const created = await createUnit(
                'org-123',
                'Matriz',
            );

            const handler = findByIdUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: `/organizations/org-456/units/${created.id}`,
                pathParameters: {
                    organizationId: 'org-456',
                    id: created.id,
                },
            }));

            expect(response.statusCode).toBe(404);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'UNIT_NOT_FOUND',
                    message: 'Unit not found',
                },
            });
        });
    });

    describe('GET /organizations/:organizationId/units/name/:name', () => {
        it('should find a unit by name', async () => {
            const created = await createUnit(
                'org-123',
                'Matriz',
            );

            const handler = findByNameUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: '/organizations/org-123/units/name/Matriz',
                pathParameters: {
                    organizationId: 'org-123',
                    name: 'Matriz',
                },
            }));

            expect(response.statusCode).toBe(200);

            expect(JSON.parse(response.body)).toEqual({
                success: true,
                data: {
                    id: created.id,
                    organizationId: 'org-123',
                    name: 'Matriz',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            });
        });

        it('should decode encoded unit name', async () => {
            const created = await createUnit(
                'org-123',
                'Matriz Florianópolis',
            );

            const handler = findByNameUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: '/organizations/org-123/units/name/Matriz%20Florian%C3%B3polis',
                pathParameters: {
                    organizationId: 'org-123',
                    name: 'Matriz%20Florian%C3%B3polis',
                },
            }));

            expect(response.statusCode).toBe(200);

            expect(JSON.parse(response.body).data).toEqual({
                id: created.id,
                organizationId: 'org-123',
                name: 'Matriz Florianópolis',
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });
        });

        it('should return 400 when unit name is missing', async () => {
            const handler = findByNameUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: '/organizations/org-123/units/name',
                pathParameters: {
                    organizationId: 'org-123',
                },
            }));

            expect(response.statusCode).toBe(400);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Unit name is required',
                },
            });
        });

        it('should not find a unit with same name from another organization', async () => {
            await createUnit(
                'org-123',
                'Matriz',
            );

            const handler = findByNameUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'GET',
                path: '/organizations/org-456/units/name/Matriz',
                pathParameters: {
                    organizationId: 'org-456',
                    name: 'Matriz',
                },
            }));

            expect(response.statusCode).toBe(404);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'UNIT_NOT_FOUND',
                    message: 'Unit not found',
                },
            });
        });
    });

    describe('PUT /organizations/:organizationId/units/:id', () => {
        it('should update a unit', async () => {
            const created = await createUnit(
                'org-123',
                'Old Name',
            );

            const handler = updateUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'PUT',
                path: `/organizations/org-123/units/${created.id}`,
                pathParameters: {
                    organizationId: 'org-123',
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
                    organizationId: 'org-123',
                    name: 'New Name',
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            });

            const findHandler = findByIdUnitHandler(getModule);

            const findResponse = await findHandler(makeEvent({
                httpMethod: 'GET',
                path: `/organizations/org-123/units/${created.id}`,
                pathParameters: {
                    organizationId: 'org-123',
                    id: created.id,
                },
            }));

            expect(JSON.parse(findResponse.body).data.name).toBe('New Name');
        });

        it('should return 400 when request body is missing', async () => {
            const created = await createUnit(
                'org-123',
                'Matriz',
            );

            const handler = updateUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'PUT',
                path: `/organizations/org-123/units/${created.id}`,
                pathParameters: {
                    organizationId: 'org-123',
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
            const created = await createUnit(
                'org-123',
                'Matriz',
            );

            const handler = updateUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'PUT',
                path: `/organizations/org-123/units/${created.id}`,
                pathParameters: {
                    organizationId: 'org-123',
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

        it('should return 404 when unit belongs to another organization', async () => {
            const created = await createUnit(
                'org-123',
                'Matriz',
            );

            const handler = updateUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'PUT',
                path: `/organizations/org-456/units/${created.id}`,
                pathParameters: {
                    organizationId: 'org-456',
                    id: created.id,
                },
                body: JSON.stringify({
                    name: 'New Name',
                }),
            }));

            expect(response.statusCode).toBe(404);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'UNIT_NOT_FOUND',
                    message: 'Unit not found',
                },
            });
        });

        it('should return 409 when another unit already uses the new name', async () => {
            await createUnit(
                'org-123',
                'Matriz',
            );

            const second = await createUnit(
                'org-123',
                'Filial',
            );

            const handler = updateUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'PUT',
                path: `/organizations/org-123/units/${second.id}`,
                pathParameters: {
                    organizationId: 'org-123',
                    id: second.id,
                },
                body: JSON.stringify({
                    name: 'Matriz',
                }),
            }));

            expect(response.statusCode).toBe(409);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'UNIT_ALREADY_EXISTS',
                    message: 'Unit already exists',
                },
            });
        });
    });

    describe('DELETE /organizations/:organizationId/units/:id', () => {
        it('should delete a unit', async () => {
            const created = await createUnit(
                'org-123',
                'Matriz',
            );

            const handler = deleteUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'DELETE',
                path: `/organizations/org-123/units/${created.id}`,
                pathParameters: {
                    organizationId: 'org-123',
                    id: created.id,
                },
            }));

            expect(response.statusCode).toBe(204);
            expect(response.body).toBe('');

            const findHandler = findByIdUnitHandler(getModule);

            const findResponse = await findHandler(makeEvent({
                httpMethod: 'GET',
                path: `/organizations/org-123/units/${created.id}`,
                pathParameters: {
                    organizationId: 'org-123',
                    id: created.id,
                },
            }));

            expect(findResponse.statusCode).toBe(404);
        });

        it('should not delete a unit from another organization', async () => {
            const created = await createUnit(
                'org-123',
                'Matriz',
            );

            const handler = deleteUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'DELETE',
                path: `/organizations/org-456/units/${created.id}`,
                pathParameters: {
                    organizationId: 'org-456',
                    id: created.id,
                },
            }));

            expect(response.statusCode).toBe(404);

            const findHandler = findByIdUnitHandler(getModule);

            const findResponse = await findHandler(makeEvent({
                httpMethod: 'GET',
                path: `/organizations/org-123/units/${created.id}`,
                pathParameters: {
                    organizationId: 'org-123',
                    id: created.id,
                },
            }));

            expect(findResponse.statusCode).toBe(200);
        });

        it('should return 404 when unit does not exist', async () => {
            const handler = deleteUnitHandler(getModule);

            const response = await handler(makeEvent({
                httpMethod: 'DELETE',
                path: '/organizations/org-123/units/unit-123',
                pathParameters: {
                    organizationId: 'org-123',
                    id: 'unit-123',
                },
            }));

            expect(response.statusCode).toBe(404);

            expect(JSON.parse(response.body)).toEqual({
                success: false,
                error: {
                    code: 'UNIT_NOT_FOUND',
                    message: 'Unit not found',
                },
            });
        });
    });
});