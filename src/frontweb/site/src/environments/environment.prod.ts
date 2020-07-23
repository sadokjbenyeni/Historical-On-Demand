export const environment = {
  production: true,
  api: 'https://hod.quanthouse.com/api',
  gateway: "https://gateway01.hod.quanthouse.com",
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
