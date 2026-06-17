import amqp from 'amqplib';
import { FANNOUT_EXCHANGE_NAME, FANNOUT_EXCHANGE_TYPE, RABBITMQ_URL } from '../../utils/rabbit-mq-constants';

const QUEUE_NAME = "stock-queue";

async function startStockConsumer() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertExchange(FANNOUT_EXCHANGE_NAME, FANNOUT_EXCHANGE_TYPE);
        await channel.assertQueue(QUEUE_NAME);
        await channel.bindQueue(QUEUE_NAME, FANNOUT_EXCHANGE_NAME, "");

        console.log("Waiting for messages in %s. To exit press CTRL+C", QUEUE_NAME);

        channel.consume(
            QUEUE_NAME,
            (msg) => {
                if (msg) {
                    const order = JSON.parse(msg.content.toString());
                    console.log("Received order for stock update:", order);
                    // Logic to update stock levels based on the order
                    channel.ack(msg);
                }
            });
    } catch (error) {
        console.error('Error in stock consumer:', error);
    }
}

startStockConsumer();