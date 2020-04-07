import { Service } from "typedi";
import mongoose = require('mongoose');
import Statement from "../../models/graphql/statement.type";
import { catMongoDb } from "../log/config.logging";

@Service()
export default class MongoConnectorService {

    private mongoDbConfig = {
        dbName: 'VisualCEP',
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    };

    private statementModel = new Statement("", "", "", "", "-1", "").getModelForClass(Statement, {
        existingMongoose: mongoose,
        schemaOptions: {collection: 'StatementCollection'}
    });

    constructor() {
        const { MONGO_DB_USER, MONGO_DB_PASSWORD, MONGO_DB_PATH } = process.env;
        const mongoURI =   `mongodb://${ MONGO_DB_USER }:${ MONGO_DB_PASSWORD }${ MONGO_DB_PATH }`;
        mongoose.connect(
            mongoURI,
            this.mongoDbConfig,
            (err) => err ? catMongoDb.info(() => (`Error connecting to MongoDB: ${err}`)) : catMongoDb.info(() => (`Successfully connected to MongoDB.`))
        );
    }

    public async createStatement( statement: Statement ): Promise<Statement> {
        return await this.statementModel.create(statement);
    }

    public async readStatement( id: string ): Promise<any> {
        const statement =  await this.statementModel.findOne({ deploymentId: id });
        return statement;
    }

    public async readAllStatements(): Promise<Statement[]> {
        return await this.statementModel.find();
    }

    public async deleteStatement( id: string): Promise<any> {
        return await this.statementModel.findOneAndDelete({ deploymentId: id });
    }

    public async deleteAllStatements(): Promise<any> {
        return await this.statementModel.deleteMany({});
    }

    public async updateStatement( id: string, statement: Statement ): Promise<any> {
        return await this.statementModel.findOneAndUpdate({ deploymentId: id }, statement );
    }
}