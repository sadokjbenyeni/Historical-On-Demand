export const environment = {
  production: false,
  api: 'https://hod-lab.quanthouse.com/api/v1',
  gateway: "http://gateway01.hod-lab.quanthouse.com",
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
