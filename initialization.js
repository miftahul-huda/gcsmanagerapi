//const LoggerModel  = require( './modules/models/loggermodel')

const { Sequelize, Model, DataTypes } = require('sequelize');
const process = require('process');
const APIKeyModel = require("./modules/models/apikeymodel")
const ConfigurationModel = require("./modules/models/configurationmodel")
const HistoryModel = require("./modules/models/historymodel")



const sequelize = new Sequelize(process.env.DBNAME, process.env.DBUSER, process.env.DBPASSWORD, {
    host: process.env.DBHOST,
    dialect: process.env.DBENGINE ,
    logging: false
});


class Initialization {
    static async initializeDatabase(){

        let force = false;
        APIKeyModel.initialize(sequelize, force)
        ConfigurationModel.initialize(sequelize, force)
        HistoryModel.initialize(sequelize, force)
        await sequelize.sync();
    }
}

module.exports = Initialization



