const db = require('../models/sqliteConnect');
const log = require('../logger');
/**
 * @description store quote database
 * @module model/insertQuote
 * @param {String} random Date(long)
 * @param {int} price
 * @returns (Promise) err, success
 */
exports.insertQuote = (random, price) => new Promise((resolve, reject) => {
  log.debug('----------- run function insertQuote');
  const sql = `INSERT INTO quote VALUES('${random}',${price})`;
  log.debug(`SQL= ${sql}`);
  db.run(sql, (err) => {
    if (err) { reject(err); } else resolve('success');
  });
});
/**
 * @description Get price FROM table rate
 * @module model/getRate
 * @param {Obj} req.body destructuring into 4 param
 * @param {string} fromCountry
 * @param {string} toCountry
 * @param {int} amount
 * @param {string} unit
 */
exports.getRate = ({
  data:
  {
    origin: { address: { country_code: fromCountry } },
    destination: { address: { country_code: toCountry } },
    package: { grossWeight: { amount, unit } },
  },
}) =>
  new Promise((resolve, reject) => {
    log.debug('----------- run function getRate');
    if (!fromCountry || typeof fromCountry !== 'string') { reject(new Error('not from Country').message); return; }
    if (!toCountry || typeof toCountry !== 'string') { reject(new Error('not to Country').message); return; }
    if (!amount || typeof amount !== 'number') { reject(new Error('not amount').message); return; }
    if (!unit || typeof unit !== 'string') { reject(new Error('not unit').message); return; }
    const amountUnit = (unit === 'kg') ? amount * 1000 : amount;
    const sql = `SELECT id,price FROM rate WHERE ((${amountUnit}>minweight AND ${amountUnit}<=weight) OR (${amountUnit}>minweight AND weight IS NULL)) AND ('${fromCountry}'=fromcountry AND '${toCountry}'=tocountry);`;
    log.debug(`SQL= ${sql}`);
    db.get(sql, (err, row) => {
      if (err) {
        log.err(err);
        reject(new Error('sql not working!').message);
        return;
      }
      resolve(row);
    });
  });
/**
 * @module model/checkIdQuote
 * @param {Obj} req.body destructuring into 1 param
 * @param {string} id
 * @returns (Promise) id found => resolve, id noit found err
 * @description check id có tồn tại trong bảng quote không
 */
exports.checkIdQuote = ({
  data: {
    quote: {
      id,
    },
  },
}) => new Promise((resolve, reject) => {
  log.debug('----------- run function checkIdQuote');
  const sql = `SELECT amount FROM quote WHERE id=${id} ;`;
  log.debug(`SQL= ${sql}`);
  db.get(sql, (err, row) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(row);
  });
});

/**
 * @module model/insertShipment
 * @param {string} ref
 * @param {string} createAt
 * @param {float} cost
 * @param {Obj} data destructoring into 21 param
 * @returns (Promise) insert fail => err, success => obj data
 * @description SQL store shipment
 */
exports.insertShipment = (ref, createAt, cost, data) => new Promise((resolve, reject) => {
  const {
    data:
    {
      origin:
      {
        contact:
        { name: originContactName, email: originContactEmail, phone: originContactPhone },
        address:
        {
          country_code: originAddressCountryCode,
          locality: originAddressCountryLocality,
          postal_code: originAddressCountryPostalCode,
          address_line1: originAddressCountryAddressLine1,
          organisation: originAddressCountryOrganisation,
        },
      },
      destination:
      {
        contact:
        {
          name: destinationContactName,
          email: destinationContactEmail,
          phone: destinationContactPhone,
        },
        address: {
          country_code: destinationAddressCountryCode,
          locality: destinationAddressCountryLocality,
          postal_code: destinationAddressCountryPostalCode,
          address_line1: destinationAddressCountryPostalAddressLine1,
          organisation: destinationAddressCountryPostalOrganisation,
        },
      },
      package:
      {
        dimensions:
        {
          height: packageDimensionsHeight,
          width: packageDimensionsWidth,
          length: packageDimensionsLength,
          unit: packageDimensionsUnit,
        },
        grossWeight:
        {
          unit: packageGrossWeightUnti,
        },

      },

    },
  } = data;
  log.debug('insertShipment');
  let origin = 0;
  if (originAddressCountryOrganisation === true) {
    origin = 1;
  }
  let destination = 0;
  if (destinationAddressCountryPostalOrganisation === true) {
    destination = 1;
  }
  const sql = `INSERT INTO shipment VALUES(
    '${ref}',
    '${originContactName}',
    '${originContactEmail}',
    '${originContactPhone}',
    '${originAddressCountryCode}',
    '${originAddressCountryLocality}',
    '${originAddressCountryPostalCode}',
    '${originAddressCountryAddressLine1}',
     ${origin},
    '${destinationContactName}',
    '${destinationContactEmail}',
    '${destinationContactPhone}',
    '${destinationAddressCountryCode}',
    '${destinationAddressCountryLocality}',
    '${destinationAddressCountryPostalCode}',
    '${destinationAddressCountryPostalAddressLine1}',
     ${destination},
     ${packageDimensionsHeight},
     ${packageDimensionsWidth},
     ${packageDimensionsLength},
    '${packageDimensionsUnit}',
     ${cost},
    '${packageGrossWeightUnti}',
    '${createAt}'
  );`;
  log.debug(`SQL= ${sql}`);
  db.run(sql, (err) => {
    if (err) {
      reject(err); return;
    }
    resolve();
  });
});

/**
 * @description SQL get Shipment from table shipment
 * @module model/getShipment
 * @param {string} ref
 * @returns (Promise) all in table shipment id=ref
 */
exports.getShipment = ref => new Promise((resolve, reject) => {
  log.debug('----------- run function getShipment');
  const sql = `SELECT * FROM shipment WHERE ref=${ref} ;`;
  log.debug(`SQL= ${sql}`);
  db.get(sql, (err, row) => {
    if (err) {
      reject(err);
      return;
    }
    let obj;
    if (row !== undefined) {
      const originBoolean = () => {
        if (row.origin_address_organisation === 1) return true;
        return false;
      };
      const destinationBoolean = () => {
        if (row.destination_address_organisation === 1) return true;
        return false;
      };
      obj = {
        data:
        {
          ref: row.ref,
          origin:
          {
            contact:
            {
              name: row.origin_contact_name,
              email: row.origin_contact_email,
              phone: row.origin_contact_phone,
            },
            address:
            {
              country_code: row.origin_address_country_code,
              locality: row.origin_address_country_locality,
              postal_code: row.origin_address_country_postal_code,
              address_line1: row.origin_address_country_address_line1,
              organisation: originBoolean(),
            },
          },
          destination:
          {
            contact:
            {
              name: row.destination_contact_name,
              email: row.destination_contact_email,
              phone: row.destination_contact_phone,
            },
            address: {
              country_code: row.destination_address_country_code,
              locality: row.destination_address_country_locality,
              postal_code: row.destination_address_country_postal_code,
              address_line1: row.destination_address_country_postal_address_line1,
              organisation: destinationBoolean(),
            },
          },
          package:
          {
            dimensions:
            {
              height: row.package_dimensions_height,
              width: row.package_dimensions_width,
              length: row.package_dimensions_length,
              unit: row.package_dimensions_unit,
            },
            grossWeight:
            {
              amount: row.package_grossWeight_amount,
              unit: row.package_grossWeight_unti,
            },
          },
        },
      };
    }
    resolve(obj);
  });
});


const nok = {
  data: [
    {
      status: 'NOK',
      message: 'Shipment not found',
    }],
};
const ok = {
  data: [
    {
      status: 'OK',
      message: 'shipment has been deleted',
    }],
};
/**
 * @description SQL SELECT id = ref in tabel shipment
 * @module model/checkRef
 * @param {string} ref id in table shipment
 * @returns (Promise) ref có tồn tại trong ref không
 */
exports.checkRef = ref =>
  new Promise((resolve, reject) => {
    log.debug('----------- run function checkRef');
    const sql = `SELECT ref FROM shipment WHERE ref='${ref}' ;`;
    log.debug(`SQL= ${sql}`);
    db.get(sql, (err, row) => {
      if (err || row === undefined) {
        reject(nok);
        log.error(err);
        return;
      } resolve('success');
    });
  });
/**
 * @description SQL delete id=ref in table shipment
 * @module model/deletedb
 * @param {string} ref id in table shipment
 * @returns (Promise) can't delete => reject(obj), delete success =>resolve(obj)
 */
exports.deletedb = ref => new Promise((resolve, reject) => {
  log.debug('----------- run function deletedb');
  const sql = `DELETE FROM shipment WHERE ref='${ref}'`;
  log.debug(`SQL= ${sql}`);
  db.run(sql, (err) => {
    if (err) {
      reject(nok);
      log.error(err);
      return;
    }
    resolve(ok);
  });
});
