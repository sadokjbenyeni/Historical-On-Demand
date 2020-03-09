export const environment = {
  production: false,
  api: 'http://localhost:3000/api',
  gateway: 'http://gateway01.hod-lab.quanthouse.com',
  elastic: {
    instrument: {
      derivatives: 'derivatives_5',
      nonderivatives: 'nonderivatives_5',
      index: ['derivatives_5', 'nonderivatives_5'],
      type: ['productDB-derivatives', 'productDB-nonderivatives']
    },
    feed: {
      productdb: 'productdb_5',
      index: ['productdb_5'],
      type: ['productDB']
    }
  }
};
