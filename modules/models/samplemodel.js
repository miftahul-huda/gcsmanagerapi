const { Model, DataTypes } = require('sequelize');

class SampleModel extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            logDate: DataTypes.DATE,
            logModule: DataTypes.STRING,
            logContent: DataTypes.STRING,
            logApplication: DataTypes.STRING,
            logType: DataTypes.STRING,
            username: DataTypes.STRING
        }, 
        { sequelize, modelName: 'sample', tableName: 'sample', force: force });
    }
}

module.exports = SampleModel;