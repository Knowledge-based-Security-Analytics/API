import { Subscription, Mutation, ObjectType, Field, ID, Arg, Root, Resolver } from "type-graphql";
import { KafkaConnector } from "../services/database/kafkaConnector.service";
import { Service } from "typedi";
import { KafkaPubSub } from "graphql-kafka-subscriptions";

@ObjectType()
class Notification {
  @Field(type => ID)
  id!: number;

  @Field({ nullable: true })
  message?: string;

  @Field(type => Date)
  date!: Date;
}

interface NotificationPayload {
  id: number;
  message?: string;
}

@Service()
@Resolver()
export class SampleResolver {

    constructor(private readonly kafkaConnector: KafkaConnector) {}

    private autoIncrement = 1000;

    @Mutation(returns => Boolean)
    async pubSubMutation(@Arg("message") message: string) {
        const payload: NotificationPayload = { id: ++this.autoIncrement, message };
        const pubsub = await this.kafkaConnector.getPubSub('json-events');
        return pubsub.publish(payload);
    }

    @Subscription({
        subscribe: ( args, payload, context ) => {
            return context.kafkaConnector.getPubSub('json-events').then((pubsub: KafkaPubSub) => {return pubsub.asyncIterator('json-events')});
        }
    })
    normalSubscription(@Root() { id, message }: NotificationPayload): Notification {
        return { id, message, date: new Date() };
    }
}