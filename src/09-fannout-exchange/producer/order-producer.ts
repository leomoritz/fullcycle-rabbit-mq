import * as amqp from "amqplib";
import { FANNOUT_EXCHANGE_NAME, FANNOUT_EXCHANGE_TYPE, RABBITMQ_URL } from "../../utils/rabbit-mq-constants";

interface Order {
    id: number;
    customerName: string;
    items: Array<{ productId: string; quantity: number }>;
    total: number;
    createdAt: string;
}

// Função para publicar o pedido na mensageria
async function publishOrder(order: Order) {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(FANNOUT_EXCHANGE_NAME, FANNOUT_EXCHANGE_TYPE);

    channel.publish(FANNOUT_EXCHANGE_NAME, "", Buffer.from(JSON.stringify(order)));

    console.log("Order published: ", order)

    setTimeout(() => {
        connection.close();
        process.exit();
    }, 500);
}

// Função para simular uma venda e publicar a order
export async function createAndPublishOrder(data: {
    customerName: string;
    items: Array<{ productId: string; quantity: number }>;
    total: number;
}) {
    const { customerName, items, total } = data;
    const order = {
        id: Math.floor(Math.random() * 1000000),
        customerName,
        items,
        total,
        createdAt: new Date().toISOString(),
    };

    await publishOrder(order);
}

// Monta pedido e manda para criar e publicar
const orderData = {
    customerName: "John Doe",
    items: [
        { productId: "123", quantity: 2 },
        { productId: "456", quantity: 1 },
    ],
    total: 100.0,
};

createAndPublishOrder(orderData) //
    .then(() => console.log("Order published successfully")) //
    .catch((error) => console.log("Error publishing order: ", error));