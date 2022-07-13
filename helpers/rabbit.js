require('dotenv').config();
const amqp = require('amqplib');
const log = require('./logger');

module.exports.getConnection = async () => {

    try{
        connection = await amqp.connect(process.env.URI_RABBITMQ);

        log.info('rabbitmq connect success');
        return connection;
    }catch (e){
        log.error(`ERROR on rabbit: ${e}`);
    }
};
