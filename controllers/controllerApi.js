const model = require('../models/model');
const log = require('../logger');
/**
 * @module controllerApi/controllerGetQuote
 * @param {obj} req
 * @param {obj} res
 */
module.exports.controllerGetQuote = (req, res) => {
  log.info('=====>>>>> call api GetQuote');
  log.debug(JSON.stringify(req.body));
  model.getRate(req.body)
    .then((row) => {
      if (row === undefined) {
        res.send(404, 'not rate');
        log.info('not rate!');
        return;
      }
      const random = new Date().getTime();
      model.insertQuote(random, row.price).catch((err) => {
        res.send(500, 'sql can not insert quote working!');
        log.error(err);
      }).then(() => {
        const obj = {
          data: [
            {
              id: random.toString(),
              amount: row.price, // USDs
            }],
        };
        res.send(obj);
        log.debug(JSON.stringify(obj));
        log.info('send Rate success!');
      });
    })
    .catch((err) => {
      res.send(400, err);
      log.error(err);
    });
};
/**
 * @module controllerApi/controllerCreatShipment
 * @param {obj} req
 * @param {obj} res
 */
exports.controllerCreatShipment = (req, res) => {
  log.info('=====>>>>> call api Create shipment');
  log.debug(JSON.stringify(req.body));
  model.checkIdQuote(req.body).then((row) => {
    if (row === undefined) {
      res.send(404, 'id not found!');
      log.info('id not found!');
      return;
    }
    const cost = row.amount;
    let ref = new Date().getTime().toString();
    ref = ref.substring(0, 10);
    const createAt = new Date().toJSON();
    const data = req.body;
    model.insertShipment(ref, createAt, cost, data).catch((err) => {
      res.send(500, 'Sql insert not working!');
      log.error(err);
    }).then(() => {
      const obj = {
        data: [
          {
            ref, // Random number in 10 character
            created_at: createAt,
            cost, // USD
          }],
      };
      res.send(201, obj);
      log.debug(obj);
      log.info('send create success!');
    });
  }).catch((err) => {
    res.send(500, 'Sql not working!');
    log.error(err);
  });
};
/**
 * @module controllerApi/controllerGetShipment
 * @param {obj} req null
 * @param {obj} res
 * @param {string} ref lấy từ header
 */
exports.controllerGetShipment = (req, res) => {
  log.info('=====>>>>> call api Get Shipment');
  log.debug(req.headers);
  const ref = req.get('ref');
  if (isNaN(ref)) {
    res.send('400', 'refid not is number!');
    log.info('refid not is number!');
    return;
  }
  model.getShipment(ref).then((obj) => {
    if (obj === undefined) {
      res.send(404, 'not found ref id!');
      log.info('not found ref id!');
      return;
    }
    res.send(200, obj);
    log.info('getShipment success!');
  }).catch((err) => {
    res.send(404, 'SQl not working!');
    log.error(err);
  });
};
/**
 * @module controllerApi/controllerDeleteShipment
 * @param {obj} req null
 * @param {obj} res
 * @param {string} ref lấy từ header
 */
exports.controllerDeleteShipment = (req, res) => {
  log.info('=====>>>>> call api Delete Shipment');
  log.debug(req.headers);
  const ref = req.get('ref');
  Promise.all([model.checkRef(ref), model.deletedb(ref)]).then((ok) => {
    res.send(200, ok[1]);
    log.info('delete success!');
  }).catch((nok) => {
    res.send(404, nok);
    log.info('can not delete');
  });
};
