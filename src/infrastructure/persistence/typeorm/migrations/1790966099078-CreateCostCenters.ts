import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCostCenters1790966099078 implements MigrationInterface {
    name = 'CreateCostCenters1790966099078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cost_centers" ("id" uuid NOT NULL, "organization_id" uuid NOT NULL, "unit_id" uuid NOT NULL, "code" character varying(50) NOT NULL, "name" character varying(150) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_e70f55c677c255c1f81f0ed1ccb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cost_centers_organization_id_unit_id" ON "cost_centers"  ("organization_id", "unit_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_cost_centers_unit_id" ON "cost_centers"  ("unit_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_cost_centers_organization_id_unit_id_code" ON "cost_centers"  ("organization_id", "unit_id", "code") `);
        await queryRunner.query(`CREATE INDEX "IDX_cost_centers_organization_id" ON "cost_centers"  ("organization_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_cost_centers_organization_id_unit_id_name" ON "cost_centers"  ("organization_id", "unit_id", "name") `);
        await queryRunner.query(`ALTER TABLE "cost_centers" ADD CONSTRAINT "FK_ff21adcddb700b492f32cc29c1f" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cost_centers" ADD CONSTRAINT "FK_3db9c331d018ea6236eeaf68555" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cost_centers" DROP CONSTRAINT "FK_3db9c331d018ea6236eeaf68555"`);
        await queryRunner.query(`ALTER TABLE "cost_centers" DROP CONSTRAINT "FK_ff21adcddb700b492f32cc29c1f"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_cost_centers_organization_id_unit_id_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cost_centers_organization_id"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_cost_centers_organization_id_unit_id_code"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cost_centers_unit_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cost_centers_organization_id_unit_id"`);
        await queryRunner.query(`DROP TABLE "cost_centers"`);
    }

}
