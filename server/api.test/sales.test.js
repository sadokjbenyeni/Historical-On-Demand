const chai = require('chai')
const chaihttp = require('chai-http')
const app = require('../../server')
chai.use(chaihttp);


describe('should return all sales', () => {
    it('GET /api/sales/ should resturn 200 status ok with array of sales', () => {
        chai.request(app).get('/api/sales').end((error, result) => {
            chai.expect(result.status).be.equals(202);
        })
    })
})