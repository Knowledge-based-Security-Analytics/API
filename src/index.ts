import "reflect-metadata";
import 'dotenv/config';
import { buildSchema } from "type-graphql";
import { ApolloServer, Config } from 'apollo-server';
import { StatementResolver } from "./controllers/statement.resolver";
import { KafkaConnector } from "./services/database/kafkaConnector.service";
import Container from "typedi";
import { catGraphQl } from "./services/log/config.logging";
import { KafkaResolver } from "./controllers/kafka.resolver";

async function serverBoot() {

    Container.set({ id: "ACTIVE_KAFKA_PUBSUBS", factory: () => [] });

    const schema = await buildSchema({
        resolvers: [ StatementResolver, KafkaResolver ],
        emitSchemaFile: true,
        validate: false,
        container: Container,
        });

    const serverConfig: Config = {
        schema,
        context: { kafkaConnector: new KafkaConnector(Container.get("ACTIVE_KAFKA_PUBSUBS"))},
        playground: {
            settings: {
                'editor.theme': 'dark',
                'editor.cursorShape': 'line',
            },
        },
    };

    const server = new ApolloServer(serverConfig);
    await server.listen(process.env.SERVER_PORT, () => {
        catGraphQl.info(() => `Server started at http:\\\\localhost:${ process.env.SERVER_PORT }` );
    });
}

serverBoot();