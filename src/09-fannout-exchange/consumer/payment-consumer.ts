import amqp from 'amqplib';
import { FANNOUT_EXCHANGE_NAME, FANNOUT_EXCHANGE_TYPE, RABBITMQ_URL } from '../../utils/rabbit-mq-constants';

const QUEUE_NAME = "payment-queue";

async function startPaymentConsumer() {
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
                    console.log("Processing payment for order:", order);
                    // Simulate payment processing
                    channel.ack(msg);
                }
            });
    } catch (error) {
        console.error('Error in payment consumer:', error);
    }
}

startPaymentConsumer();