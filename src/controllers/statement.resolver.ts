import { Resolver, Query, ArgsType, Field, Args, Mutation, Arg } from "type-graphql";
import Statement from "../models/graphql/statement.type";
import { DeployStatementInput, QueryStatementInput, RedeployStatementInput } from "../models/graphql/statement.input";
import { StatementUtilsService } from "../services/utils/statementUtils.service";

@Resolver(of => Statement)
export class StatementResolver {
    constructor(private readonly statementUtilsService: StatementUtilsService) {}

    @Query(returns => [Statement], { nullable: true })
    async statements(@Args() statementArgs: QueryStatementInput): Promise<Statement[] | null> {
        return await this.statementUtilsService.getStatement( statementArgs );
    }

    @Mutation(returns => Statement)
    async deployStatement(@Arg("data") newStatementData: DeployStatementInput): Promise<Statement> {
        return await this.statementUtilsService.createStatement( newStatementData );
    }

    @Mutation(returns => Statement)
    async redeployStatement(@Arg("data") updateStatementData: RedeployStatementInput): Promise<Statement> {
        return await this.statementUtilsService.updateStatement( updateStatementData );
    }

    @Mutation(returns => Boolean)
    async undeployStatement(@Arg("deploymentId", { nullable: true }) deploymentId?: string): Promise<boolean> {
        return (deploymentId) ? await this.statementUtilsService.deleteStatement( deploymentId ) : await this.statementUtilsService.deleteStatement();
    }
}