- to restore the sales collection use the following command
: mongorestore -p oM7Max5ohSoh2vu -u qh_nodejs_user --db histodataweb --collection sales ./createsalescollection/sales.bson

PS : -p -u options are used for uat environment ( db with login password )

- to restore the roles collection use the following command: mongoimport -p oM7Max5ohSoh2vu -u qh_nodejs_user --db histodataweb --collection roles --file ./addsupportrole/roles.json --jsonArray
