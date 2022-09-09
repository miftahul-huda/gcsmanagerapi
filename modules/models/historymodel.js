const { Model, DataTypes } = require('sequelize');

class HistoryModel extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            eventDate: DataTypes.DATE,
            eventTitle: DataTypes.STRING,
            eventType: DataTypes.STRING,
            document: DataTypes.STRING
        }, 
        { sequelize, modelName: 'history', tableName: 'history', force: force });
    }
}

module.exports = HistoryModel;