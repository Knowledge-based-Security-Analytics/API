import { DeployStatementInput, QueryStatementInput, RedeployStatementInput } from "../../models/statement.input";
import Statement from "../../models/statement.type";
import { Service, Inject } from "typedi";
import MongoConnectorService from "../database/mongoConnector.service";
import { StatementsRestApiService } from "../api/statementsRestApi.service";
import { StatementApiReturn } from "../../models/statementApiReturn.type";

@Service()
export class StatementUtilsService {
    constructor(private mongoConnectorService: MongoConnectorService,
        private statementsRestApiService: StatementsRestApiService) {}

    public async createStatement( newStatementData: DeployStatementInput ): Promise<Statement | String> {
        const statement = new Statement( 
            newStatementData.eplStatement,
            newStatementData.name ? newStatementData.name : newStatementData.eplStatement,
            newStatementData.deploymentMode ? newStatementData.deploymentMode : 'dev' );
        return await this.deployStatement( statement );
    }

    public async updateStatement( updateData: RedeployStatementInput ): Promise<Statement | null> {
        let statement = await this.mongoConnectorService.readStatement( updateData.deploymentId );
        statement.name = updateData.name ? updateData.name : statement.name;
        statement.deploymentMode = updateData.deploymentMode ? updateData.deploymentMode : statement.deploymentMode;
        if (updateData.eplStatement && (statement.eplStatement !== updateData.eplStatement)) {
            statement.eplStatement = updateData.eplStatement;
            statement = this.deployStatement( statement, statement.deploymentId );
        } else {
            statement = await this.mongoConnectorService.updateStatement( statement.deploymentId, statement );
        }
        return statement;
    }

    private async deployStatement( statement: Statement, deploymentId?: string ): Promise<Statement | String> {
        const deploymentData = deploymentId ? await this.statementsRestApiService.postStatement( statement.eplStatement, deploymentId ) : await this.statementsRestApiService.postStatement( statement.eplStatement );
        if (deploymentData instanceof StatementApiReturn) {
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
        if (statementArgs.eplStatement) { statements = statements.filter ( statement => statement.eplStatement === statementArgs.eplStatement )}
        if (statementArgs.name) { statements = statements.filter( statement => statement.name === statementArgs.name )}
        return statements;
    }
}