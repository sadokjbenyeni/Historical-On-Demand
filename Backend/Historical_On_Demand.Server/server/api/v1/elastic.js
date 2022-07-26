const router = require('express').Router();
const LoggerFactory = require('../../../logger.js');
const logger = new LoggerFactory().createLogger('Elastic');
const config = require('../../config/config');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ nodes: global.environment.hostsES })


client.ping({}, { requestTimeout: 20000 }, function (error) {
    if (error) {
        logger.warn({ message: 'elasticsearch cluster is down!', className: 'Elastic API' });
        logger.error({ message: JSON.stringify(error), className: 'Elastic API' });
        logger.close();
    }
    else {
        logger.info({ message: 'elasticsearch cluster is up!', className: 'Elastic API' });
        logger.close();
    }
});

router.post('/', (req, res) => {
    client.search({
        index: req.body.index,
        type: req.body.type,
        _source: req.body.fields,
        body: {
            query: req.body.query,
            aggs: req.body.aggs,
            size: req.body.size,
            from: req.body.from,
        }
    }).then(function (resp) {
        res.json(resp.body);
    }, function (err) {
        req.logger.error({ message: err.message, className: 'Elastic API' });
        req.logger.error(err);
    });
});

module.exports = router;
