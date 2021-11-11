module.exports = {
  type: 'mariadb',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: ['src/entities/**/*.ts'],
  migrations: ['./migrations/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
  cli: {
    migrationsDir: 'migrations'
  }
}
