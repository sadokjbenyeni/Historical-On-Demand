***************** -p -u options are used for uat environment ( db with login password ) ******************

- Restore the sales collection use the following command:
> mongorestore -p oM7Max5ohSoh2vu -u qh_nodejs_user --db histodataweb --collection sales ./createsalescollection/sales.bson

- Restore the roles collection use the following command:
> mongoimport -p oM7Max5ohSoh2vu -u qh_nodejs_user --db histodataweb --collection roles --file ./addsupportrole/roles.json --jsonArray

- Create user in mongodb:
> db.createUser({ "user": "qh_nodejs_user", "pwd": "oM7Max5ohSoh2vu", "roles": [ { "role": "readWrite", "db": "histodataweb" }] })

- Create invoices collection use the following command in mongo db:
> mongo -p oM7Max5ohSoh2vu -u qh_nodejs_user --db histodataweb
> use histodataweb

