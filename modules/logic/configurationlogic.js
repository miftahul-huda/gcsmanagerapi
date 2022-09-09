const { Sequelize, Model, DataTypes } = require('sequelize');
const { Op } = require("sequelize");

const CrudLogic = require("./crudlogic");

class ConfigurationLogic extends CrudLogic {

    static getModel()
    {
        const model = require("../models/configurationmodel");
        return model;
    }

    static getPk(){
        return "id";
    }

    static getWhere(search)
    {
        let where = {
            GCP_PROJECT : {
                [Op.like] : "" + search + ""
            } 
        }
        return where;
    }

    static getOrder()
    {
        let order = [['createdAt', 'DESC']];
        return order;
    }
}

module.exports = ConfigurationLogic;