const { Model, DataTypes } = require('sequelize');

class ConfigurationModel extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            ALLOWED_EXTENSIONS: DataTypes.STRING,
            GCP_PROJECT: DataTypes.STRING        
        }, 
        { sequelize, modelName: 'configuration', tableName: 'configuration', force: force });
    }
}

module.exports = ConfigurationModel;