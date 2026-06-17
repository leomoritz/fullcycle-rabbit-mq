import * as amqp from "amqplib";

async function producer() {
    try {
        const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
        console.log('Connected to RabbitMQ with success');

        const channel = await connection.createChannel();
        console.log('Channel created successfully');

        const queue = "products";
        const msg = JSON.stringify({ id: 1, name: "Teclado Logitech", price: 80.0 }); // Criar um objeto e convertê-lo para uma string JSON

        await channel.assertQueue(queue); // Garantir que a fila existe, criando-a se necessário
        channel.sendToQueue(queue, Buffer.from(msg), {
            contentType: "application/json" // Definir o tipo de conteúdo da mensagem como JSON
        });
        console.log(" [x] Sent '%s'", msg);

        setTimeout(() => {
            connection.close(); // Fechar a conexão após um curto período. Fecha também o canal implicitamente.
            process.exit(0);
        }, 500);
    } catch (error) {
        console.error('Error in producer:', error);
    }
}

producer();