const { Model, DataTypes } = require('sequelize');

class APIKeyModel extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            apiKey: DataTypes.STRING
        }, 
        { sequelize, modelName: 'apikey', tableName: 'apikey', force: force });
    }
}

module.exports = APIKeyModel;