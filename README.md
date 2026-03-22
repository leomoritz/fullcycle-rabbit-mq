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
- Tipos de exchanges:
  - Direct Exchange: Roteia mensagens para filas com base em uma chave de roteamento exata (ROUTING KEY).
  - Fanout Exchange: Roteia mensagens para todas as filas vinculadas, ignorando a chave de roteamento (ROUTING KEY).
  - Topic Exchange: Roteia mensagens para filas com base em padrões de chave de roteamento (ROUTING KEY), permitindo correspondência parcial.
  - Headers Exchange: Roteia mensagens com base em cabeçalhos personalizados em vez de chaves de roteamento (ROUTING KEY).

### Queues

- Fila é uma estrutura de dados que armazena mensagens até que sejam processadas por um consumidor.
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

### Bindings

- São as regras que conectam exchanges a filas, definindo como as mensagens devem ser roteadas.
  - Exchange --- binding ---> Fila
- Características:
  - Conexão lógica: Estabelecem uma conexão lógica entre uma exchange e filas, declarando o interesse da fila em mensagens específicas.
  - Routing Keys: Utilizadas em exchanges direct e topic para filtrar mensagens com base em padrões de correspondência.
  - Filtragem: Determinam quais mensagens devem ser encaminhadas para cada fila associada.
  - Argumentos: Podem incluir parâmetros adicionais para personalizar o comportamento do roteamento.

## Dinâmica do fluxo de mensagens

## Modelo de comunicação do protocolo AMQP

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
