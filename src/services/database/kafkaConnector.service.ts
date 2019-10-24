import { KafkaPubSub } from "graphql-kafka-subscriptions";
import { Service, Inject } from "typedi"

@Service()
export class KafkaConnector {
    constructor(@Inject("ACTIVE_KAFKA_PUBSUBS") private readonly activePubSubs: {topic: string, pubsub: KafkaPubSub}[]) { }

    private activateNewPubSub( topic: string ): KafkaPubSub {
        const { KAFKA_HOST } = process.env;
        const newPubSub = new KafkaPubSub({
            topic: topic,
            host: KAFKA_HOST ? KAFKA_HOST : '127.0.0.1',
            port: '9092',
            groupId: 'graph-cep'
        });
        this.activePubSubs.push({topic: topic, pubsub: newPubSub});
        return newPubSub
    }

    async getPubSub( topic: string ): Promise<KafkaPubSub> {
        const pubSub = this.activePubSubs.find(activePubSub => activePubSub.topic === topic)
        if (pubSub) { return pubSub.pubsub };
        return this.activateNewPubSub(topic);
    }
}