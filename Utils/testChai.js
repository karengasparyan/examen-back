let chai = require('chai'),
    should = chai.should();
// let chaiHttp = require('chai-http');
let server = require('../server');
// let should = chai.should();
// const mocha = require('mocha')
//
// chai.use(chaiHttp);

describe('AAAAAAAAAAAAAAAAAAAA', () => {
    describe('/POST book', () => {
        it('it should not POST a book without pages field', (done) => {
            const userId = "60928c88d6a1150458337e74";
            chai.request(server)
                .post('http://localhost:4000/events/all-my')
                .send({userId})
                .end((err, res) => {
                    res.should.have.status(200);
                    // res.body.should.be.a('object');
                    // res.body.should.have.property('errors');
                    // res.body.errors.should.have.property('pages');
                    // res.body.errors.pages.should.have.property('kind').eql('required');
                    done();
                });
        });
    });
    it('it should not POST a book without pages field', () => {
        const userId = "60928c88d6a1150458337e74";
        userId.should.be.a('string');
    });
});