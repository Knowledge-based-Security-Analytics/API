import { DeployStatementInput, QueryStatementInput, RedeployStatementInput } from "../../models/graphql/statement.input";
import Statement from "../../models/graphql/statement.type";
import { Service } from "typedi";
import MongoConnectorService from "../database/mongoConnector.service";
import { StatementsRestApiService } from "../api/statementsRestApi.service";
import { CustomException } from "../../models/exception/custom.exception";
import { catCepRestPut } from "../log/config.logging";

@Service()
export class StatementUtilsService {
    constructor(private mongoConnectorService: MongoConnectorService,
        private statementsRestApiService: StatementsRestApiService) {}

    public async createStatement( newStatementData: DeployStatementInput ): Promise<Statement> {
        const statement = new Statement( 
            newStatementData.eplStatement,
            newStatementData.name ? newStatementData.name : newStatementData.eplStatement,
            newStatementData.description ? newStatementData.description : "",
            new Date().toLocaleString(),
            newStatementData.blocklyXml,
            newStatementData.deploymentMode,
            newStatementData.eventType);
        return await this.deployStatement( statement );
    }

    public async updateStatement( updateData: RedeployStatementInput ): Promise<Statement> {
        let statement: Statement = await this.mongoConnectorService.readStatement( updateData.deploymentId );
        try {
            statement.name = updateData.name ? updateData.name : statement.name;
            statement.description = updateData.description ? updateData.description : statement.description;
            statement.modified = new Date().toLocaleString();
            statement.deploymentMode = updateData.deploymentMode ? updateData.deploymentMode : statement.deploymentMode;
            statement.blocklyXml = updateData.blocklyXml ? updateData.blocklyXml : statement.blocklyXml;
            statement.eventType = updateData.eventType ? updateData.eventType : statement.eventType;
            if (updateData.eplStatement && (statement.eplStatement !== updateData.eplStatement)) {
                statement.eplStatement = updateData.eplStatement;
                statement = await this.deployStatement( statement, statement.deploymentId );
            } else {
                statement = await this.mongoConnectorService.updateStatement( statement.deploymentId, statement );
            }
            return statement;
        } catch (error) {
            catCepRestPut.info(() => `Statement with deploymentId ${updateData.deploymentId} not found in MongoDB` );
            throw new CustomException( `Statement with deploymentId ${updateData.deploymentId} not found in MongoDB` );
        }
    }

    private async deployStatement( statement: Statement, deploymentId?: string ): Promise<Statement> {
        const deploymentData = deploymentId ? await this.statementsRestApiService.postStatement( statement.eplStatement, deploymentId ) : await this.statementsRestApiService.postStatement( statement.eplStatement );
        if (deploymentData) {
            statement.deploymentId = deploymentData.deploymentId;
            statement.deploymentDependencies = deploymentData.deploymentIdDependencies;
            deploymentId ? await this.mongoConnectorService.updateStatement( deploymentId, statement ) : await this.mongoConnectorService.createStatement(statement);
            return statement;
        }
        return deploymentData;
    }

    public async deleteStatement( deploymentId?: string ): Promise<boolean> {
        return (deploymentId) ? await this.deleteSingleStatement( deploymentId ) : this.deleteAllStatements();
    }

    private async deleteSingleStatement( deploymentId: string ): Promise<boolean> {
        if ( this.mongoConnectorService.readStatement(deploymentId) ) {
            await this.statementsRestApiService.deleteStatement(deploymentId);
            return await this.mongoConnectorService.deleteStatement(deploymentId) ? true : false;
        }
        return false;
    }

    private async deleteAllStatements(): Promise<boolean> {
        await this.statementsRestApiService.deleteStatement();
        return await this.mongoConnectorService.deleteAllStatements() ? true : false;
    }

    public async getStatement( statementArgs: QueryStatementInput ): Promise<Statement[]> {
        let statements = await this.mongoConnectorService.readAllStatements();
        if (statementArgs.deploymentMode) { statements = statements.filter( statement => statement.deploymentMode === statementArgs.deploymentMode )}
        if (statementArgs.deploymentId) { statements = statements.filter( statement => statement.deploymentId === statementArgs.deploymentId )}
        if (statementArgs.eventType) { statements = statements.filter ( statement => statement.eventType === statementArgs.eventType )}
        if (statementArgs.name) { statements = statements.filter( statement => statement.name === statementArgs.name )}
        return statements;
    }
}