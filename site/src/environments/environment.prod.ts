export const environment = {
  production: true,
  api: 'http://hod.quanthouse.com/api',
  elastic: {
    instrument: {
      derivatives: 'derivatives_3',
      nonderivatives: 'nonderivatives_3',
      index: ['derivatives_3', 'nonderivatives_3'],
      type: ['productDB-derivatives', 'productDB-nonderivatives']
    },
    feed: {
      productdb: 'productdb_3',
      index: ['productdb_3'],
      type: ['productdb_3']
    }
  }
};
