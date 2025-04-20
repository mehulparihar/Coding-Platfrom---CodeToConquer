import amqplib from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const MAX_RETRIES = 10;
const RETRY_DELAY = 3000; // 3 seconds

export const connectQueue = async () => {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      console.log(`Connecting to RabbitMQ at ${RABBITMQ_URL} (attempt ${attempt + 1})`);
      const connection = await amqplib.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();
      await channel.assertQueue("code_submissions");
      console.log("Connected to RabbitMQ successfully");
      return channel;
    } catch (error) {
      console.error("RabbitMQ connection error:", error.message);
      attempt++;
      await new Promise((res) => setTimeout(res, RETRY_DELAY));
    }
  }

  throw new Error("Failed to connect to RabbitMQ after multiple attempts");
};
