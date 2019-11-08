import { KafkaPubSub } from "graphql-kafka-subscriptions";
import { Service, Inject } from "typedi";
import rdkafka from 'node-rdkafka';
import { catKafka } from "../log/config.logging";
const kafka = require('kafka-node');

@Service()
export class KafkaConnector {

    client = new kafka.KafkaClient({ kafkaHost: '192.168.2.116:9092' });
    admin = new kafka.Admin(this.client);
    adminClient = rdkafka.AdminClient.create({
        'client.id': 'kafka-admin',
        'metadata.broker.list': '192.168.2.116'
    });

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
        catKafka.info(() => (`New active listener added for topic ${ topic }`));
        return newPubSub
    }

    public async getPubSub( topic: string ): Promise<KafkaPubSub> {
        const pubSub = this.activePubSubs.find(activePubSub => activePubSub.topic === topic)
        if (pubSub) { return pubSub.pubsub };
        return this.activateNewPubSub(topic);
    }

    public getTopicList(): Promise<String[]> {
        return new Promise((resolve, reject) => {
            let topicsList: String[] = [];
            this.admin.listTopics(async (err: any, res: any) => {
                Object.entries(res[1].metadata).forEach(([key, value]) => {
                    if ( key !== '__consumer_offsets' ) { 
                        topicsList.push(key); 
                    }
                });
                catKafka.info(() => (`Current available kafka topics: ${ topicsList }`));
                resolve(topicsList);
            });  
        });
    }

    public createTopic( topic: String ): Promise<boolean> {
        return new Promise(( resolve, reject) => {
            this.admin.createTopics([{topic: topic, partitions: 1, replicationFactor: 1}], (err: any, res: any) => {
                !err ? catKafka.info(() => (`New Kafka topic added: ${ topic }`)) : catKafka.info(() => `Error adding Kafka topic '${ topic }': ${ err }`);
                err ? resolve(false) : resolve(true);
            });
        });
    }

    public deleteTopic( topic: String): Promise<boolean> {
        return new Promise(( resolve, reject) => {
            this.adminClient.deleteTopic(topic, ( err: any, res: any) => {
                !err ? catKafka.info(() => (`Kafka topic removed: ${ topic }`)) : catKafka.info(() => `Error removing Kafka topic '${ topic }': ${ err }`);
                err ? resolve(false) : resolve(true);
            });
        });
    }
}