let chai = require('chai'),
    should = chai.should();
const request = require('request')

describe('AAAAAAAAAAAAAAAAAAAA', () => {
    it('it should not POST a book without pages field', () => {
        const userId = "60928c88d6a1150458337e74";
        userId.should.be.a('string');
    });
    describe('111111111111111', () => {
        it('it should not POST a book without pages field', () => {
            const userId = "60928c88d6a1150458337e74";
            const res = request.post({
                headers: {'content-type' : 'application/x-www-form-urlencoded'},
                url:     'http://localhost:4000/events/all-my',
                body:    `userId=${userId}`
            }, (error, response, body) => {
                body = JSON.parse(body);
                body.should.have.property('status').eql('ok');
            });
                    // res.should.have.status(200);
                    // res.body.should.be.a('object');
                    // res.body.should.have.property('errors');
                    // res.body.errors.should.have.property('pages');
                    // res.body.errors.pages.should.have.property('kind').eql('required');
        });
    });
});