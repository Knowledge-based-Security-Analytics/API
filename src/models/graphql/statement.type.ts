import { ObjectType, Field, Int } from "type-graphql";
import { Typegoose, prop } from "@hasezoey/typegoose";

@ObjectType({ description: "The datamodel for EPL statements" })
export default class Statement extends Typegoose {
    @prop()
    @Field()
    deploymentId: string = '-1';

    @prop()
    @Field( type => [String] )
    deploymentDependencies: string[] = [];

    @prop()
    @Field( type => String )
    deploymentMode: string;

    @prop()
    @Field( type => String )
    eplStatement: string;

    @prop()
    @Field( type => String )
    name: string;

    @prop()
    @Field( type => String )
    blocklyXml: string;

    constructor( eplStatement: string, name: string, blocklyXml: string, deploymentMode?: string ) {
            super();
            this.eplStatement = eplStatement;
            this.name = name;
            this.blocklyXml = blocklyXml;
            this.deploymentMode = deploymentMode ? deploymentMode : "dev";
    }
}