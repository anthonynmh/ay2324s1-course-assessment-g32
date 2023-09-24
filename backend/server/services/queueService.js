const amqp = require('amqplib');
const url = 'amqp://localhost'

const generateUuid = () => {
  return "id" + Math.random().toString(16).slice(2);
};

const exitQueue = async (complexityType, id) => {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  await channel.assertQueue(complexityType, { durable: false });

  channel.sendToQueue(complexityType, Buffer.from(JSON.stringify({
    complexityType: complexityType,
    id: id,
    isExit: true
  })));

  setTimeout(() => {
    channel.close();
    connection.close();
  }, 500);
};

const joinQueue = async (complexityType, id) => {
  const responseQueue = complexityType + 'ResponseQueue';

  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  await channel.assertQueue(complexityType, { durable: false });
  await channel.assertQueue(responseQueue, { durable: false });

  // Create a unique Id for the request
  const correlationId = generateUuid();

  // Send the request to the queue
  channel.sendToQueue(complexityType, Buffer.from(JSON.stringify({
    complexityType: complexityType,
    id: id,
    replyTo: responseQueue,
    correlationId: correlationId,
    timestamp: Date.now(),
    isExit: false
  })));

  // Variable to check if the connection is closed
  var isClosed = false;

  return new Promise((resolve, reject) => {
    // Wait for the response with matching correlation ID
    channel.consume(responseQueue, (response) => {
      if (response.properties.correlationId === correlationId) {

        const responseBody = JSON.parse(response.content.toString());
        resolve(responseBody);

        channel.ack(response);

        // Close the connection
        isClosed = true;
        channel.close();
        connection.close();

      }
    }, { noAck: false });
  });
};

module.exports = {
  joinQueue,
  exitQueue
};
