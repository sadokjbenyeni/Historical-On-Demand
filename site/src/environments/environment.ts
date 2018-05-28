// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  api: 'http://hod-lab.quanthouse.com/api',
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
