import amqp from "amqplib";
import { HEADERS_EXCHANGE_NAME, HEADERS_EXCHANGE_TYPE, RABBITMQ_URL } from "../../utils/rabbit-mq-constants";

type FileMessage = {
  name: string;
  type: "pdf" | "video";
  size: number;
};

async function publish() {
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();

  await channel.assertExchange(HEADERS_EXCHANGE_NAME, HEADERS_EXCHANGE_TYPE);

  // Exemplos de arquivos
  const files: FileMessage[] = [
    { name: "documento.pdf", type: "pdf", size: 2 },
    { name: "video1.mp4", type: "video", size: 50 },
    { name: "video2.mp4", type: "video", size: 200 },
    { name: "relatorio.pdf", type: "pdf", size: 5 },
    { name: "video3.mov", type: "video", size: 120 },
  ];

  for (const file of files) {
    const headers: {
      type: "pdf" | "video";
      size: "large" | "normal";
      isFile: boolean;
    } = {
      type: file.type,
      size: file.size > 100 ? "large" : "normal",
      isFile: true,
    };
    channel.publish(HEADERS_EXCHANGE_NAME, "", Buffer.from(JSON.stringify(file)), {
      headers,
    });
    console.log(`Arquivo publicado: ${file.name}`);
  }

  setTimeout(() => {
    conn.close();
  }, 500);
}

publish();