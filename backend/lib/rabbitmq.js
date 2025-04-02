import amqplib from "amqplib";

const RABBITMQ_URL = "amqp://localhost"; // Update if running remotely

export const connectQueue = async () => {
  const connection = await amqplib.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue("code_submissions");
  return channel;
};
