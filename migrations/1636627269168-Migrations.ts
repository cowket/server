import {MigrationInterface, QueryRunner} from "typeorm";

export class Migrations1636627269168 implements MigrationInterface {
    name = 'Migrations1636627269168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cowket_test\`.\`message\` ADD \`some\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cowket_test\`.\`message\` DROP COLUMN \`some\``);
    }

}
