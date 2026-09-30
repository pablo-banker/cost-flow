import type {FastifyInstance} from "fastify";
import type {OrganizationModule} from "@modules/organization.module";
import {
    createOrganizationHandler,
    createOrganizationSchema,

    deleteOrganizationHandler,
    deleteOrganizationSchema,

    findAllOrganizationHandler,
    findAllOrganizationSchema,

    findByIdOrganizationHandler,
    findByIdOrganizationSchema,

    findByNameOrganizationHandler,
    findByNameOrganizationSchema,

    updateOrganizationHandler,
    updateOrganizationSchema,
} from '@entrypoints/http/handlers';



export function registerOrganizationRoutes(server: FastifyInstance, dependencies: OrganizationModule): void {
    server.get(
        '/organizations',
        {
            schema: findAllOrganizationSchema,
        },
        findAllOrganizationHandler(dependencies.findAllOrganization),
    );

    server.get(
        '/organizations/:id',
        {
            schema: findByIdOrganizationSchema,
        },
        findByIdOrganizationHandler(dependencies.findByIdOrganization),
    );

    server.get(
        '/organizations/name/:name',
        {
            schema: findByNameOrganizationSchema,
        },
        findByNameOrganizationHandler(dependencies.findByNameOrganization),
    );


    server.post(
        '/organizations',
        {
            schema: createOrganizationSchema,
        },
        createOrganizationHandler(dependencies.createOrganization),
    );


    server.put(
        '/organizations/:id',
        {
            schema: updateOrganizationSchema,
        },
        updateOrganizationHandler(dependencies.updateOrganization),
    );

    server.delete(
        '/organizations/:id',
        {
            schema: deleteOrganizationSchema,
        },
        deleteOrganizationHandler(dependencies.deleteOrganization),
    );
}