import { Subscription, Mutation, ObjectType, Field, ID, Arg, Root, Resolver, Args, ArgsType } from "type-graphql";
import { KafkaConnector } from "../services/database/kafkaConnector.service";
import { Service } from "typedi";
import { KafkaPubSub } from "graphql-kafka-subscriptions";

@ObjectType()
class Event {

  @Field(type => String)
  jsonString!: String;

  @Field(type => Date)
  timestamp!: Date;
}

@ArgsType()
export class KafkaTopicInput {
    @Field()
    topic!: string;
}

@Service()
@Resolver()
export class KafkaResolver {

    constructor(private readonly kafkaConnector: KafkaConnector) {}

    /*@Mutation(returns => Boolean)
    async pubSubMutation(@Arg("message") message: string) {
        const payload: NotificationPayload = { id: ++this.autoIncrement, message };
        const pubsub = await this.kafkaConnector.getPubSub('json-events');
        return pubsub.publish(payload);
    }*/

    @Subscription({
        subscribe: ( root, args: KafkaTopicInput, context ) => {
            return context.kafkaConnector.getPubSub(args.topic).then((pubsub: KafkaPubSub) => {return pubsub.asyncIterator(args.topic)});
        }
    })
    subscribeKafkaTopic(@Root() event: any, @Args() topic: KafkaTopicInput): Event {
        return { jsonString: JSON.stringify(event), timestamp: new Date() };
    }
}