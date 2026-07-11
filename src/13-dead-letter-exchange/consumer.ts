import amqp from "amqplib";

async function consumerWithAcks() {
  const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
  const channel = await connection.createChannel();

  const exchange = "amq.direct";
  const queue = "nfe.queue";
  const dlxQueue = "dlx.queue";
  const dlxExchange = "dlx.exchange";
  const typeExchange = "direct";

  await channel.assertExchange(exchange, typeExchange); // cria a exchange caso não exista
  await channel.assertQueue(queue, { // cria a fila caso não exista
    deadLetterExchange: dlxExchange,
    //deadLetterRoutingKey: "xpto", // define a routing key específica para a dead letter exchange, caso contrário, usará a mesma routing key da mensagem original
  });
  await channel.bindQueue(queue, exchange, "order"); // associa a fila à exchange com a routing key "order"

  await channel.assertExchange(dlxExchange, typeExchange); // cria a exchange de dead letter caso não exista
  await channel.assertQueue(dlxQueue); // cria a fila de dead letter caso não exista
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
          msg && channel.reject(msg, false); // dispara o dead letter
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
          //@ts-expect-error
          console.error("[!] Processing error:", error.message);
          
          channel.nack(msg, false, true); //channel.reject(msg, true);

        }
      //}, 10000);
    },
    { noAck: false }
  );
}

consumerWithAcks().catch(console.error);

//não reprocessáveis
//reprocessáveis