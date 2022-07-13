require('dotenv').config();
const log = require('../helpers/logger');
const rabbitmq = require('../helpers/rabbit');
const express = require('express');
const app = express();


const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/', async (req, res) => {
	try {
		const {data} = req.body;
        const {cfg} = req.body;
        let snapshot = {};
		
		/*if (!data) {
            res.status(401).json('Error missing data property');
            return;
        }
        if (!cfg) {
            res.status(401).json('Error missing cfg property');
            return;
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
	    await ch.consume(queueResult.queue, msg => {
	        log.info('consumer msg:', msg.content.toString());
	        ch.ack(msg);
	    });
	    await ch.close();
	    res.json(data);
		
	} catch (e) {
        log.error(`ERROR: ${e}`);
        res.status(500).json(e);
    }
});

app.listen(PORT, () => log.info('Service up in port', PORT));