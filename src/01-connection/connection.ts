import * as amqp from "amqplib";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function connect() {
    try {
        const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
        console.log('Connected to RabbitMQ with success');
        
        const channel = await connection.createChannel();
        console.log('Channel created successfully');

        await sleep(30000); // Aguardar 30 segundos para demonstração

        // Fechar conexão após o uso
        await channel.close();
        await connection.close();
        console.log('Connection closed');
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}

connect();