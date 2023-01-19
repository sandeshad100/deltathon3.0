const dbConfig = require("../config/dbConfig.js");
const { Sequelize, DataTypes, QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("CONNECTED!!");
  })
  .catch((err) => {
    console.log("Error" + err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./userModel.js")(sequelize, DataTypes, bcrypt, crypto);

db.sequelize.sync({ force: false }).then(async () => {
  // Perform the insert operation here
  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS provinces (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) 
      )`,
    { type: sequelize.QueryTypes.CREATE }
  );
  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS districts (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        province_id INT NOT NULL REFERENCES provinces(id) ON DELETE CASCADE ON UPDATE CASCADE  ,
        name VARCHAR(255))`,
    { type: sequelize.QueryTypes.CREATE }
  );

  const provinces = await sequelize.query(" SELECT * FROM provinces ", {
    type: sequelize.QueryTypes.SELECT,
  });

  const districts = await sequelize.query(" SELECT * FROM districts ", {
    type: sequelize.QueryTypes.SELECT,
  });
  if (provinces.length === 0 && districts.length === 0) {
    await sequelize.query(
      " INSERT INTO provinces (id,name) VALUES(1,'Province 1'), (2,'Province 2'), (3,'Province 3'), (4,'Province 4'), (5,'Province 5'), (6,'Province 6'), (7,'Province 7') ",
      {
        type: sequelize.QueryTypes.INSERT,
      }
    );
    await sequelize.query(
      " INSERT INTO districts (id,province_id,name) VALUES(1,1,'Bhojpur'), (2,1,'Dhankuta'), (3,1,'Ilam'), (4,1,'Jhapa'), (5,1,'Morang'),(6,1,'Taplejung'), (7,1,'OkhalDunga'),(8,1,'Sunsari'), (9,2,'Bara'), (10,2,'Dhanusa'), (11,2,'Mahottari'), (12,2,'Parsa'), (13,3,'Bhaktapur'), (14,3,'Chitwan'), (15,3,'Dhading'), (16,3,'Kathmandu') ",
      {
        type: sequelize.QueryTypes.INSERT,
      }
    );
  } else if (districts.length === 0) {
    await sequelize.query(
      " INSERT INTO districts (id,province_id,name) VALUES(1,1,'Bhojpur'), (2,1,'Dhankuta'), (3,1,'Ilam'), (4,1,'Jhapa'), (5,1,'Morang'),(6,1,'Taplejung'), (7,1,'OkhalDunga'),(8,1,'Sunsari'), (9,2,'Bara'), (10,2,'Dhanusa'), (11,2,'Mahottari'), (12,2,'Parsa'), (13,3,'Bhaktapur'), (14,3,'Chitwan'), (15,3,'Dhading'), (16,3,'Kathmandu') ",
      {
        type: sequelize.QueryTypes.INSERT,
      }
    );
  } else if (provinces.length === 0) {
    await sequelize.query(
      " INSERT INTO provinces (id,name) VALUES(1,'Province 1'), (2,'Province 2'), (3,'Province 3'), (4,'Province 4'), (5,'Province 5'), (6,'Province 6'), (7,'Province 7') ",
      {
        type: sequelize.QueryTypes.INSERT,
      }
    );
  } else {
    console.log("already inserted");
  }
  console.log("yes re-sync done");
});

module.exports = db;
