import {readFileSync} from 'node:fs';
import type {APIGatewayProxyEvent} from 'aws-lambda';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Organization} from '@domain/organization/entities/organization';
import {OrganizationName} from '@domain/organization/value-objects/organization-name';
import {Unit} from '@domain/organization/entities/unit';
import {UnitName} from '@domain/organization/value-objects/unit-name';
import {buildPersistenceModule} from '@modules/persistence.module';
import {buildCostCenterModule, type CostCenterModule} from '@modules/cost-center.module';
import {createCostCenterHandler} from '@entrypoints/lambda/cost-center/create-cost-center';
import {findAllCostCentersHandler} from '@entrypoints/lambda/cost-center/find-all-cost-centers';
import {findByIdCostCenterHandler} from '@entrypoints/lambda/cost-center/find-by-id-cost-center';
import {findByCodeCostCenterHandler} from '@entrypoints/lambda/cost-center/find-by-code-cost-center';
import {findByNameCostCenterHandler} from '@entrypoints/lambda/cost-center/find-by-name-cost-center';
import {updateCostCenterHandler} from '@entrypoints/lambda/cost-center/update-cost-center';
import {deleteCostCenterHandler} from '@entrypoints/lambda/cost-center/delete-cost-center';

const scope = {organizationId: 'org-a', unitId: 'unit-a'};
const input = {code: 'CC-001', name: 'Tecnologia'};
const factories = {
    create: createCostCenterHandler,
    list: findAllCostCentersHandler,
    id: findByIdCostCenterHandler,
    code: findByCodeCostCenterHandler,
    name: findByNameCostCenterHandler,
    update: updateCostCenterHandler,
    delete: deleteCostCenterHandler,
};

describe('CostCenter Lambda handlers', () => {
    let module: CostCenterModule;
    const getModule = () => Promise.resolve(module);
    const event = (pathParameters: APIGatewayProxyEvent['pathParameters'] = scope, body: string | null = null): APIGatewayProxyEvent => ({
        body, pathParameters, headers: {}, multiValueHeaders: {}, httpMethod: 'GET',
        isBase64Encoded: false, path: '/', queryStringParameters: null,
        multiValueQueryStringParameters: null, stageVariables: null,
        requestContext: {} as APIGatewayProxyEvent['requestContext'], resource: '/',
    });
    const create = (parent = scope, data = input) => createCostCenterHandler(getModule)(event(parent, JSON.stringify(data)));

    beforeEach(async () => {
        const persistence = buildPersistenceModule({driver: 'memory'});
        module = buildCostCenterModule(persistence);
        const now = new Date();
        for (const id of ['org-a', 'org-b']) {
            await persistence.organizationRepository.create(new Organization(id, new OrganizationName(id), now, now));
        }
        for (const [id, organizationId] of [['unit-a', 'org-a'], ['unit-b', 'org-a'], ['unit-c', 'org-b']]) {
            await persistence.unitRepository.create(new Unit(id!, organizationId!, new UnitName(id!), now, now));
        }
    });

    it('runs create/list/find by id/code/name/update/delete', async () => {
        const response = await create(scope, {code: ' CC-001 ', name: ' Tecnologia '});
        expect(response.statusCode).toBe(201);
        const data = JSON.parse(response.body).data;
        expect(data).toEqual({
            id: expect.any(String), ...scope, ...input,
            createdAt: expect.any(String), updatedAt: expect.any(String),
        });
        const list = await findAllCostCentersHandler(getModule)(event());
        expect(list.statusCode).toBe(200);
        expect(JSON.parse(list.body).data).toEqual([data]);
        for (const [factory, parameter] of [
            [findByIdCostCenterHandler, {id: data.id}],
            [findByCodeCostCenterHandler, {code: encodeURIComponent(' CC-001 ')}],
            [findByNameCostCenterHandler, {name: encodeURIComponent(' Tecnologia ')}],
        ] as const) {
            const found = await factory(getModule)(event({...scope, ...parameter}));
            expect(found.statusCode).toBe(200);
            expect(JSON.parse(found.body).data).toEqual(data);
        }
        const updated = await updateCostCenterHandler(getModule)(event({...scope, id: data.id}, JSON.stringify({name: ' Financeiro ', code: 'IGNORED', unitId: 'unit-b', organizationId: 'org-b'})));
        expect(updated.statusCode).toBe(200);
        expect(JSON.parse(updated.body).data).toMatchObject({...scope, code: input.code, name: 'Financeiro'});
        const deleted = await deleteCostCenterHandler(getModule)(event({...scope, id: data.id}));
        expect(deleted).toEqual({statusCode: 204, body: ''});
        expect((await findByIdCostCenterHandler(getModule)(event({...scope, id: data.id}))).statusCode).toBe(404);
    });

    it.each(Object.entries(factories))('%s requires both parent path parameters', async (_, factory) => {
        for (const parent of [null, {unitId: scope.unitId}, {organizationId: scope.organizationId}]) {
            expect((await factory(getModule)(event(parent))).statusCode).toBe(400);
        }
    });

    it.each([['id', findByIdCostCenterHandler], ['code', findByCodeCostCenterHandler], ['name', findByNameCostCenterHandler], ['update', updateCostCenterHandler], ['delete', deleteCostCenterHandler]] as const)('%s requires resource path parameter', async (_, factory) => {
        expect((await factory(getModule)(event())).statusCode).toBe(400);
    });

    it.each([null, '{', 'null', '[]', '42', '"name"', '{}', '{"name":42}', '{"name":"Tecnologia","code":42}'])('rejects invalid create body %j', async body => {
        expect((await createCostCenterHandler(getModule)(event(scope, body))).statusCode).toBe(400);
    });

    it.each([null, '{', 'null', '[]', '{}', '{"name":42}'])('rejects invalid update body %j', async body => {
        expect((await updateCostCenterHandler(getModule)(event({...scope, id: 'missing'}, body))).statusCode).toBe(400);
    });

    it.each([
        [{code: '', name: input.name}, 'COST_CENTER_CODE_REQUIRED'],
        [{code: '   ', name: input.name}, 'COST_CENTER_CODE_REQUIRED'],
        [{code: 'A'.repeat(51), name: input.name}, 'COST_CENTER_CODE_TOO_LONG'],
        [{code: input.code, name: ''}, 'COST_CENTER_NAME_REQUIRED'],
        [{code: input.code, name: 'AB'}, 'COST_CENTER_NAME_TOO_SHORT'],
        [{code: input.code, name: 'A'.repeat(151)}, 'COST_CENTER_NAME_TOO_LONG'],
    ] as const)('maps domain validation %j to HTTP 400', async (data, code) => {
        const response = await create(scope, data);
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.code).toBe(code);
    });

    it.each([
        [{organizationId: 'missing', unitId: 'unit-a'}, 'ORGANIZATION_NOT_FOUND'],
        [{...scope, unitId: 'missing'}, 'UNIT_NOT_FOUND'],
        [{...scope, unitId: 'unit-c'}, 'UNIT_NOT_FOUND'],
    ] as const)('maps missing or foreign parents %j to HTTP 404', async (parent, code) => {
        const response = await create(parent);
        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.body).error.code).toBe(code);
    });

    it.each([{code: ' CC-001 ', name: 'Financeiro'}, {code: 'CC-002', name: ' Tecnologia '}])('returns 409 for duplicate %j', async data => {
        await create();
        const response = await create(scope, data);
        expect(response.statusCode).toBe(409);
        expect(JSON.parse(response.body).error.code).toBe('COST_CENTER_ALREADY_EXISTS');
    });

    it('allows the same name and code in different units', async () => {
        expect((await create()).statusCode).toBe(201);
        expect((await create({...scope, unitId: 'unit-b'})).statusCode).toBe(201);
    });

    it('returns 409 for conflicting update and leaves persisted name intact', async () => {
        await create();
        const second = JSON.parse((await create(scope, {code: 'CC-002', name: 'Financeiro'})).body).data;
        expect((await updateCostCenterHandler(getModule)(event({...scope, id: second.id}, JSON.stringify({name: input.name})))).statusCode).toBe(409);
        expect(JSON.parse((await findByIdCostCenterHandler(getModule)(event({...scope, id: second.id}))).body).data.name).toBe('Financeiro');
    });

    it.each([{organizationId: 'org-b', unitId: 'unit-a'}, {...scope, unitId: 'unit-b'}])('isolates every operation by parents %j', async parent => {
        const {id} = JSON.parse((await create()).body).data;
        const list = await findAllCostCentersHandler(getModule)(event(parent));
        expect(JSON.parse(list.body).data).toEqual([]);
        for (const response of await Promise.all([
            findByIdCostCenterHandler(getModule)(event({...parent, id})),
            findByCodeCostCenterHandler(getModule)(event({...parent, code: input.code})),
            findByNameCostCenterHandler(getModule)(event({...parent, name: input.name})),
            updateCostCenterHandler(getModule)(event({...parent, id}, JSON.stringify({name: 'Financeiro'}))),
            deleteCostCenterHandler(getModule)(event({...parent, id})),
        ])) {
            expect(response.statusCode).toBe(404);
            expect(JSON.parse(response.body).error.code).toBe('COST_CENTER_NOT_FOUND');
        }
        expect((await findByIdCostCenterHandler(getModule)(event({...scope, id}))).statusCode).toBe(200);
    });

    it('returns 404 for unknown resources', async () => {
        for (const response of await Promise.all([
            findByIdCostCenterHandler(getModule)(event({...scope, id: 'missing'})),
            findByCodeCostCenterHandler(getModule)(event({...scope, code: 'missing'})),
            findByNameCostCenterHandler(getModule)(event({...scope, name: 'missing'})),
            updateCostCenterHandler(getModule)(event({...scope, id: 'missing'}, JSON.stringify({name: 'Financeiro'}))),
            deleteCostCenterHandler(getModule)(event({...scope, id: 'missing'})),
        ])) {
            expect(response.statusCode).toBe(404);
        }
    });

    it.each([['name', findByNameCostCenterHandler], ['code', findByCodeCostCenterHandler]] as const)('rejects malformed %s URL encoding', async (key, factory) => {
        expect((await factory(getModule)(event({...scope, [key]: '%ZZ'}))).statusCode).toBe(400);
    });

    it('maps unexpected errors to HTTP 500 without leaking details', async () => {
        vi.spyOn(module.findAllCostCenters, 'execute').mockRejectedValue(new Error('private database details'));
        const response = await findAllCostCentersHandler(getModule)(event());
        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body).error).toEqual({code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error'});
    });

    it('registers all seven nested routes in Serverless', () => {
        const config = readFileSync('serverless.yml', 'utf8');
        const base = 'organizations/{organizationId}/units/{unitId}/cost-centers';
        for (const [handler, path, method] of [
            ['create-cost-center', '', 'post'], ['find-all-cost-centers', '', 'get'],
            ['find-by-id-cost-center', '/{id}', 'get'], ['find-by-code-cost-center', '/code/{code}', 'get'],
            ['find-by-name-cost-center', '/name/{name}', 'get'], ['update-cost-center', '/{id}', 'put'],
            ['delete-cost-center', '/{id}', 'delete'],
        ]) {
            expect(config).toContain(`handler: src/entrypoints/lambda/cost-center/${handler}.handler\n    events:\n      - http:\n          path: ${base}${path}\n          method: ${method}`);
        }
    });
});
