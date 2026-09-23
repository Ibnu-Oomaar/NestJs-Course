import { DataSourceOptions } from "typeorm";

  
const ormconfig:DataSourceOptions={
    type:'postgres',
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "admin",
    database: "first_test",
    logging: true,
    synchronize: true,
    entities: [__dirname + '/**/*.entity{.ts,.js}']
}

export default ormconfig;