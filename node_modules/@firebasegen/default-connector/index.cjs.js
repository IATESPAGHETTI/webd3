const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'webdev2',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

