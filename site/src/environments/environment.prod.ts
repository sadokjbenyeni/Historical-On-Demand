export const environment = {
  production: true,
  api: 'https://hod.quanthouse.com/api/v1',
  gateway: "https://gateway01.hod.quanthouse.com",
  elastic: {
    instrument: {
      derivatives: 'derivatives',
      nonderivatives: 'nonderivatives',
      index: ['derivatives', 'nonderivatives'],
      type: ['productDB-derivatives', 'productDB-nonderivatives']
    },
    feed: {
      productdb: 'productdb',
      index: ['productdb'],
      type: ['productDB']
    }
  }
};
