import amqp from "amqplib";

async function consumerWithAcks() {
  const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
  const channel = await connection.createChannel();

  const exchange = "amq.direct";
  const queue = "nfe.queue";
  const dlxQueue = "dlx.retry.queue";
  const dlxExchange = "dlx.exchange";
  const typeExchange = "direct";

  await channel.assertExchange(exchange, typeExchange); // cria a exchange caso não exista
  await channel.assertQueue(queue, { // cria a fila caso não exista
    deadLetterExchange: dlxExchange,
    //deadLetterRoutingKey: "xpto", // define a routing key específica para a dead letter exchange, caso contrário, usará a mesma routing key da mensagem original
  });
  await channel.bindQueue(queue, exchange, "order"); // associa a fila à exchange com a routing key "order"
  await channel.assertQueue("fail.queue"); // cria a fila de falha caso não exista

  await channel.assertExchange(dlxExchange, typeExchange); // cria a exchange de dead letter caso não exista
  await channel.assertQueue(dlxQueue, {
    "messageTtl": 5000, // define o tempo de vida da mensagem na fila de dead letter (5 segundos)
    deadLetterExchange: exchange, // define a exchange para onde as mensagens expiradas serão enviadas para reprocessamento
  }); // cria a fila de dead letter caso não exista
  await channel.bindQueue(dlxQueue, dlxExchange, "order"); // associa a fila de dead letter à exchange de dead letter com a routing key "order"

  console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);

  channel.consume(
    queue,
    (msg) => {
      // Simular processamento, apenas para fins didático
      //setTimeout(() => {
        const content = msg?.content.toString();
        if (!msg || !content) {
          console.log("[!] Received empty message, ignoring...");
          //msg && channel.reject(msg, false); // dispara o dead letter
          if (msg) {
            const newMsg = Buffer.from(JSON.stringify({ error: "Empty message received", payload: "" }));
            channel.sendToQueue("fail.queue", newMsg); // enviando a mensagem para uma fila de falha
            channel.ack(msg, true); // confirma a mensagem para que não seja reprocessada ou enviada para a dead letter exchange
          }
          return;
        }

        console.log(`[x] Received '${content}'`);

        try {
          // Simular sucesso ou falha
          if (parseInt(content) > 5) {
            throw new Error("Processing failed");
          }

          console.log("[x] Done processing");
          channel.ack(msg, true);
        } catch (error) {
          // se acontecer um erro não reprocessvel, publicar na fila de falha

          const maxRetries = 3;
          const xDeath = msg.properties.headers?.["x-death"] || [];
          const retryCount = xDeath[0]?.count || 0;
          
          if (retryCount < maxRetries) {
            channel.nack(msg, false, true); //channel.reject(msg, true);
          } else {
            //@ts-expect-error
            const newMsg = Buffer.from(JSON.stringify({ error: error.message, payload: content }));
            channel.sendToQueue("fail.queue", newMsg); // enviando a mensagem para uma fila de falha
            channel.ack(msg, true); // confirma a mensagem para que não seja reprocessada ou enviada para a dead letter exchange
          }

          //@ts-expect-error
          console.error("[!] Processing error:", error.message);
          

        }
      //}, 10000);
    },
    { noAck: false }
  );
}

consumerWithAcks().catch(console.error);

//não reprocessáveis
//reprocessáveis