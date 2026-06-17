import amqp from 'amqplib';

async function consumer() {
    try {
        const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
        console.log('Connected to RabbitMQ with success');

        const channel = await connection.createChannel();
        console.log('Channel created successfully');

        const queue = "products";

        await channel.assertQueue(queue); // Garantir que a fila existe, criando-a se necessário
        console.log("[*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(
            queue,
            (msg) => {
                if (msg && msg.content && msg.properties.contentType === "application/json") {
                    const obj = JSON.parse(msg.content.toString()); // Converter a string JSON de volta para um objeto JavaScript
                    console.log("[x] Received object with id: %d, name: %s, price: %s", obj.id, obj.name, obj.price);
                    console.log("[x] Received message with content type: %s", msg.properties.contentType);
                    console.log(`JSON ${JSON.stringify(obj)} is being processed...`);
                }
            },
            { noAck: true } // sem confirmação, o rabbit considerá que a mensagem foi processada assim que for entregue ao consumidor. Isso é útil para casos onde a perda de mensagens não é crítica, mas pode levar a mensagens perdidas se o consumidor falhar antes de processar a mensagem.
        );
    } catch (error) {
        console.error('Error in consumer:', error);
    }
}

consumer();