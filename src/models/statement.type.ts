import { ObjectType, Field, Int } from "type-graphql";
import { Typegoose, prop } from "@hasezoey/typegoose";

@ObjectType({ description: "The datamodel for EPL statements" })
export default class Statement extends Typegoose {
    @prop()
    @Field()
    deploymentId: string = '-1';

    @prop()
    @Field(type => [String])
    deploymentDependencies: string[] = [];

    @prop()
    @Field()
    deploymentMode: string;

    @prop()
    @Field()
    eplStatement: string;

    @prop()
    @Field()
    name: string;

    constructor(
        eplStatement: string,
        name: string,
        deploymentMode?: string ) {
            super();
            this.eplStatement = eplStatement;
            this.name = name;
            this.deploymentMode = deploymentMode ? deploymentMode : "dev";
    }
}