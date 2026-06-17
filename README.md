# fullcycle-rabbit-mq

Repositório de estudo do módulo Rabbit MQ da FullCycle

# Introdução ao Rabbit MQ

## O que é Rabbit MQ?

- Antes de entender o que é o RabbitMQ, precisamos entender o que é um Message Broker (Corretor de Mensagens).
  - Um message broker é um intermediário que facilita a comunicação entre aplicações, permitindo troca de informações de forma desacoplada e resiliente. Ele recebe mensagens de produtores (producers - aplicações que enviam mensagens) e as encaminha para consumidores (consumers - aplicações que recebem mensagens) com base em regras de roteamento definidas.
  - Características principais de um message broker:
    - Desacoplamento: Produtores e consumidores não precisam estar cientes um do outro, permitindo maior flexibilidade e escalabilidade.
    - Escalabilidade: Gerencia filas quando destinatários estão ocupados ou offline.
    - Resiliência: Armazena mensagens temporariamente em caso de falhas, garantindo que não sejam perdidas.
    - Flexibilidade: Suporta múltiplos protocolos de comunicação e formatos de mensagens.

## O protocolo AMQP

- O RabbitMQ implementa o AMQP (Advanced Message Queuing Protocol) na versão 0-9-1, um protocolo aberto (aproveita o protocolo TCP/IP) e padronizado para sistemas de mensagens.
- É um protocolo da camada de aplicação que define regras para a troca de mensagens entre sistemas.
- Orientado a mensagens: Projetado especificamente para troca de mensagens entre aplicações.
- Roteamento flexível: define modelo publisher/subscriber com regras de roteamento poderosas.
- Confiabilidade: garante entrega de mensagens com confirmações e persistência.
- Segurança: Autenticação, autorização e criptografia.
- Embora RabbitMQ suporte outros protocolos (como MQTT, STOMP, HTTP), o AMQP é o mais utilizado e oferece a maior gama de funcionalidades.

![alt text](image.png)

## Como o RabbitMQ implementa o AMQP?
- Canais: Conexões virtuais TCP que abrigam múltiplos canais virtuais para operações concorrentes.
- Mensagens: Compostas por cabeçalhos (propriedades) e corpo (payload) com metadados.
  - Controle de entrega: delivery_mode (persistência), expiration (TTL)
  - Conteúdo: content_type, headers personalizados.
  - Padrões RPC: reply_to (fila de resposta), correlation_id (rastreamento).
- Exchanges: Pontos de entrada e armazenamento de mensagens no sistema.
- Binginds: Regras que determinam o fluxo das mensagens entre exchanges e filas.


## RabbitMQ vs. Outros Message Brokers

![alt text](image-2.png)

## Casos de Uso Comuns do RabbitMQ

- Processamento assíncrono de tarefas pesadas e em background. Exemplos:
  - Análise em grandes arquivos.
  - Geração de relatórios pesados
  - Envio massivo de e-mails
- Comunicação entre microserviços e sistemas legados.
- Balanceamento de carga entre servidores distribuídos.
- Coleta e processamento de dados IoT e telemetria.
- Streaming de eventos e centralização de logs (a partir da versão 3).
  - Agora pode receber eventos em tempo real, semelhança ao Apache Kafka.
- Arquiteturas de e-commerce para pedidos e estoque.

## Arquitetura do RabbitMQ

- O RabbitMQ funciona como um intermediário sofisticado para troca de mensagens entre produtores e consumidores.
- Sua arquitetura baseia-se na plataforma Erlang OTP, especializada em sistemas distibuídos de alta disponibilidade.

![alt text](image-3.png)

Esta arquitetura permite total desacoplamento entre produtores e consumidores, facilitando a escalabilidade e resiliência do sistema. Os componentes se comunicam de forma assíncrona sem dependências diretas.

### Virtual Hosts

- Isolamento lógico dentro de um broker RabbitMQ.
- Permite múltiplas aplicações ou ambientes (desenvolvimento, teste, produção) compartilharem o mesmo broker sem interferirem entre si.
- Cada virtual host possui suas próprias filas, exchanges e bindings.
- Por padrão, o RabbitMQ cria um virtual host chamado "/".

### Exchanges

- São os pontos de entrada para todas as mensagens no RabbitMQ. Eles determinam para quais filas as mensagens serão encaminhadas.
- A vantagem de existir uma `exchange` entre o `producer` e a `queue` é o fato de o `producer` não precisar ficar conhecendo uma fila nova toda vez que ela surge no contexto. Deste modo, o `producer` só se preocupa em garantir que a mensagem seja publicada no `exchange`.
- Tipos de exchanges:
  - Direct Exchange: Roteia mensagens para filas com base em uma chave de roteamento exata (ROUTING KEY).
  - Fanout Exchange: Roteia mensagens para todas as filas vinculadas, ignorando a chave de roteamento (ROUTING KEY).
  - Topic Exchange: Roteia mensagens para filas com base em padrões de chave de roteamento (ROUTING KEY), permitindo correspondência parcial.
  - Headers Exchange: Roteia mensagens com base em cabeçalhos personalizados em vez de chaves de roteamento (ROUTING KEY).
- Por padrão, o RabbitMQ possui uma exchange com nome `(AMQP default)` do tipo `direct` que não pode ser deletada.
- Posso criar minhas próprias exchanges e configurar filas para as mesmas:
  ```typescript
      const exchange = "nfe.direct";
      await channel.assertExchange(exchange, "direct", { durable: true }); // imutável; pode ser persistente (durable: true) x temporária
  ```
  ![alt text](image-17.png)
  ![alt text](image-18.png)

### Queues
- Fila é uma estrutura de dados que armazena mensagens até que sejam processadas por um consumidor.
- O RabbitMQ utiliza padrão de filas de forma assíncrona e com o conceito FIFO (First In, First Out), ou seja, o primeiro que entra é o primeiro que sai.
- As filas são criadas dentro de um virtual host. Quando nenhum virtual host é especificado, a fila é criada no virtual host padrão ("/").
- As filas podem ser configuradas com diferentes propriedades, como durabilidade, exclusividade e auto-delete.
  - Durable: Se definida como verdadeira, a fila persistirá mesmo após o broker ser reiniciado.
  - Transient: Se definida como falsa, a fila será perdida se o broker for reiniciado.
  - Exclusive: Se definida como verdadeira, a fila só pode ser acessada pela conexão que a criou e será deletada quando essa conexão for fechada.
  - Auto-delete: Se definida como verdadeira, a fila será deletada automaticamente quando o último consumidor se desconectar.
  - Arguments: Parâmetros adicionais que podem ser usados para configurar comportamentos específicos da fila.
- As filas podem ser vinculadas a exchanges para receber mensagens com base em regras de roteamento.
- As filas podem ser monitoradas e gerenciadas através da interface de gerenciamento do RabbitMQ ou via comandos CLI.
- Alguns argumentos comuns para criação de filas:
  - x-message-ttl: Define o tempo de vida das mensagens na fila.
  - x-dead-letter-exchange: Define uma exchange para onde as mensagens serão enviadas se forem rejeitadas ou expirarem.
  - x-max-length: Define o número máximo de mensagens que a fila pode conter.
  - x-max-priority: Define o nível máximo de prioridade das mensagens na fila.
  - x-expires: Define o tempo de vida da fila em si, após o qual será deletada se não houver atividade.
- States das filas:
  - Idle: A fila está criada, mas não possui consumidores conectados.
  - Running: A fila está ativa e possui consumidores conectados.
- Overview das filas:
  - Mensagens prontas (Ready): Mensagens que estão na fila e aguardam para serem entregues aos consumidores.
  - Mensagens não confirmadas (Unacknowledged): Mensagens que foram entregues aos consumidores, mas ainda não foram confirmadas como processadas.
  - Consumidores (Consumers): Número de consumidores atualmente conectados à fila.
  - Mensagens totais (Total): Soma das mensagens prontas e não confirmadas.

![alt text](image-4.png)
![alt text](image-7.png)

*Criando uma fila com argumentos personalizados:*
```javascript
channel.assertQueue('my_queue', { // assertQueue é idempotente, ou seja, se a fila já existir com as mesmas configurações/propriedades, ela não será recriada.
  durable: true, // A fila persistirá mesmo após o broker ser reiniciado (explícito, mas já é o comportamento padrão do RabbitMQ criar a fila como durável).
  arguments: {
    'x-message-ttl': 60000, // As mensagens na fila expirarão após 60 segundos
    'x-dead-letter-exchange': 'dead_letter_exchange' // As mensagens rejeitadas ou expiradas serão enviadas para esta exchange
  }
});
```

### Bindings

- São as regras que conectam exchanges a filas, definindo como as mensagens devem ser roteadas.
  - Exchange --- binding ---> Fila
- Características:
  - Conexão lógica: Estabelecem uma conexão lógica entre uma exchange e filas, declarando o interesse da fila em mensagens específicas.
  - Routing Keys: Utilizadas em exchanges direct e topic para filtrar mensagens com base em padrões de correspondência.
  - Filtragem: Determinam quais mensagens devem ser encaminhadas para cada fila associada.
  - Argumentos: Podem incluir parâmetros adicionais para personalizar o comportamento do roteamento.

## Dinâmica do fluxo de mensagens
- O produtor publica uma mensagem em uma exchange, especificando uma chave de roteamento (ROUTING KEY).
- A exchange recebe a mensagem e, com base em suas regras de roteamento (bindings), encaminha a mensagem para as filas associadas.
- Os consumidores conectados às filas recebem as mensagens e as processam de forma assíncrona, podendo confirmar o recebimento ou rejeitar a mensagem conforme necessário.
- O RabbitMQ garante a entrega das mensagens, mesmo em caso de falhas, utilizando mecanismos de persistência e confirmações.

![alt text](image-5.png)
![alt text](image-6.png)

## Consumers
- Os consumidores são as aplicações ou serviços que se conectam às filas do RabbitMQ para receber e processar mensagens.
- Características dos consumidores:
  - Conexão: Os consumidores estabelecem uma conexão com o broker RabbitMQ e se inscrevem em uma ou mais filas para receber mensagens.
  - Processamento assíncrono: Os consumidores processam as mensagens de forma assíncrona, permitindo que o sistema seja escalável e responsivo.
  - Acknowledgements: Os consumidores podem enviar confirmações (acknowledgements) para o broker para indicar que uma mensagem foi processada com sucesso, ou rejeitá-la se ocorreu um erro.
  - Concorrência: Vários consumidores podem se conectar à mesma fila, permitindo o processamento paralelo de mensagens e aumentando a capacidade de processamento do sistema.
  - Configurações: Os consumidores podem ser configurados com diferentes opções, como pré-busca (prefetch) para controlar o número de mensagens que um consumidor pode processar simultaneamente, e exclusividade (exclusive) para garantir que apenas um consumidor possa acessar uma fila específica.
- Confirmação no RabbitMQ
  - Pode ser manual (configurado pelo programador) ou automática (sinal enviado pela biblioteca utilizada).
  - `noAck: true` significa que o consumo será sem confirmação. O rabbit considerará que a mensagem foi processada assim que for entregue ao consumidor. Isso é útil para casos onde a perda de mensagens não é crítica, mas pode levar a mensagens perdidas se o consumidor falhar antes de processar a mensagem.
  - `noAck: false` significa que o consumo será com confirmação. O consumidor deve enviar uma confirmação (ack) para o broker após processar a mensagem. Se o consumidor falhar antes de enviar a confirmação, a mensagem será reentregue a outro consumidor.
  ![alt text](image-9.png)
- Sinal de vida: O heartbeat (pulsação) no RabbitMQ é um mecanismo de verificação de saúde usado para monitorar a conexão de rede entre a sua aplicação (produtor/consumidor) e o servidor RabbitMQ. Ele garante que conexões inativas ou interrompidas abruptamente sejam fechadas rapidamente. Quando uma aplicação se conecta ao RabbitMQ, elas negociam um tempo limite (timeout) — que é o tempo máximo que podem ficar sem trocar dados.Se nenhuma mensagem for enviada ou recebida durante esse período, o cliente e o servidor enviam pacotes pequenos de dados (os heartbeats) um para o outro.
  - Se o heartbeat for respondido: A conexão está ativa e saudável.
  - Se o heartbeat falhar: O RabbitMQ ou a biblioteca cliente entende que a outra ponta caiu (cabo de rede desconectado, travamento, etc.) e descarta a conexão, limpando os recursos.
  - Por que é importante?
    - Detecta falhas silenciosas.
    - Libera recursos no servidor.
    - Evita bloqueio de rede.
  - Configuração: O valor padrão sugerido pelo RabbitMQ é de 60 segundos.
    - Se você definir um tempo muito baixo, poderá sofrer com falsos positivos em redes lentas ou instáveis.
    - Se você definir um tempo muito alto, o sistema demorará para perceber se um consumidor travou.

![alt text](image-8.png)

## Padrão Pub/Sub
- O padrão garante que todos que se inscreveram vão receber a mensagem.
- O RabbitMQ permite o uso deste padrão através da configuração das filas com o recurso de binding (roteamento).
- Não há como trabalhar com este padrão sem que a comunicação seja assíncrona.
- Embora o exemplo abaixo utilize filas, é possível implementar o padrão pub/sub sem ter filas.

Vamos demonstrar esse padrão na prática com RabbitMQ: 

1. Primeiramente vamos configurar pelo menos duas filas para usar o mesmo tipo de exchange (fanout), que garante que todas as filas recebam uma cópia da mensagem:
![alt text](image-10.png)
![alt text](image-11.png)

2. Em seguida, no meu código fonte, preciso fazer o seguinte (código abaixo considera a utilização da lib node `amqplib`):
```typescript
// Conecta no RabbitMQ e cria o canal para conexão
const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
const channel = await connection.createChannel();

// Criar as filas caso ainda não existam (boa prática para garantir entrega)
await channel.assertQueue("hello");
await channel.assertQueue("products");

// Construção da mensagem
const messages = new Array(10000).fill(0).map((_, i) => (
    {
      id: i,
      name: `Product ${i}`,
      price: Math.floor(Math.random() * 100),
    }
));

// publicação da mensagem na exchange e não mais diretamente na fila
await Promise.all(
    messages.map((message) => {
        return channel.publish("amq.fanout", "", Buffer.from(JSON.stringify(message)), { // exchange, router key, message
          contentType: "application/json",
        });
    })
);
```
3. Executar o código e validar se ambas filas receberam a mensagem pelo fato de estarem utilizando binding exchange amq.fanout
```shell
npx nodemon src/05-pub-sub/producer.ts
```
![alt text](image-12.png)
![alt text](image-13.png)

## Padrão Work Queue (Fila de Trabalho)
- Este padrão implementa comunicação assíncrona e padrão queue, onde os produtores enviam mensagens para uma fila e os consumidores as processam de forma concorrente.
- O RabbitMQ suporta este padrão através da configuração de filas e do uso de acknowledgements para garantir que as mensagens sejam processadas corretamente pelos consumidores.
- Balanceamento de carga assíncrono: O padrão work queue é útil para distribuir tarefas pesadas entre múltiplos consumidores, permitindo que o sistema seja escalável e eficiente.
- Prefetch: O RabbitMQ permite um throughput alto a partir de `prefetch` para os workers trabalharem com lotes (batches) de mensagens, contudo, isso implica em riscos de lentidão/gargalos.
- Permite resiliência, pois se um consumidor falhar, a mensagem pode ser reentregue a outro consumidor.
- Diferente do padrão pub/sub, onde todos os consumidores recebem a mesma mensagem, no padrão work queue cada mensagem é processada por apenas um consumidor.
- Embora pareça estranho, é possível implementar o padrão `work queue` em conjunto com `pub/sub`. Por exemplo:
  - Um produtor envia mensagens para uma exchange do tipo fanout, que distribui as mensagens para múltiplas filas.
  - Cada fila tem múltiplos consumidores, que processam as mensagens de forma concorrente.
  - Dessa forma, cada mensagem é processada por apenas um consumidor, mas múltiplos consumidores podem processar mensagens diferentes da mesma fila, permitindo escalabilidade e eficiência no processamento de tarefas.
- Na prática não muda muita coisa, para aplicar o conceito tradicional de work queue, basta configurar as filas para receber mensagens de uma exchange do tipo direct, onde cada mensagem é roteada para uma fila específica com base na chave de roteamento (ROUTING KEY). Dessa forma, cada mensagem será processada por apenas um consumidor, mas múltiplos consumidores podem processar mensagens diferentes da mesma fila, permitindo escalabilidade e eficiência no processamento de tarefas. Segue print abaixo onde demonstra que havia uma fila chamada `work_queue` e 2 consumidores conectados para consumir lotes de 10 mensagens, ou seja, cada consumidor processava 10 mensagens por vez, totalizando 20 mensagens processadas simultaneamente:
![alt text](image-15.png)
![alt text](image-14.png)

## Padrão Request Reply (Requisição e Resposta)
- Este padrão implementa comunicação assíncrona e padrão RPC (Remote Procedure Call), onde os produtores enviam mensagens de requisição para uma fila e os consumidores processam essas mensagens e enviam mensagens de resposta de volta para os produtores.
- O RabbitMQ suporta este padrão através da configuração de filas e do uso de propriedades de mensagens, como `reply_to` (fila de resposta) e `correlation_id` (identificador de correlação para rastrear a resposta).
- O padrão request reply é útil para cenários onde um produtor precisa obter uma resposta de um consumidor após enviar uma mensagem de requisição, permitindo comunicação bidirecional entre sistemas.
- Permite que os produtores aguardem por respostas de forma assíncrona, sem bloquear a execução do sistema.
- Embora o padrão request reply seja tradicionalmente associado a comunicação síncrona, ele pode ser implementado de forma assíncrona utilizando o RabbitMQ, onde os produtores enviam mensagens de requisição e continuam com outras tarefas, enquanto os consumidores processam as mensagens e enviam as respostas de volta para os produtores quando estiverem prontas. Dessa forma, o sistema pode ser mais eficiente e escalável, permitindo que os produtores e consumidores operem de forma independente e assíncrona.
- Exemplo de outros protocolos que implementam o padrão request reply:
  - http: url + verbo
  - soap: xml-rpc + chamada
- Motivos de usar RabbitMQ com Request Reply para simular comunicação síncrona:
  - Interdependência (desacoplamento): Permite que os produtores e consumidores sejam independentes, facilitando a manutenção e evolução do sistema.
  - Escalabilidade: Permite que múltiplos consumidores processem requisições de forma concorrente, aumentando a capacidade de processamento do sistema.
  - Resiliência: Permite que as mensagens de requisição sejam reentregues a outros consumidores em caso de falhas, garantindo que as requisições sejam processadas mesmo em cenários de alta carga ou falhas temporárias.

![alt text](image-16.png)

*IMPORTANTE*
- Implementar esse padrão no RabbitMQ exige muito cuidado, principalmente no tratamento de resiliência, pois ser muito tolerante ou pouco tolerante a falhas pode impactar negativamente a aplicação.
- Devido ao motivo acima, é sempre necessário avaliar os prós/contras de implementar esse padrão no RabbitMQ, pois exige um esforço maior para implementar as tratativas de resiliência, por exemplo, como evitar acumulo/represália de mensagens caso o `client` tenha problemas no processamento durante o consumo das respostas publicadas pelo `server`? Esse entre outros questionamentos precisam ser considerados na hora de implementar esse padrão.

## Modelo de comunicação do protocolo AMQP
- O modelo de comunicação do AMQP é baseado em mensagens, onde os produtores enviam mensagens para exchanges, que as roteiam para filas, e os consumidores as processam.
- O protocolo define um conjunto de operações para publicar, consumir e gerenciar mensagens, filas e exchanges, permitindo uma comunicação eficiente e confiável entre sistemas distribuídos.
- O AMQP suporta transações, permitindo que os produtores e consumidores realizem operações atômicas para garantir a integridade dos dados e a consistência do sistema.

## Simulador de Comportamento de Filas com Rabbit MQ

https://tryrabbitmq.com/

![alt text](image-1.png)

## Confiabilidade

- Como garantir que as mensagens não serão perdidas no meio do caminho?
- Como garantir que as mensagens puderam ser processadas corretamente pelos consumidores?
- Recursos do RabbitMQ pensados para resolver tais situações
  - Consumer Acknowledgements: Confirmação de recebimento da mensagem pelo consumidor.
  - Publisher confirmations: Confirmação de que a mensagem foi recebida pelo broker.
  - Filas e mensagens duráveis: Persistência das mensagens no disco para evitar perda em caso de falhas. Pode impactar a performance.

### Consumer Acknowledgements

- Basic.Ack: Confirmação positiva de que a mensagem foi processada com sucesso.
- Basic.Reject: Rejeição da mensagem, com opção de reencaminhá-la para a fila (requeue) ou descartá-la.
- Basic.Nack: Similar ao Basic.Reject, mas pode ser usado para rejeitar múltiplas mensagens de uma vez.

### Publisher Confirms

- A mensagem deve possuir um identificador único (delivery tag). É através deste ID que o broker confirma o recebimento da mensagem.
- O identificador deve ser um número inteiro.
- É responsabilidade do sistema de informar um ID único para cada mensagem publicada.
- O broker confirma o recebimento da mensagem através dos métodos do consumer acknowledgements.

## Escalabilidade (Nodes)

- Como escalar o RabbitMQ para lidar com um volume maior de mensagens?
- Conceito de Nodes (nós) no RabbitMQ.
- Clustering: Agrupamento de múltiplos nodes para distribuir a carga de trabalho.
- Federation: Conexão entre diferentes brokers RabbitMQ para compartilhar mensagens.
- Shovel: Ferramenta para mover mensagens entre diferentes brokers RabbitMQ.

## Formato da mensagem
- O RabbitMQ é agnóstico em relação ao formato da mensagem, ou seja, ele não impõe um formato específico para as mensagens que são enviadas e recebidas.
- O formato da mensagem é definido pelo produtor e consumidor, e pode ser qualquer tipo de dado que possa ser representado como um buffer de bytes, como JSON, XML, texto simples, binário, etc.
- O RabbitMQ trata as mensagens como um fluxo de bytes, e é responsabilidade do produtor e consumidor interpretar corretamente o formato da mensagem para garantir a comunicação eficaz entre eles.

`Em resumo, o RabbitMQ armazena a mensagem em binário (buffer de bytes) e por este motivo traz flexibilidade de uso.`

## Prática

- Iniciar um projeto node.js com TypeScript:

```
npm init -y
npm install typescript ts-node @types/node --save-dev
npx tsc --init

```

- Configurar o tsconfig.json com as seguintes opções:

```
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

- Instalação do RabbitMQ via Docker compose docker-compose.yml. Comando para subir o container:

```
docker compose up -d

```

- Acesso à interface web de gerenciamento do RabbitMQ: http://localhost:15672/

- Instalar a lib do amqp para Node.js:

```
npm install amqplib

```

- Executar o projeto em modo desenvolvimento:

```
npm run dev

```

- Caso queira compilar o projeto:

```
npm run build`

```

- Caso queira rodar o projeto compilado:

```
npm start

```

### Implementando uma conexão simples producer e consumer com RabbitMQ usando Node.js e TypeScript
```
import amqp from 'amqplib';

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    // Conectar ao RabbitMQ
    const connection = await amqp.connect('amqp://localhost');
    console.log('Connected to RabbitMQ');

    // Criar um canal
    const channel = await connection.createChannel();
    console.log('Channel created');

    // Declarar uma fila
    const queue = 'hello';
    await channel.assertQueue(queue, { durable: false });
    console.log(`Queue "${queue}" declared`);

    // Enviar uma mensagem para a fila
    const message = 'Hello, RabbitMQ!';
    channel.sendToQueue(queue, Buffer.from(message));
    console.log(`Message sent: ${message}`);

    // Consumir mensagens da fila
    channel.consume(queue, (msg) => {
        if (msg) {
            console.log(`Message received: ${msg.content.toString()}`);
            channel.ack(msg); // Confirmar que a mensagem foi processada
        }
    });
    console.log('Waiting for messages...');
}
```
