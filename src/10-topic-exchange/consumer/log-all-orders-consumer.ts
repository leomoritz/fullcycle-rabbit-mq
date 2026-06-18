import amqp from 'amqplib';
import { RABBITMQ_URL, TOPIC_EXCHANGE_TYPE, TOPIC_EXCHANGE_NAME } from '../../utils/rabbit-mq-constants';

const QUEUE_NAME = "log-all-orders-queue";
const ROUTING_KEY = "order.#";

async function start() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertExchange(TOPIC_EXCHANGE_NAME, TOPIC_EXCHANGE_TYPE);
        await channel.assertQueue(QUEUE_NAME);
        await channel.bindQueue(QUEUE_NAME, TOPIC_EXCHANGE_NAME, ROUTING_KEY);

        console.log("Waiting for messages in %s. To exit press CTRL+C", QUEUE_NAME);

        channel.consume(
            QUEUE_NAME,
            (msg) => {
                if (msg) {
                    console.log(`[log-all-orders] Received (${msg.fields.routingKey}):`, msg.content.toString());
                }
            });
    } catch (error) {
        console.error('Error in consumer:', error);
    }
}

start();