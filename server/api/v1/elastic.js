const router = require('express').Router();


const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://10.0.10.102:9200' })


client.ping({}, { requestTimeout: 20000 }, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!'); 
        console.error(error);
    }
    else { 
        console.log('elasticsearch cluster is up!'); 
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
        console.trace(err.message);
    });
});

module.exports = router;
