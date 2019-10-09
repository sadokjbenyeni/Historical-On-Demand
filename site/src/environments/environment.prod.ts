export const environment = {
  production: true,
  api: 'https://hod.quanthouse.com/api',
  gateway: "http://gateway01.hod.quanthouse.com",
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
