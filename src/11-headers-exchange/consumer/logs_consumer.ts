import amqp from 'amqplib';
import { HEADERS_EXCHANGE_NAME, HEADERS_EXCHANGE_TYPE, RABBITMQ_URL  } from '../../utils/rabbit-mq-constants';

async function consume() {
    const conn = await amqp.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();

    const queue = 'logs_queue';

    await channel.assertExchange(HEADERS_EXCHANGE_NAME, HEADERS_EXCHANGE_TYPE);
    await channel.assertQueue(queue);

    await channel.bindQueue(queue, HEADERS_EXCHANGE_NAME, '', {
        isFile: true,
        xpto: 'xpto',
        'x-match': 'any' // SERÁ REDIRECIONADO PARA FILA SE DER MATCH COM QUALQUER UM DOS DOIS HEADERS EXISTENTES
    });

    channel.consume(queue, msg => {
        if (msg) {
            console.log('Log recebido:', msg.content.toString());
            channel.ack(msg);
        }
    });
}

consume();