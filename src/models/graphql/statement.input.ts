import { InputType, Field, ArgsType } from "type-graphql";
import Statement from "./statement.type";

@InputType()
class BaseStatementInput implements Partial<Statement> {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    description?: string;

    @Field({ nullable: true })
    modified?: string;

    @Field({ nullable: true })
    deploymentMode?: string;

    @Field({ nullable: true })
    eventType?: boolean;
}

@InputType()
export class DeployStatementInput extends BaseStatementInput implements Partial<Statement> {
    @Field()
    eplStatement!: string;

    @Field()
    blocklyXml!: string;

    @Field()
    objectRepresentation!: string;
}

@InputType()
export class RedeployStatementInput extends BaseStatementInput implements Partial<Statement> {
    @Field()
    deploymentId!: string;

    @Field({ nullable: true })
    eplStatement?: string;

    @Field({ nullable: true })
    blocklyXml?: string;

    @Field({nullable: true})
    objectRepresentation?: string;
}

@ArgsType()
export class QueryStatementInput implements Partial<Statement> {
    @Field({ nullable: true })
    deploymentId?: string;

    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    deploymentMode?: string;

    @Field({ nullable: true })
    eventType?: boolean;
}