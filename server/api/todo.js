const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');

const Order = mongoose.model('Order');
const Pool = mongoose.model('Pool');

router.param('cmd', function (req, res, next, id) {
   return res.sendStatus(422);
   return next();
});


// API à appeler pour récupérer les traitement à effectuer
router.get('/', (req, res) => {
  Pool.find({
    $or:[
        {
            onetime: 1,
            status:{
              $in:["validated", "exporting"]
            }
        },
        {
            subscription:1,
            status:{
                $in:["validated", "exporting"]
            },
            searchdate: { $lte: new Date() }
        }
    ]
  })
  .then(result=>{
    res.status(200).json(result);
  });
  // Order.find({'state': { $in: [ 'validated', 'toretry' ] }}, {_id:false, products:true })
  // .then((ps) => {
  //   ps.forEach( r => {
      // r.products.forEach(p => {
      //   let qhid = "";
      //   let bd = "";
      //   let ed = "";
      //   let empile = false;

      //   if (p.status === 'validated' || p.status === 'toretry') {
      //     let dateRef = new Date();
      //     if(p.code !== ''){  
      //       qhid = p.code;
      //     }
      //     if(p.qhid != "" ){
      //       qhid = p.qhid;
      //     }
      //     if(p.onetime === 1){
      //       bd = yyyymmdd(p.begin_date);
      //       ed = yyyymmdd(p.end_date);
      //       empile = true;
      //     }
      //     if(p.subscription === 1){
      //       // vérification date expired est inférieur à la date actuelle - 1
      //       // (J-1 du début de la subscription)
      //       // Si ok alors calcul de la date avec verifWeek
      //       // let dateweek = verifWeek(new Date()).yyyymmdd();
      //       let dateweek = verifWeek(new Date());
      //       // if(new Date(dateRef.yyyymmdd()) <= new Date(p.end_date)){
      //       if(dateweek <= new Date(p.end_date)){
      //         bd = ed = dateweek.yyyymmdd();
      //         empile = true;
      //         // empile = false;
      //       } 
      //       if(p.links && p.links.length > 0){
      //         p.links.forEach(datlink=>{
      //           if(dateweek === datlink.createLinkDate.yyyymmdd()){
      //             empile = false;
      //           }
      //         });
      //       }
      //     }
      //     if(empile){
      //       addPool({
      //         index: p.index,
      //         id_cmd: p.id_undercmd,
      //         onetime: p.onetime,
      //         subscription: p.subscription,
      //         eid: p.eid,
      //         contractID: p.contractid,
      //         qhid: qhid,
      //         quotation_level: p.dataset,
      //         begin_date: bd,
      //         end_date: ed,
      //         status: p.status // peut prendre activated, toretry, nodata, active, inactive
      //       });
      //     }
      //   }
      // });
  //     return true;
  //   });
  // })
  // .then(()=>{
    // Pool.find({},{_id:false, updatedAt:false, createdAt: false, __v: false}).then(result => {
    //   res.status(200).json(result);
    // });
  //   res.status(200).json([]);
  // });
});

router.get('/test2', (req,res)=>{
  Order.find({
    "products.id_undercmd" : "4-mycompany-20180917-1", 
    "products.links.links" : {
      $elemMatch: {
        link:"q2018-09-21_1027_L1-Trades.csv.gz|2018-09-21_1027_Referential.csv.gz|2018-09-21_1027_ticksizes.csv"
      }
    }
  }, {'products.links':1})
  .then(items=>{
    if(items.length>0){
      res.status(520).json({Error:"Update was denied because duplicate data"});  
    }
    return items;
  })
  .then(items=>{
    res.status(200).json(items);
  });
});

router.post('/test', (req,res)=>{
  Pool.find({'status': { $in: [ 'validated', 'exporting' ] }})
  .then(items=>{
    res.status(200).json(items);
  });
});

// API Permettant au JOB de changer le status du pool qu'il souhaite traiter : running, exporting
router.put('/torun', (req, res) => {
  Order.updateOne(
    { 'products.id_undercmd'  : req.body.id_cmd.split('|')[0] },
    {
      $set: { 'products.$.status' : req.body.status }
    }
  )
  .then((p)=>{
    if(p.nModified === 1){
      updatePool(req.body.id_cmd, req.body.status);
      res.status(201).json({"ok":"ok"});
    }
    else {
      res.status(404).json({"error":"NOT FOUND"});
    }
  })
  .catch( (err)=>{
    res.json(err);
  });
});

// API Permettant en cas de scratch serveur JOB ou arrêt/redémarrage de JOB de repêcher les pools en status running
// Traitement à effectuer en premier au lancement ou relancement du JOB
router.get('/running', (req, res) => {
  Pool.find({status:{ $in:["running"] }}).then(result => {
    res.status(200).json(result);
  })
  .catch( (err)=>{
    res.status(200).json(err);
  });
});


// API Permettant de valider ou non l'export et de mettre à jour la commande soit avec le status active ou failed.
// Cette appel dépile le Pool
router.put('/finish', (req, res) => {
  let status = '';
  // Order.find({
  //   "products.id_undercmd" : req.body.id_cmd.split('|')[0], 
  //   "products.links.links" : {
  //     $elemMatch: {
  //       link: recup.req.link
  //     }
  //   }
  // }, {'products.links':1})
  // .then(items=>{
  //   if(items.length>0){
  //     res.status(520).json({Error:"Update was denied because duplicate data"});  
  //   }
  //   return items;
  // })
  // .then(()=>{
    Order.findOne( { products: { $elemMatch: { "id_undercmd": req.body.id_cmd.split('|')[0] } } }, { 'products.$': true, _id:false  })
    .then((result)=>{
      if(!result || result.products.length === 0){
        res.status(404).json({"error":"NOT FOUND"});
      }
      else {
        let products = result.products[0];
        if(products.subscription === 1){
          status = 'validated';
        } else {
          status = req.body.status;
        }
        return {status: status, req: req.body};
      }
    })
    .then(recup => {
      Order.updateOne(
        { 'products.id_undercmd'  : req.body.id_cmd.split('|')[0] },
        {
          $set: { 'products.$.status' : recup.status },
          $push: {
            "products.$.links": {
              createLinkDate: new Date(),
              status: recup.req.status,
              links: recup.req.link,
              path: req.body.id_cmd,
              nbDownload: 0
            },
            "products.$.logs" : {
              referer: 'job',
              status: recup.req.status,
              state_description: recup.req.state_description,
              log: recup.req.log,
              date: new Date()
            }
          }
        }
      )
      .then(()=>{
        removePool(recup.req.id_cmd);
        res.status(201).json({"ok":"ok"});
      })
      .catch( (err)=>{
        console.dir(err);
        res.json(err);
      });
    });
  // })
  // .catch( (err)=>{
  //   console.dir(err);
  //   res.json(err);
  // });
});


// Fonctions utiles
addPool = (data => {
  Pool.findOne({ id_cmd: data.id_cmd, begin_date: data.begin_date }).then(p=>{
    if(!p){
      Pool.create(data).then(p=>{ return true;});
    }
  });
});

updatePool = ((id, status) => {
  Pool.updateOne({id_cmd: id},{ $set: { status: status } }).then(p=>{ return true;});
});

removePool = (id => {
  Pool.remove({id_cmd: id}).then(p=>{ return true;});
});

Date.prototype.previousDay = function() {
  this.setDate(this.getDate() - 1);
  return this;
};

Date.prototype.nextDay = function() {
  this.setDate(this.getDate() + 1);
  return this;
};

verifWeek = function(dt) {
  dt.previousDay();
  while(dt.getDay() === 0 || dt.getDay() === 6){
    dt.previousDay();
  }
  return dt;
};

Date.prototype.yyyymmdd = function() {
  let mm = this.getMonth() + 1; // getMonth() is zero-based
  let dd = this.getDate();

  return [
    this.getFullYear(),
    (mm>9 ? '-' : '-0') + mm,
    (dd>9 ? '-' : '-0') + dd
  ].join('');
};

yyyymmdd = function(d) {
  let dat = d.split('-');
  let mm = parseInt(dat[1]);
  let dd = parseInt(dat[2]);

  return [
    dat[0],
    (mm>9 ? '-' : '-0') + mm,
    (dd>9 ? '-' : '-0') + dd
  ].join('');
};

module.exports = router;