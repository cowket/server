import {MigrationInterface, QueryRunner} from "typeorm";

export class MyMigrations1636623573318 implements MigrationInterface {
    name = 'MyMigrations1636623573318'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`user_grant\` ADD CONSTRAINT \`FK_a3c9e60ce0a5f472d15823efea8\` FOREIGN KEY (\`user_uuid\`) REFERENCES \`cowket\`.\`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`user_grant\` ADD CONSTRAINT \`FK_4400ff69fbde0cf6cdc97f96b76\` FOREIGN KEY (\`team_uuid\`) REFERENCES \`cowket\`.\`team\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`user_grant\` ADD CONSTRAINT \`FK_fd8422e9d3f990ce10a46df070a\` FOREIGN KEY (\`channel_uuid\`) REFERENCES \`cowket\`.\`channel\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`user_grant\` ADD CONSTRAINT \`FK_732a226248a629131773b18b3b5\` FOREIGN KEY (\`team_user_profile\`) REFERENCES \`cowket\`.\`team_user_profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`channel\` ADD CONSTRAINT \`FK_16773b2e0ab6ea6e585e9e802aa\` FOREIGN KEY (\`owner_uuid\`) REFERENCES \`cowket\`.\`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`channel\` ADD CONSTRAINT \`FK_1cb7954d3ab27e86f4dbe8a5874\` FOREIGN KEY (\`team_uuid\`) REFERENCES \`cowket\`.\`team\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`direct_message\` ADD CONSTRAINT \`FK_06a507fbd087abf8062a68b1406\` FOREIGN KEY (\`team\`) REFERENCES \`cowket\`.\`team\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`direct_message\` ADD CONSTRAINT \`FK_c6a07c280f9aa383a85108fc24a\` FOREIGN KEY (\`sender\`) REFERENCES \`cowket\`.\`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`direct_message\` ADD CONSTRAINT \`FK_e3739a980bcdb9f1cad69f35d17\` FOREIGN KEY (\`sender_team_user_profile\`) REFERENCES \`cowket\`.\`team_user_profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`direct_message\` ADD CONSTRAINT \`FK_012137bc624e56ef9c9827fadd2\` FOREIGN KEY (\`receiver\`) REFERENCES \`cowket\`.\`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`direct_message\` ADD CONSTRAINT \`FK_1cf48660c47497d3e03658d5951\` FOREIGN KEY (\`receiver_team_user_profile\`) REFERENCES \`cowket\`.\`team_user_profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`message\` ADD CONSTRAINT \`FK_2e84add10669454c59942b781d8\` FOREIGN KEY (\`team_uuid\`) REFERENCES \`cowket\`.\`team\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`message\` ADD CONSTRAINT \`FK_a46739ee8b462345469d15a1ae3\` FOREIGN KEY (\`channel_uuid\`) REFERENCES \`cowket\`.\`channel\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`message\` ADD CONSTRAINT \`FK_c79f950e9b54801a7fd127aaa84\` FOREIGN KEY (\`sender_uuid\`) REFERENCES \`cowket\`.\`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`message\` ADD CONSTRAINT \`FK_80c8e1d5d7534887cb175b256bc\` FOREIGN KEY (\`team_user_profile\`) REFERENCES \`cowket\`.\`team_user_profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`reaction\` ADD CONSTRAINT \`FK_e5e2d40fdf1df05601c144a3257\` FOREIGN KEY (\`message\`) REFERENCES \`cowket\`.\`message\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`reaction\` ADD CONSTRAINT \`FK_0bea57cc9805853edad0d04d0d1\` FOREIGN KEY (\`user\`) REFERENCES \`cowket\`.\`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`reaction\` ADD CONSTRAINT \`FK_e040cc1bc124fc1eb36de988962\` FOREIGN KEY (\`content\`) REFERENCES \`cowket\`.\`reaction_item\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`reaction\` DROP FOREIGN KEY \`FK_e040cc1bc124fc1eb36de988962\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`reaction\` DROP FOREIGN KEY \`FK_0bea57cc9805853edad0d04d0d1\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`reaction\` DROP FOREIGN KEY \`FK_e5e2d40fdf1df05601c144a3257\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`message\` DROP FOREIGN KEY \`FK_80c8e1d5d7534887cb175b256bc\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`message\` DROP FOREIGN KEY \`FK_c79f950e9b54801a7fd127aaa84\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`message\` DROP FOREIGN KEY \`FK_a46739ee8b462345469d15a1ae3\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`message\` DROP FOREIGN KEY \`FK_2e84add10669454c59942b781d8\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`direct_message\` DROP FOREIGN KEY \`FK_1cf48660c47497d3e03658d5951\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`direct_message\` DROP FOREIGN KEY \`FK_012137bc624e56ef9c9827fadd2\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`direct_message\` DROP FOREIGN KEY \`FK_e3739a980bcdb9f1cad69f35d17\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`direct_message\` DROP FOREIGN KEY \`FK_c6a07c280f9aa383a85108fc24a\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`direct_message\` DROP FOREIGN KEY \`FK_06a507fbd087abf8062a68b1406\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`channel\` DROP FOREIGN KEY \`FK_1cb7954d3ab27e86f4dbe8a5874\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`channel\` DROP FOREIGN KEY \`FK_16773b2e0ab6ea6e585e9e802aa\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`user_grant\` DROP FOREIGN KEY \`FK_732a226248a629131773b18b3b5\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`user_grant\` DROP FOREIGN KEY \`FK_fd8422e9d3f990ce10a46df070a\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`user_grant\` DROP FOREIGN KEY \`FK_4400ff69fbde0cf6cdc97f96b76\``);
        await queryRunner.query(`ALTER TABLE \`cowket\`.\`user_grant\` DROP FOREIGN KEY \`FK_a3c9e60ce0a5f472d15823efea8\``);
    }

}
