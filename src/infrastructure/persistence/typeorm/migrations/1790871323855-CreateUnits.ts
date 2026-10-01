import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUnits1790871323855 implements MigrationInterface {
    name = 'CreateUnits1790871323855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "units" ("id" uuid NOT NULL, "organization_id" uuid NOT NULL, "name" character varying(150) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_5a8f2f064919b587d93936cb223" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_units_organization_id" ON "units"  ("organization_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_units_organization_id_name" ON "units"  ("organization_id", "name") `);
        await queryRunner.query(`ALTER TABLE "units" ADD CONSTRAINT "FK_477b8c9890c6a2f692c2e1f78ca" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "units" DROP CONSTRAINT "FK_477b8c9890c6a2f692c2e1f78ca"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_units_organization_id_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_units_organization_id"`);
        await queryRunner.query(`DROP TABLE "units"`);
    }

}
