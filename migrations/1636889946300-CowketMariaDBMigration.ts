import {MigrationInterface, QueryRunner} from "typeorm";

export class CowketMariaDBMigration1636889946300 implements MigrationInterface {
    name = 'CowketMariaDBMigration1636889946300'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cowket_test\`.\`reaction\` DROP FOREIGN KEY \`FK_e040cc1bc124fc1eb36de988962\``);
        await queryRunner.query(`ALTER TABLE \`cowket_test\`.\`reaction\` CHANGE \`content\` \`reaction_item\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`cowket_test\`.\`reaction\` ADD CONSTRAINT \`FK_ba8638500fd5c618ba0fd0774e3\` FOREIGN KEY (\`reaction_item\`) REFERENCES \`cowket_test\`.\`reaction_item\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cowket_test\`.\`reaction\` DROP FOREIGN KEY \`FK_ba8638500fd5c618ba0fd0774e3\``);
        await queryRunner.query(`ALTER TABLE \`cowket_test\`.\`reaction\` CHANGE \`reaction_item\` \`content\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`cowket_test\`.\`reaction\` ADD CONSTRAINT \`FK_e040cc1bc124fc1eb36de988962\` FOREIGN KEY (\`content\`) REFERENCES \`cowket_test\`.\`reaction_item\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
