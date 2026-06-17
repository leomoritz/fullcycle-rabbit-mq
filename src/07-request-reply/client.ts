import amqp from "amqplib"
import crypto from "crypto"

async function toUpperCaseRPC(text: string): Promise<string> {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672")
    const channel = await connection.createChannel();

    // Fila apenas para recepção da resposta, podendo ser temporária ou durável, dependendo da ocasião.
    const queue = await channel.assertQueue("", { exclusive: true }); // `exlusive: true` indica que a fila é exclusiva para esta conexão e será deletada quando a conexão for fechada. O nome da fila é gerado automaticamente pelo RabbitMQ.
    
    // Fila para requisição
    await channel.assertQueue("rpc_queue");

    // Identificador da requisição
    const correlationId = crypto.randomBytes(16).toString("hex");

    // Publica a requisição e aguarda uma resposta com uso de Promise
    return new Promise<string>((resolve) => {
        channel.consume(
            queue.queue,
            (msg) => {
                if (msg && msg.properties.correlationId === correlationId) {
                    resolve(msg.content.toString());
                    setTimeout(() => connection.close(), 500);
                }
            },
            { noAck: true }// ack automático para evitar represália caso algum problema ocorra no processamento/consumo da resposta
        );

        channel.sendToQueue("rpc_queue", Buffer.from(text), {
            correlationId: correlationId,
            replyTo: queue.queue,
        });
    });
}

toUpperCaseRPC("mensagem simples").then(console.log);