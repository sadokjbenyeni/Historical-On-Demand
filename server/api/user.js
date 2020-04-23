const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');
const crypto = require("crypto");
const request = require('request');
const fs = require('fs');

const User = mongoose.model('User');
const Order = mongoose.model('Order');
const Role = mongoose.model('Role');

const config = require('../config/config.js');
const mailer = require('./mailer.js');
const URLS = config.config();
const admin = config.admin();
const domain = config.domain();
const PHRASE = config.phrase();
const DNLFILE = config.dnwfile();
const algorithm = 'aes256';
var idd = "";

router.param('user', function (req, res, next, id) {
   if (!id.match(/^[0-9a-fA-F]{24}$/)) {
       return res.sendStatus(422);
   }
   idd = id;
   return next();
});

router.get('/', (req, res) => {
    if(URLS.indexOf(req.headers.referer) !== -1){
        User.find().sort({"firstname":1, "lastname":1})
       .then((users) => {
           if (!users) { return res.sendStatus(404); }
           return res.status(200).json({users: users});
       });
    }
    else{
        return res.status(404).end();
    }
});

router.get('/count/', (req, res) => {
    if(URLS.indexOf(req.headers.referer) !== -1){
        User.count()
       .then((count) => {
           return res.status(200).json({nb: count});
       });
    }
    else{
        return res.sendStatus(404);
    }
});

router.get('/cpt/', (req,res)=>{
    User.findOne({nbSession:1},{_id:false, count:true})
    .then((nb) => {
        return res.status(200).json(nb);
    });
});

router.get('/:user', (req, res) => {
    // let test = req.headers.referer.replace(idd, "");
    // if(URLS.indexOf(test) !== -1){
        User.findOne({_id: Object(req.params.user)}, {password:false})
        .then((user) => {
            if (!user) { res.status(202).json({}) }
            return res.status(200).json({user:user});
        });
    // }
    // else{
    //     return res.sendStatus(404);
    // }
});

router.post('/info', (req, res) => {
    // let test = req.headers.referer.replace(idd, "");
    // if(URLS.indexOf(test) !== -1){
        let u = {};
        // u['_id'] = false;
        if (req.body.field !== 'password' && typeof req.body.field === 'string') { return res.sendStatus(404); }
        if (req.body.field && typeof req.body.field === 'string') {
            u[req.body.field] = true;
        }
        if (typeof req.body.field === 'object') {
            req.body.field.forEach(field => {
                u[field] = true;
            });
        }
        User.findOne( { token: req.body.token }, u )
        .then((user) => {
            if (!user) { res.status(202).json({}) }
            return res.status(200).json({user:user});
        });
    // }
    // else{
    //     return res.sendStatus(404);
    // }
});

//Create Account User
router.post('/', (req, res) => {
    User.count()
    .then((count) => {
        let user = new User();
        let d = new Date();

        let concatoken = req.body.password+req.body.email+ d;
        let pass = req.body.password;
        let cipher = crypto.createCipher(algorithm, pass);
        let crypted = cipher.update(PHRASE,'utf8','hex');
        crypted += cipher.final('hex');
        user.password = crypted;
        cipher = crypto.createCipher(algorithm, concatoken);
        crypted = cipher.update(PHRASE,'utf8','hex');
        crypted += cipher.final('hex');
        user.token = crypted;
        
        user.id = count + 1;
        user.email = req.body.email;
        user.lastname = req.body.lastname;
        user.firstname = req.body.firstname;
        user.job = req.body.job;
        user.companyName = req.body.companyName;
        user.companyType = req.body.companyType?req.body.companyType:'';
        user.country = req.body.country?req.body.country:'';
        user.address = req.body.address?req.body.address:'';
        user.postalCode = req.body.postalCode?req.body.postalCode:'';
        user.city = req.body.city?req.body.city:'';
        user.region = req.body.region?req.body.region:'';
        user.phone = req.body.phone?req.body.phone:'';
        user.website = req.body.website?req.body.website:'';
        
        user.save((err, u)=>{
            if (err) return console.error(err);
            request.post({ url: domain + '/api/mail/inscription', form: {email: req.body.email, token: user.token} }, ( err, httpResponse, body )=> {
                if(err) console.error(err);
                res.status(201).json({account:true});
            });
        });
    });
});

router.post('/logout/', (req, res) => {

    User.updateOne({token:req.body.token}, {$set:{islogin:false}})
    .then((val)=> {
        res.status(200).json({});
    })
    .catch((err)=> {
        console.error(err);
    });
});

router.post('/islogin/', (req, res) => {
    User.findOne({token:req.body.token, islogin:true},{_id:false, islogin:true, roleName:true})
    .then((val)=> {
        if(val){
            const pattern = /\/[0-9a-fA-F]{24}$/;
            let page = req.body.page.replace(pattern, '');
            Role.count({pages: new RegExp(page, "i"), name: { $in: val.roleName } })
            .then((role)=>{
                res.status(200).json({islogin:val.islogin, role:role});
            });
        }
        else {
            res.status(200).json({islogin:false, role:role});
        }
    })
    .catch((err)=> {
        console.error(err);
    });
});

router.post('/check/', (req, res) => {
    let cipher = crypto.createCipher(algorithm,req.body.pwd);
    let crypted = cipher.update(PHRASE,'utf8','hex');
    crypted += cipher.final('hex');

    User.findOne(
        { email:req.body.email, password:crypted},
        {
            id:true,
            roleName:true,
            email:true,
            token:true,
            state:true,
            currency:true,
            payment:true,
            vat:true,
            address: true,
            city: true,
            sameAddress: true,
            postalCode: true,
            country: true,
            addressBilling: true,
            cityBilling: true,
            postalCodeBilling: true,
            countryBilling: true
        })
    .then((user) => {
        if (!user) { res.status(202).json({user:false, message:'Invalid Password or User Not Found'}) }
        if(user.state === 1){
            User.updateOne({email:req.body.email}, {$set:{islogin:true}})
            .then((val)=>{
                res.status(200).json({user});
            });
        } else {
            res.status(202).json({message:'Your account is not activated'})
        }
    });    
});

router.post('/activation/', (req, res) => {
    User.update( { token: req.body.token }, { $set:{ state: 1 } } )
    .then((user) => {
        if (user.nModified === 0) { res.status(200).json({message: "User Not Found"}) }
        res.status(200).json({message: "Your account is activated. You can connect"});
    })
    .catch(err=>{
        console.error(err);
    });
});

router.post('/suspendre/', (req, res) => {  
    User.update( { token: req.body.token }, { $set:{ actif: -1 } } )
    .then((user) => {
        if (!user) { res.status(200).json({}) }
        return res.status(200).json({valid:true});
    });    
});
            
router.post('/verifmail/', (req, res) => {
    // if(URLS.indexOf(req.headers.referer) !== -1){
        User.findOne({email: req.body.email}, {_id:false, token:true})
        .then((user) => {
            if (!user) { 
                return res.status(200).json({valid: false, message:"This email does not exist"});
            }
            return res.status(200).json({valid:true, token: user.token});
        });
    // }
    // else{
    //     return res.sendStatus(404);
    // }
});

router.post('/preferBilling/', (req, res) => {
    let modify = {};
    if(req.body.currency){
        modify.currency = req.body.currency;
    }
    if(req.body.payment){
        modify.payment = req.body.payment;
    }
    // if(req.body.vat){
        modify.vat = req.body.vat;
    // }
    if(req.body.addressBilling){
        modify.addressBilling = req.body.addressBilling;
    }
    if(req.body.cityBilling){
        modify.cityBilling = req.body.cityBilling;
    }
    if(req.body.countryBilling){
        modify.countryBilling = req.body.countryBilling;
    }
    if(req.body.postalCodeBilling){
        modify.postalCodeBilling = req.body.postalCodeBilling;
    }
    if(req.body.checkvat){
        modify.checkvat = req.body.checkvat;
    }
    User.updateOne({token:req.body.token}, {$set:modify})
    .then((val)=> {
        res.status(200).json({});
    })
    .catch((err)=> {
        console.error(err);
    });
});


router.delete('/:user', (req, res) => {
    req.user.remove()
    .then(()=>{
        return res.sendStatus(200);
    })
});



router.put('/', (req, res) => {
    // if(URLS.indexOf(req.headers.referer) !== -1){
        let user = {};
        if (!req.body.id && !req.body.nom && req.body.id == undefined && req.body.nom == undefined ) {
            res.sendStatus(422);
        }
        if (!req.body.id.match(/^[0-9a-fA-F]{24}$/)) {
            res.sendStatus(422);
        }
        if (req.body.password){
            let cipher = crypto.createCipher(algorithm,req.body.password);
            let crypted = cipher.update(PHRASE,'utf8','hex');
            crypted += cipher.final('hex');
            user.password = crypted;
        }
        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;
        user.email = req.body.email;
        user.job = req.body.job;
        user.companyName = req.body.companyName;
        user.companyType = req.body.companyType;
        user.website = req.body.website;
        user.address = req.body.address;
        user.postalCode = req.body.postalCode;
        user.city = req.body.city;
        user.region = req.body.region;
        user.idCountry = req.body.idCountry;
        user.country = req.body.country;
        user.cgv = req.body.cgv;
        user.commercial = req.body.commercial;
        user.phone = req.body.phone;
        user.sameAddress = req.body.sameAddress;
        user.addressBilling = req.body.addressBilling;
        user.postalCodeBilling = req.body.postalCodeBilling;
        user.cityBilling = req.body.cityBilling;
        user.idCountryBilling = req.body.idCountryBilling;
        user.countryBilling = req.body.countryBilling;
        user.vat = req.body.vat;
        user.checkvat = req.body.checkvat;
        user.currency = req.body.currency;
        user.payment = req.body.payment;
        user.islogin = req.body.islogin;
        user.token = req.body.token;
        user.nbSession = req.body.nbSession;
        user.roleName = req.body.roleName;
        user.role = req.body.role;
        user.state = req.body.state;

        User.update({_id: req.body.id}, {$set: user})
        .then((user) => {
                res.status(201).json({message:"Your account has been updated"});
                return;
        })
        .catch((e)=>{
            console.error(e);
        });
    // }
    // else{
    //     return res.sendStatus(404);
    // }   
});

router.put('/mdpmodif/', (req, res) => {
    // if(URLS.indexOf(req.headers.referer.substring(0,25)) !== -1){
        if (!req.body.pwd && !req.body.token && req.body.pwd == undefined && req.body.token == undefined ) {
            res.sendStatus(422);
        }
        let cipher = crypto.createCipher(algorithm,req.body.pwd);
        let crypted = cipher.update(PHRASE,'utf8','hex');
        crypted += cipher.final('hex');

        User.update({token:req.body.token}, {$set:{password:crypted}})
        .then((user) => {
            return res.status(201).json({});
        })
    // }
    // else{
    //     return res.sendStatus(404);
    // }   
});

router.post('/list', (req, res) => {
  let sort = {};
  for (var i = 0; i < req.body.order.length; i++) {
    sort[req.body.columns[req.body.order[i].column].data] = req.body.order[i].dir;
  }
  User.count({state: {$ne:''}, state: {$exists:true}}).then((c) => {
      let search = {};
      if (req.body.search.value !== '') {
        search['$or'] = [
          { firstname: new RegExp(req.body.search.value, "i") },
          { lastname: new RegExp(req.body.search.value, "i") },
          { roleName: new RegExp(req.body.search.value, "i") }
        ];
      }
      User.count(search).then((cf) => {
        User.find(search)
          .skip(req.body.start)
          .limit(req.body.length)
          .sort(sort)
          .then((users) => {
              if (!users) { return res.status(404); }
              return res.status(200).json({recordsFiltered: cf, recordsTotal: c, draw:req.body.draw, listusers: users});
          });
      });
  });
});

router.get('/download/:token/:id/:file', (req, res) => {
    let valid = false;
    User.findOne({ token: req.params.token }, { _id: true })
        .then((u) => {
            if (u) {
                let idUser = JSON.parse(JSON.stringify(u._id));
                Order.findOne({ idUser: idUser, 'products.id_undercmd': req.params.id.split('|')[0] })
                    .select({ 'products.$.id_undercmd': 1, '_id': false })
                    .then(o => {
                        if (o) {
                            o.products[0].links.forEach(lk => {
                                if (lk.status === 'active') {
                                    lk.links.forEach(link => {
                                        let rgx = RegExp(req.params.file);
                                        valid += rgx.test(link.link);
                                    })
                                }
                            })
                        } else {
                            res.status(404).end();
                        }
                    })
                    .then(() => {
                        if (valid) {
                            res.download('/mapr/client_exports/' + req.params.id + '/' + req.params.file);
                        } else {
                            res.status(404).end();
                        }
                    });
            } else {
                res.status(404).end();
            }
        })
        .catch(err => {
            res.status(500).end();
        });
});


function download(url, dest, cb) {
    // on créé un stream d'écriture qui nous permettra
    // d'écrire au fur et à mesure que les données sont téléchargées
    const file = fs.createWriteStream(dest);
  
    // on lance le téléchargement
    const sendReq = request.get(url);
  
    // on vérifie la validité du code de réponse HTTP
    sendReq.on('response', (response) => {
      if (response.statusCode !== 200) {
        return cb('Response status was ' + response.statusCode);
      }
    });
  
    // au cas où request rencontre une erreur
    // on efface le fichier partiellement écrit
    // puis on passe l'erreur au callback
    sendReq.on('error', (err) => {
      fs.unlink(dest);
      cb(err.message);
    });
  
    // écrit directement le fichier téléchargé
    sendReq.pipe(file);
  
    // lorsque le téléchargement est terminé
    // on appelle le callback
    file.on('finish', () => {
      // close étant asynchrone,
      // le cb est appelé lorsque close a terminé
      file.close(cb);
    });
  
    // si on rencontre une erreur lors de l'écriture du fichier
    // on efface le fichier puis on passe l'erreur au callback
    file.on('error', (err) => {
      // on efface le fichier sans attendre son effacement
      // on ne vérifie pas non plus les erreur pour l'effacement
      fs.unlink(dest);
      cb(err.message);
    });
  };

module.exports = router;