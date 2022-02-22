require('dotenv').config();
const amqp = require('amqplib');
const NotesService = require('./NotesService');
const MailSender = require('./MailSender');
const Listener = require('./listener');

const rabbitUser = process.env.RABBITMQ_USER;
const rabbitPassword = process.env.RABBITMQ_PASSWORD;
const rabbitHost = process.env.RABBITMQ_HOST;

const init = async () => {
  const notesService = new NotesService();
  const mailSender = new MailSender();
  const listener = new Listener(notesService, mailSender);

  const connection = await amqp.connect(`amqp://${rabbitUser}:${rabbitPassword}@${rabbitHost}`);
  const channel = await connection.createChannel();

  await channel.assertQueue('export:notes', {
    durable: true,
  });

  channel.consume('export:notes', listener.listen, { noAck: true });
};
init();
