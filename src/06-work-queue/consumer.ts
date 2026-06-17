import amqp from 'amqplib';

async function worker() {
    try {
        const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
        const channel = await connection.createChannel();
        
        const queue = "work_queue";
        await channel.assertQueue(queue);

        // prefetch = 1 (default) - round robin hood
        // prefetch só funciona se usado em conjunto com noAck: false
        // prefetch precisa ser usado com cuidado, pois quanto maior o lote, mais riscos de lentidão
        channel.prefetch(10);

        console.log(`[*] Worker aguardando tarefas. Para sair pressione CTRL+C`)

        channel.consume(
            queue,
            (msg) => {
                if (msg && msg.content) {
                    const content = msg.content.toString();
                    console.log(`[X] Recebido: ${content}`);

                    const dots = content.split(".").length - 1;
                    const timeToProcess = dots * 1000;
                    
                    // async
                    setTimeout(() => {
                        console.log(`[X] Tarefa concluída`);
                        channel.ack(msg); // ack manual
                    }, timeToProcess) // 10 segundos, 15 segundos...
                }
            },
            { noAck: false } // com confirmação
        );
    } catch (error) {
        console.error('Error in consumer:', error);
    }
}

worker();