import * as amqp from "amqplib";

async function producer() {
    try {
        const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
        const channel = await connection.createChannel();

        const queue = "products";
        await channel.assertQueue(queue);

        const messages = new Array(10000).fill(0).map((_, i) => (
            {
                id: i,
                name: `Product ${i}`,
                price: Math.floor(Math.random() * 100),
            }
        ));

        /* 
        Usar Promise.all para enviar todas as mensagens de forma assíncrona e esperar que todas sejam enviadas antes de fechar a conexão.
        Usar Promise.all também permite que as mensagens sejam enviadas de forma independente, mas com paralelismo.
        */
        await Promise.all(
            messages.map((message) => {
                return channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                    contentType: "application/json",
                });
            })
        );

        console.log(" [x] Sent messages");

        setTimeout(() => {
            connection.close(); // Fechar a conexão após um curto período. Fecha também o canal implicitamente.
            process.exit(0);
        }, 500);
    } catch (error) {
        console.error('Error in producer:', error);
    }
}

producer();