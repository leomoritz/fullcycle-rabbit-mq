import amqp from "amqplib"

async function startRPCServer() {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672")
    const channel = await connection.createChannel();

    await channel.assertQueue("rpc_queue");

    // work queue
    channel.prefetch(1); // permite balanceamento de carga, 1 mensagem por consumidor conectado na fila

    console.log("[X] Aguardando requisições RPC");

    channel.consume("rpc_queue", (msg) => {
        if (msg) {
            const input = msg.content.toString();
            console.log("[X] Mensagem recebida com texto: %s", input);

            console.log("Processando requisição e aplicando regras de negócio")
            const result = input.toUpperCase();
            
            console.log("Publicando a resposta na fila");
            channel.sendToQueue(msg.properties.replyTo, Buffer.from(result), {
                correlationId: msg.properties.correlationId,
            });

            channel.ack(msg); // manual ack
        }
    });

}

startRPCServer();