import amqplib from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL;

export const connectQueue = async () => {
  try {
    const connection = await amqplib.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue("code_submissions");
    return channel;
  } catch (error) {
    console.log("error" + error.message);
  }
};
