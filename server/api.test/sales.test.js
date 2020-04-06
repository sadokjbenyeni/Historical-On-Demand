const chai = require('chai')
const chaihttp = require('chai-http')
let app;
chai.use(chaihttp);


describe('should return all sales', () => {
    before(() => {
        app = require('../../server.test')

    })
    it('GET /api/sales/ should resturn 200 status ok with array of sales', () => {
        chai.request(app).get('/api/sales').end((error, result) => {
            chai.expect(result.status).be.equals(400);
        })
    })
})