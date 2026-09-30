import type {FastifyInstance} from "fastify";
import type {CreateOrganization} from "@application/organization/use-cases/create-organization";
import {createOrganizationHandler} from "@entrypoints/http/handlers/create-organization-handler";
import type {FindAllOrganization} from "@application/organization/use-cases/find-all-organization";
import type {FindByIdOrganization} from "@application/organization/use-cases/find-by-id-organization";
import type {FindByNameOrganization} from "@application/organization/use-cases/find-by-name-organization";
import type {UpdateOrganization} from "@application/organization/use-cases/update-organization";
import type {DeleteOrganization} from "@application/organization/use-cases/delete-organization";
import {findAllOrganizationHandler} from "@entrypoints/http/handlers/find-all-organization-handler";
import {findByIdOrganizationHandler} from "@entrypoints/http/handlers/find-by-id-organization-handler";
import {findByNameOrganizationHandler} from "@entrypoints/http/handlers/find-by-name-organization-handler";
import {updateOrganizationHandler} from "@entrypoints/http/handlers/update-organization-handler";
import {deleteOrganizationHandler} from "@entrypoints/http/handlers/delete-organization-handler";
import type {OrganizationModule} from "@modules/organization.module";



export function registerOrganizationRoutes(server: FastifyInstance, dependencies: OrganizationModule): void {
    server.post(
        '/organizations',
        createOrganizationHandler(dependencies.createOrganization),
    );

    server.get(
        '/organizations',
        findAllOrganizationHandler(dependencies.findAllOrganization),
    );

    server.get(
        '/organizations/:id',
        findByIdOrganizationHandler(dependencies.findByIdOrganization),
    );

    server.get(
        '/organizations/name/:name',
        findByNameOrganizationHandler(dependencies.findByNameOrganization),
    );

    server.put(
        '/organizations/:id',
        updateOrganizationHandler(dependencies.updateOrganization),
    );

    server.delete(
        '/organizations/:id',
        deleteOrganizationHandler(dependencies.deleteOrganization),
    );
}