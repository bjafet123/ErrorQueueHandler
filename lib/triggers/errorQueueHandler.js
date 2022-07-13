const log = require('../../helpers/logger');
const rabbitmq = require('../../helpers/rabbit');

const ERROR_PROPERTY = 'Error missing property';

module.exports.process = async function processTrigger(msg, cfg, snapshot = {}) {
	try {		 
		
		log.info("Inside mysqlConnector()");
        log.info("Msg=" + JSON.stringify(msg));
        log.info("Config=" + JSON.stringify(cfg));
        log.info("Snapshot=" + JSON.stringify(snapshot));
		
		let {data} = msg;
		
		/*if (!data) {
            this.emit('error', `${ERROR_PROPERTY} data`);
            throw new Error(`${ERROR_PROPERTY} data`);
        }*/

        const exchangeDLX = 'exchangeDLX';
        const queueDLX = 'queueDLX'
		
		let connection = await rabbitmq.getConnection();
		const ch = await connection.createChannel();
	    await ch.assertExchange(exchangeDLX, 'direct', {durable: true});
	    const queueResult = await ch.assertQueue(queueDLX, {
	        exclusive: false,
	    });
	    await ch.bindQueue(queueResult.queue, exchangeDLX);
	    await ch.consume(queueResult.queue, qmsg => {
	        log.info('consumer msg:', qmsg.content.toString());
	        this.emit('data', {data: "Message processed"});
	        ch.ack(qmsg);
	    });
	    await ch.close();
        
        snapshot.lastUpdated = new Date();
        log.info(`New snapshot: ${snapshot.lastUpdated}`);
        this.emit('snapshot', snapshot);

        log.info('Finished execution');
        this.emit('end');
		
	} catch (e) {
        log.error(`ERROR: ${e}`);
        this.emit('error', e);
        await rabbitmq.producerMessage(e);
    }
};
