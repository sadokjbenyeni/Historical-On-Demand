export const environment = {
  production: false,
  api: 'http://localhost:3000/api/v1',
  gateway: 'http://gateway01.hod-lab.quanthouse.com',
  elastic: {
    instrument: {
      derivatives: 'derivatives_6',
      nonderivatives: 'nonderivatives_6',
      index: ['derivatives_6', 'nonderivatives_6'],
      type: ['productDB-derivatives', 'productDB-nonderivatives']
    },
    feed: {
      productdb: 'productdb_6',
      index: ['productdb_6'],
      type: ['productDB']
    }
  }
};