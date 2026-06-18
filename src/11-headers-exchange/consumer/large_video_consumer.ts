import amqp from 'amqplib';
import { HEADERS_EXCHANGE_NAME, HEADERS_EXCHANGE_TYPE, RABBITMQ_URL } from '../../utils/rabbit-mq-constants';

async function consume() {
    const conn = await amqp.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();

    const queue = 'large_video_queue';

    await channel.assertExchange(HEADERS_EXCHANGE_NAME, HEADERS_EXCHANGE_TYPE);
    await channel.assertQueue(queue);

    await channel.bindQueue(queue, HEADERS_EXCHANGE_NAME, '', { // headers padrão e headers personalizados (que começam com x-)
        type: 'video',
        size: 'large',
        'x-xpto-etc': 'xpto',
        'x-match': 'all' // 'all' ou 'any', "any-with-x", "all-with-x"
    });

    channel.consume(queue, msg => {
        if (msg) {
            console.log('Vídeo GRANDE recebido:', msg.content.toString());
            channel.ack(msg);
        }
    });
}

consume();