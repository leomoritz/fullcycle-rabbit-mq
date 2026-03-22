import amqp from 'amqplib';

async function consumer() {
    try {
        const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
        console.log('Connected to RabbitMQ with success');

        const channel = await connection.createChannel();
        console.log('Channel created successfully');

        const queue = "hello";

        await channel.assertQueue(queue); // Garantir que a fila existe, criando-a se necessário
        console.log("[*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(
            queue,
            (msg) => {
                if (msg) {
                    console.log("[x] Received '%s'", msg.content.toString());
                }
            },
            { noAck: true }
        );
    } catch (error) {
        console.error('Error in consumer:', error);
    }
}

consumer();