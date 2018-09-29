// During the test the env variable is set to test
process.env.NODE_ENV = 'test';
// Require the dev-dependencies
const model = require('../models/model');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../Server');
const data = require('./data');

chai.should();
chai.use(chaiHttp);
// Our parent block
let idget = '';
let amountget = 0;
describe('qoute', () => {
  describe('/POST qoute', () => {
    const resData = JSON.parse(JSON.stringify(data.data1));
    it('it should POST qoute', (done) => {
      chai.request(server)
        .post('/client/getquote')
        .send(resData)
        .end((err, res) => {
          idget = res.body.data[0].id;
          amountget = res.body.data[0].amount;
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data[0].should.have.property('id');
          res.body.data[0].should.have.property('amount');
          res.body.data[0].id.should.be.a('string');
          res.body.data[0].amount.should.be.a('number');
          done();
        });
    });
    it('it should POST qoute Invalid JSON', (done) => {
      chai.request(server)
        .post('/client/getquote')
        .send(data.data2)
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
    it('it should unit = gram', (done) => {
      resData.data.package.grossWeight.unit = 'g';
      chai.request(server)
        .post('/client/getquote')
        .send(resData)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data[0].should.have.property('id');
          res.body.data[0].should.have.property('amount');
          res.body.data[0].id.should.be.a('string');
          res.body.data[0].amount.should.be.a('number');
          done();
        });
    });
    it('it should unit not is string', (done) => {
      resData.data.package.grossWeight.unit = 12;
      chai.request(server)
        .post('/client/getquote')
        .send(resData)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it('it should unit undefined', (done) => {
      resData.data.package.grossWeight = {
        amount: 100,
      };
      chai.request(server)
        .post('/client/getquote')
        .send(resData)
        .end((err, res) => {
          res.should.have.status(400);
          res.text.should.eql('not unit');
          done();
        });
    });
    it('it should amount not is number', (done) => {
      resData.data.package.grossWeight = {
        amount: 'string a',
        unit: 100,
      };
      chai.request(server)
        .post('/client/getquote')
        .send(resData)
        .end((err, res) => {
          res.should.have.status(400);
          res.text.should.eql('not amount');
          done();
        });
    });
    it('it should amount undefined', (done) => {
      resData.data.package.grossWeight = {
        unit: 100,
      };
      chai.request(server)
        .post('/client/getquote')
        .send(resData)
        .end((err, res) => {
          res.should.have.status(400);
          res.text.should.eql('not amount');
          done();
        });
    });
    it('it should to country not is string', (done) => {
      resData.data.destination.address = {
        country_code: 12,
        locality: 'Marseille',
        postal_code: '13006',
        address_line1: '175 Rue de Rome',
      };
      chai.request(server)
        .post('/client/getquote')
        .send(resData)
        .end((err, res) => {
          res.should.have.status(400);
          res.text.should.eql('not to Country');
          done();
        });
    });
    it('it should amount undefined', (done) => {
      resData.data.destination.address = {
        locality: 'Marseille',
        postal_code: '13006',
        address_line1: '175 Rue de Rome',
      };
      chai.request(server)
        .post('/client/getquote')
        .send(resData)
        .end((err, res) => {
          res.should.have.status(400);
          res.text.should.eql('not to Country');
          done();
        });
    });
    it('it should from country undefined', (done) => {
      resData.data.origin.address = {
        locality: 'Anzin',
        postal_code: '59410',
        address_line1: 'Rue Jean Jaures',
      };
      chai.request(server)
        .post('/client/getquote')
        .send(resData)
        .end((err, res) => {
          res.should.have.status(400);
          res.text.should.eql('not from Country');
          done();
        });
    });
    it('it should from country not is string', (done) => {
      resData.data.origin.address = {
        country_code: 23,
        locality: 'Anzin',
        postal_code: '59410',
        address_line1: 'Rue Jean Jaures',
      };
      chai.request(server)
        .post('/client/getquote')
        .send(resData)
        .end((err, res) => {
          res.should.have.status(400);
          res.text.should.eql('not from Country');
          done();
        });
    });
    it('it should rate not found', (done) => {
      const resData2 = JSON.parse(JSON.stringify(data.data1));
      resData2.data.origin.address.country_code = 'KB';
      chai.request(server)
        .post('/client/getquote')
        .send(resData2)
        .end((err, res) => {
          res.should.have.status(404);
          res.text.should.eql('not rate');
          done();
        });
    });
  });

  module.exports = {
    idget,
    amountget,
  };
  let CreateRef;
  describe('/POST create shipment', () => {
    it('it should create shipment success', (done) => {
      const resData3 = JSON.parse(JSON.stringify(data.data3));
      resData3.data.quote = { id: idget };
      resData3.data.package.grossWeight.amount = amountget;
      chai.request(server)
        .post('/client/creatshipment')
        .send(resData3)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data[0].should.have.property('ref').with.lengthOf(10);
          res.body.data[0].should.have.property('created_at');
          res.body.data[0].should.have.property('cost').eql(amountget);
          res.body.data[0].ref.should.be.an('String');
          res.body.data[0].created_at.should.be.an('String');
          res.body.data[0].cost.should.be.an('number');
          CreateRef = res.body.data[0].ref;
          done();
        });
    });
    it('it should create shipment not found id', (done) => {
      const resData3 = JSON.parse(JSON.stringify(data.data3));
      resData3.data.quote = { id: '121212' };
      resData3.data.package.grossWeight.amount = amountget;
      chai.request(server)
        .post('/client/creatshipment')
        .send(resData3)
        .end((err, res) => {
          res.should.have.status(404);
          res.text.should.be.a('string').eql('id not found!');
          done();
        });
    });
  });
  describe('/GET get shipment', () => {
    it('it should get shipment success', (done) => {
      const resData4 = JSON.parse(JSON.stringify(data.data3));
      resData4.data.ref = CreateRef;
      resData4.data.package.grossWeight.amount = amountget;
      chai.request(server)
        .get('/client/getshipment')
        .set('ref', CreateRef)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.have.property('ref').eql(CreateRef);
          res.body.should.eql(resData4);
          done();
        });
    });
    it('it should get shipment not refid', (done) => {
      chai.request(server)
        .get('/client/getshipment')
        .set('ref', '1212')
        .end((err, res) => {
          res.should.have.status(404);
          res.text.should.eql('not found ref id!');
          done();
        });
    });
    it('it should get shipment refid is not a number', (done) => {
      chai.request(server)
        .get('/client/getshipment')
        .set('ref', '1221s')
        .end((err, res) => {
          res.should.have.status(400);
          res.text.should.eql('refid not is number!');
          done();
        });
    });
  });
  describe('/DELETE delete shipment', () => {
    it('it should delete shipment not sucess', (done) => {
      chai.request(server)
        .delete('/client/deleteshipment')
        .set('ref', '152210')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.data[0].should.have.property('status').eql('NOK');
          res.body.data[0].should.have.property('message').eql('Shipment not found');
          done();
        });
    });
    it('it should delete shipment not sucess', (done) => {
      chai.request(server)
        .delete('/client/deleteshipment')
        .set('ref', CreateRef)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.data[0].should.have.property('status').eql('OK');
          res.body.data[0].should.have.property('message').eql('shipment has been deleted');
          done();
        });
    });
  });
  describe('When insertQuote is called', () => {
    it('it should insertQuote not sucess', (done) => {
      const promise = model.insertQuote(2132312, 23.12);
      promise.then((res) => {
        res.should.eql('success');
      });
      done();
    });
    it('it should insertQuote not sucess', (done) => {
      const promise = model.insertQuote('asd', 'asd');
      promise.catch((res) => {
        res.code.should.eql('SQLITE_ERROR');
      });
      done();
    });
  });
});
