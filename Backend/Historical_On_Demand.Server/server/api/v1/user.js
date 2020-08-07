const router = require("express").Router();
const mongoose = require("mongoose");
const crypto = require("crypto");
const request = require("request");
const fs = require("fs");
const UserMailService = require("../../service/userMailerService");
const User = mongoose.model("User");
const Order = mongoose.model("Order");
const Role = mongoose.model("Role");

//services
const userService = require("../../service/userService");
const jwtService = require("../../service/jwtService");

const config = require("../../config/config.js");
const URLS = config.config();
const domain = global.environment.domain;
const PHRASE = global.environment.phrase;

const algorithm = "aes256";

// router.param('user', function (req, res, next, id) {
//     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//         return res.sendStatus(422);
//     }
//     idd = id;
//     return next();
// });
router.get("/profile/", async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "No Token provided in header" });
  }
  try {
    const userId = jwtService.verifyToken(req.headers.authorization).id;
    const user = await userService.getUserById(userId);
    if (!user) {
      res.status(202).json({});
    }
    return res.status(200).json({ user: user });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

router.get("/", (req, res) => {
  if (URLS.indexOf(req.headers.referer) !== -1) {
    User.find()
      .sort({ firstname: 1, lastname: 1 })
      .then((users) => {
        if (!users) {
          return res.sendStatus(404);
        }
        return res.status(200).json({ users: users });
      });
  } else {
    return res.status(404).end();
  }
});

router.get("/count/", (req, res) => {
  if (URLS.indexOf(req.headers.referer) !== -1) {
    User.countDocuments().then((count) => {
      return res.status(200).json({ nb: count });
    });
  } else {
    return res.sendStatus(404);
  }
});

router.get("/cpt/", (req, res) => {
  User.findOne({ nbSession: 1 }, { _id: false, count: true }).then((nb) => {
    return res.status(200).json(nb);
  });
});

router.post("/info", async (req, res) => {
  // let test = req.headers.referer.replace(idd, "");
  // if(URLS.indexOf(test) !== -1){
  let u = {};
  // u['_id'] = false;
  if (req.body.field !== "password" && typeof req.body.field === "string") {
    return res.sendStatus(404);
  }
  if (req.body.field && typeof req.body.field === "string") {
    u[req.body.field] = true;
  }
  if (typeof req.body.field === "object") {
    req.body.field.forEach((field) => {
      u[field] = true;
    });
  }
  const userId = jwtService.verifyToken(req.headers.authorization).id;
  var user = await userService.getUserById(userId);
  if (!user) {
    return res.status(202).json({});
  }
  return res.status(200).json({ user: user });

  // }
  // else{
  //     return res.sendStatus(404);
  // }
});

//Create Account User
router.post("/", async (req, res) => {
  var count = await User.countDocuments().exec();
  let user = new User();
  let d = new Date();
  let concatoken = req.body.password + req.body.email + d;
  let pass = req.body.password;
  let cipher = crypto.createCipher(algorithm, pass);
  let crypted = cipher.update(PHRASE, "utf8", "hex");
  crypted += cipher.final("hex");
  user.password = crypted;
  cipher = crypto.createCipher(algorithm, concatoken);
  crypted = cipher.update(PHRASE, "utf8", "hex");
  crypted += cipher.final("hex");
  user.token = crypted;
  user.id = count + 1;
  user.email = req.body.email;
  user.lastname = req.body.lastname;
  user.firstname = req.body.firstname;
  user.job = req.body.job;
  user.companyName = req.body.companyName;
  user.companyType = req.body.companyType ? req.body.companyType : "";
  user.country = req.body.country ? req.body.country : "";
  user.address = req.body.address ? req.body.address : "";
  user.postalCode = req.body.postalCode ? req.body.postalCode : "";
  user.city = req.body.city ? req.body.city : "";
  user.region = req.body.region ? req.body.region : "";
  user.phone = req.body.phone ? req.body.phone : "";
  user.website = req.body.website ? req.body.website : "";

  user.save((error, info) => {
    if (error) {
      req.logger.error({
        message: JSON.stringify(error),
        error: error,
        className: "User API",
      });

      return req.logger.error({
        message: JSON.stringify(error),
        className: "User API",
      });
    }
    try {
      var mailer = new UserMailService(req.logger, user);
      mailer.SendMailForInscription();
      return res.status(200).json({ mail: true });
    } catch (error) {
      req.logger.error({ message: error.message, className: "Mailer API" });
      req.logger.error({
        message: JSON.stringify(error) + "\n" + error.stacktrace,
        className: "User API",
      });
      return res.status(501).json({ mail: false });
    }
  });
});

router.post("/logout/", (req, res) => {
  var userId = "";
  try{
    userId = jwtService.decodeToken(req.headers.authorization).id;
  }
  catch(error){
    req.logger.error({ message: err.message, className: "User API" });
    req.logger.debug({ message: err.stack, className: "User API" });
    return res.status(401).json({message: "Token not valid, please clear your browser's cache and storage"});
  }
  if(userId == null || userId === ""){
    req.logger.warn({ message: 'userId not found in the token', className: "User API" });
    req.logger.debug({ message: 'JWT Token: '+req.headers.authorization, className: "User API" });
    return res.status(200).json({message: "success"});
  }
  User.updateOne({ _id: userId }, { $set: { islogin: false } })
    .then((val) => {
      res.status(200).json({});
    })
    .catch((err) => {
      req.logger.error({ message: err.message, className: "User API" });
      req.logger.error({ message: err.stack, className: "User API" });
    });
});

router.post("/islogin/", async (req, res) => {
  req.logger.debug({ message: "isLogin calling...", className: "User API" });
  try {
    var token = jwtService.verifyToken(req.headers.authorization);
    if (token) {
      const pattern = /\/[0-9a-fA-F]{24}$/;
      let page = req.body.page.replace(pattern, "");
      var hasRole = await Role.find({
        pages: new RegExp(page, "i"),
        name: { $in: token.roleName },
      })
        .countDocuments()
        .exec();
      // req.logger.debug("[Security] data: { isLogin: " + user.islogin + ", hasRole: " + token.hasRole + " }");
      return res.status(200).json({ role: hasRole });
    } else {
      req.logger.warn("[Security] Access denied, no user found");
      return res.status(401).json({ islogin: false });
    }
  } catch (error) {
    if(error.name === 'TokenExpiredError'){
      req.logger.debug({ message: 'Access denied: ' + error.message ,className: "User API"});   // todo change in debug
      return res.status(401).json({ message: "Your token expired, please sign-in." + req.headers.loggerToken });
    }
    req.logger.error({message: error.message + "\n" + error.stack,className: "User API"});
    return res.status(401).json({ message: "Your token expired, please sign-in." + req.headers.loggerToken });
  }
});

router.post("/check/", async (req, res) => {
  let cipher = crypto.createCipher(algorithm, req.body.pwd);
  let crypted = cipher.update(PHRASE, "utf8", "hex");
  crypted += cipher.final("hex");
  var user = await User.findOne({
    email: req.body.email,
    password: crypted,
  }).exec();
  if (!user) {
    req.logger.error({
      message: "Invalid Password or User Not Found",
      className: "User API",
    });
    return res
      .status(403)
      .json({ message: "Invalid Password or User Not Found" });
  }
  if (user.state === 1) {
    await User.updateOne({ _id: user._id }, { $set: { islogin: true } }).exec();
    var userDto = {
      id: user._id,
      roleName: user.roleName,
    };
    const token = jwtService.createTokentoUser(userDto);
    return res.status(200).json({ token: token });
  } else {
    req.logger.error({
      message: `account of user ${user._id} is on state ${user.state}`,
    });
    return res.status(401).json({ message: "Your account is not activated" });
  }

  //     .catch (error => {
  //     req.logger.error({ message: JSON.stringify(error), className: "User API" });
  //     return res.status(403).json({ user: false, message: 'Invalid Password or User Not Found' })
  // });
});

router.post("/activation/", async (req, res) => {
  req.logger.info("activating account " + req.body.token + " ...");
  try {
    await User.update({ token: req.body.token }, { $set: { state: 1 } }).exec();
  } catch (error) {
    req.logger.error({
      message: err.message,
      error: err,
      className: "User API",
    });
    req.logger.error({ message: JSON.stringify(error), className: "User API" });
    //req.logger.debug({ message: JSON.stringify(err), error: err, className: "User API"});
    return res.status(503).json({
      message:
        "User Not Found, please contact support with '" +
        req.headers.loggerToken +
        "'",
    });
  }
  var user = await User.findOne({ token: req.body.token }).exec();
  if (user.nModified === 0) {
    req.logger.warn("User not found: " + req.body.token);
    return res.status(403).json({
      message:
        "User Not Found, please contact support with '" +
        req.headers.loggerToken +
        "'",
    });
  }
  new UserMailService(req.logger, user).activated();
  return res
    .status(200)
    .json({ message: "Your account is activated. You can connect" });
});

router.post("/suspendre/", (req, res) => {
  User.update({ token: req.body.token }, { $set: { actif: -1 } }).then(
    (user) => {
      if (!user) {
        res.status(200).json({});
      }
      return res.status(200).json({ valid: true });
    }
  );
});

router.post("/verifmail/", async (req, res) => {
  var user = await User.findOne(
    { email: req.body.email },
    { _id: false, token: true }
  ).exec();
  if (!user) {
    return res
      .status(200)
      .json({ valid: false, message: "This email does not exist" });
  }
  return res.status(200).json({ valid: true });
});

router.post("/preferBilling/", (req, res) => {
  let modify = {};
  if (req.body.currency) {
    modify.currency = req.body.currency;
  }
  if (req.body.payment) {
    modify.payment = req.body.payment;
  }
  // if(req.body.vat){
  modify.vat = req.body.vat;
  // }
  if (req.body.addressBilling) {
    modify.addressBilling = req.body.addressBilling;
  }
  if (req.body.cityBilling) {
    modify.cityBilling = req.body.cityBilling;
  }
  if (req.body.countryBilling) {
    modify.countryBilling = req.body.countryBilling;
  }
  if (req.body.postalCodeBilling) {
    modify.postalCodeBilling = req.body.postalCodeBilling;
  }
  if (req.body.checkvat) {
    modify.checkvat = req.body.checkvat;
  }
  User.updateOne({ token: req.body.token }, { $set: modify })
    .then((val) => {
      res.status(200).json({});
    })
    .catch((err) => {
      req.logger.error({ message: err.message, className: "User API" });
      req.logger.error(err);
    });
});

router.delete("/:user", (req, res) => {
  req.user.remove().then(() => {
    return res.sendStatus(200);
  });
});

router.put("/", (req, res) => {
  if (!req.headers.authorization) {
  }
  // if(URLS.indexOf(req.headers.referer) !== -1){
  let user = {};
  // if (!req.body.id && !req.body.nom && req.body.nom == undefined) {
  //     res.sendStatus(422);
  // }

  const userId = jwtService.verifyToken(req.headers.authorization).id;

  if (req.body.password) {
    let cipher = crypto.createCipher(algorithm, req.body.password);
    let crypted = cipher.update(PHRASE, "utf8", "hex");
    crypted += cipher.final("hex");
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

  User.update({ _id: userId }, { $set: user })
    .then((user) => {
      res.status(201).json({ message: "Your account has been updated" });
      return;
    })
    .catch((err) => {
      req.logger.error({
        message: err.message,
        error: err,
        className: "User API",
      });
      req.logger.error(err);
    });
  // }
  // else{
  //     return res.sendStatus(404);
  // }
});

router.post("/UpdateEmailAdressVerification", async (req, res) => {
  try {
    const userId = jwtService.verifyToken(req.headers.authorization).id;
    if (userId) {
      await userService.SendMailForEmailUpdateVerification(
        req.logger,
        userId,
        req.body.email
      );
      return res.status(200).json({ mail: true });
    } else {
      return res.status(200).json({ error: "user not found !" });
    }
  } catch (error) {
    req.logger.error({ message: error.message, className: "User API" });
    req.logger.error({
      message: JSON.stringify(error) + "\n" + error.stacktrace,
      className: "User API",
    });
    return res.status(501).json({ mail: false });
  }
});

router.post("/requestForResetPassword", async (req, res) => {
  try {
    await userService.SendMailForResetPassword(req.logger, req.body.email);
    return res.status(200).json({ mail: true });
  } catch (error) {
    req.logger.error({ message: error.message, className: "User API" });
    req.logger.error({
      message: JSON.stringify(error) + "\n" + error.stacktrace,
      className: "User API",
    });
    return res.status(501).json({ mail: false });
  }
});

router.post("/UpdatePassword", async (req, res) => {
  try {
    const userId = jwtService.verifyToken(req.headers.authorization).id;

    let cipherOld = crypto.createCipher(algorithm, req.body.oldPassword);
    let oldPassword = cipherOld.update(PHRASE, "utf8", "hex");
    oldPassword += cipherOld.final("hex");

    let cipherNew = crypto.createCipher(algorithm, req.body.newPassword);
    let newPassword = cipherNew.update(PHRASE, "utf8", "hex");
    newPassword += cipherNew.final("hex");

    if (userId) {
      await userService.updateUserPassword(userId, oldPassword, newPassword);
      return res.status(200).json({ updated: true });
    } else {
      return res.status(200).json({ error: "user not found !" });
    }
  } catch (error) {
    req.logger.error({ message: error.message, className: "Mailer API" });
    req.logger.error({
      message: JSON.stringify(error) + "\n" + error.stacktrace,
      className: "User API",
    });
    return res.status(501).json({ updated: false });
  }
});

router.post("/resetPassword", async (req, res) => {
  try {
    const payload = jwtService.verifyToken(req.body.token);
    if (payload.email) {
      let cipherOld = crypto.createCipher(algorithm, req.body.password);
      let password = cipherOld.update(PHRASE, "utf8", "hex");
      password += cipherOld.final("hex");

      await userService.resetPassword(payload.email, password);
      return res.status(200).json({ updated: true });
    } else {
      return res.status(304).json({ error: "Update failed !" });
    }
  } catch (error) {
    req.logger.error({ message: error.message, className: "User API" });
    req.logger.error({
      message: JSON.stringify(error) + "\n",
      className: "User API",
    });
    return res.status(403).json({ error: error.message });
  }
});

router.post("/UpdateEmailAdress/", async (req, res) => {
  try {
    const payload = jwtService.verifyToken(req.body.token);
    if (payload.id) {
      user = await userService.UpdateEmailAdress(payload.id, payload.email);
      return res.status(200).json({ user: user });
    } else {
      return res.status(304).json({ error: "user not found !" });
    }
  } catch (error) {
    req.logger.error({ message: error.message, className: "User API" });
    req.logger.error({
      message: JSON.stringify(error) + "\n",
      className: "User API",
    });
    return res.status(403).json({ error: error.message });
  }
});

router.put("/mdpmodif/", (req, res) => {
  // if(URLS.indexOf(req.headers.referer.substring(0,25)) !== -1){
  if (
    !req.body.pwd &&
    !req.body.token &&
    req.body.pwd == undefined &&
    req.body.token == undefined
  ) {
    res.sendStatus(422);
  }
  let cipher = crypto.createCipher(algorithm, req.body.pwd);
  let crypted = cipher.update(PHRASE, "utf8", "hex");
  crypted += cipher.final("hex");

  User.update({ token: req.body.token }, { $set: { password: crypted } }).then(
    (user) => {
      return res.status(201).json({});
    }
  );
  // }
  // else{
  //     return res.sendStatus(404);
  // }
});

router.post("/list", (req, res) => {
  let sort = {};

  sort[req.body.parameters.order[0].column] = req.body.parameters.order[0].dir;

  User.countDocuments({ state: { $ne: "" }, state: { $exists: true } }).then(
    (c) => {
      let search = {};
      if (req.body.parameters.search !== "") {
        search["$or"] = [
          { firstname: new RegExp(req.body.parameters.search, "i") },
          { lastname: new RegExp(req.body.parameters.search, "i") },
          { roleName: new RegExp(req.body.parameters.search, "i") },
          { email: new RegExp(req.body.parameters.search, "i") },
          { currency: new RegExp(req.body.parameters.search, "i") },
          { address: new RegExp(req.body.parameters.search, "i") },
          { addressBilling: new RegExp(req.body.parameters.search, "i") },
          { city: new RegExp(req.body.parameters.search, "i") },
          { cityBilling: new RegExp(req.body.parameters.search, "i") },
          { companyType: new RegExp(req.body.parameters.search, "i") },
          { country: new RegExp(req.body.parameters.search, "i") },
          { countryBilling: new RegExp(req.body.parameters.search, "i") },
          { job: new RegExp(req.body.parameters.search, "i") },
          { postalCode: new RegExp(req.body.parameters.search, "i") },
          { region: new RegExp(req.body.parameters.search, "i") },
          { phone: new RegExp(req.body.parameters.search, "i") },
          { companyName: new RegExp(req.body.parameters.search, "i") },
          { vat: new RegExp(req.body.parameters.search, "i") },
          { postalCodeBilling: new RegExp(req.body.parameters.search, "i") },
          { payment: new RegExp(req.body.parameters.search, "i") },
          { website: new RegExp(req.body.parameters.search, "i") },
        ];
      }
      User.countDocuments(search).then((cf) => {
        User.find(search)
          .skip(req.body.parameters.offset)
          .limit(req.body.parameters.limit)
          .collation({
            locale: "en",
            caseLevel: true,
          })
          .sort(sort)
          .then((users) => {
            if (!users) {
              return res.status(404);
            }

            return res.status(200).json({
              recordsFiltered: cf,
              listusers: users,
              totalRows: c,
            });
          });
      });
    }
  );
});

router.get("/download/:token/:id/:file", async (req, res) => {
  let valid = false;
  try {
    var user = await User.findOne(
      { token: req.params.token },
      { _id: true }
    ).exec();
    if (user) {
      req.logger.debug({ message: "user found.", className: "User API" });
      let idUser = JSON.parse(JSON.stringify(user._id));
      var order = await Order.findOne({
        idUser: idUser,
        "products.id_undercmd": req.params.id.split("|")[0],
      })
        .select({ "products.$.id_undercmd": 1, _id: false })
        .exec();
      if (order) {
        req.logger.debug({ message: "order found.", className: "User API" });
        order.products[0].links.forEach((lk) => {
          if (lk.status === "active") {
            //aareq.logger.info("link activated.");
            lk.links.forEach((link) => {
              let rgx = RegExp(req.params.file);
              valid += rgx.test(link.link);
            });
          }
        });
      } else {
        req.logger.info({ message: "order not found.", className: "User API" });
        return res.status(404).end();
      }
      if (valid) {
        var fullPath =
          "/mapr/client_exports/" + req.params.id + "/" + req.params.file;
        req.logger.info({
          message: "downloading file " + fullPath + "....",
          className: "User API",
        });
        return res.download(fullPath);
      } else {
        return res.status(404).end();
      }
    } else {
      req.logger.info({ message: "user not found.", className: "User API" });
      res.status(404).end();
    }
  } catch (err) {
    req.logger.error({
      message: "an error has been thrown: " + err.message + "\n" + err.stack,
      className: "User API",
    });
    return res.status(500).json({
      error:
        "an error has been thrown, please contact the support with identifier '" +
        req.headers.loggerToken +
        "'",
    });
  }
});

router.get("/checkEmailIfExist/:email", async (req, res) => {
  try {
    const exist = await userService.checkEmailIfExist(req.params.email);
    return res.status(200).json({ exist: exist });
  } catch (error) {
    req.logger.error({ message: error.message, className: "User API" });
    req.logger.error(error);
  }
});

function download(url, dest, cb) {
  // on créé un stream d'écriture qui nous permettra
  // d'écrire au fur et à mesure que les données sont téléchargées
  const file = fs.createWriteStream(dest);

  // on lance le téléchargement
  const sendReq = request.get(url);

  // on vérifie la validité du code de réponse HTTP
  sendReq.on("response", (response) => {
    if (response.statusCode !== 200) {
      return cb("Response status was " + response.statusCode);
    }
  });

  // au cas où request rencontre une erreur
  // on efface le fichier partiellement écrit
  // puis on passe l'erreur au callback
  sendReq.on("error", (err) => {
    fs.unlink(dest);
    cb(err.message);
  });

  // écrit directement le fichier téléchargé
  sendReq.pipe(file);

  // lorsque le téléchargement est terminé
  // on appelle le callback
  file.on("finish", () => {
    // close étant asynchrone,
    // le cb est appelé lorsque close a terminé
    file.close(cb);
  });

  // si on rencontre une erreur lors de l'écriture du fichier
  // on efface le fichier puis on passe l'erreur au callback
  file.on("error", (err) => {
    // on efface le fichier sans attendre son effacement
    // on ne vérifie pas non plus les erreur pour l'effacement
    fs.unlink(dest);
    cb(err.message);
  });
}

router.post("/changedefaultaddress", async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "No token provided" });
  }
  if (!req.body.vat) {
    return res.status(401).json({ error: "No vat number provided" });
  }
  if (!req.body.address) {
    return res.status(401).json({ error: "No address provided" });
  }
  if (!req.body.city) {
    return res.status(401).json({ error: "No city provided" });
  }
  if (!req.body.country) {
    return res.status(401).json({ error: "No country provided" });
  }
  if (!req.body.postalCode) {
    return res.status(401).json({ error: "No postalCode provided" });
  }
  try {
    const userId = jwtService.verifyToken(req.headers.authorization).id;
    await userService.UpdateUserDefaultBillingInfo(
      userId,
      req.body.vat,
      req.body.address,
      req.body.city,
      req.body.country,
      req.body.postalCode
    );
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(200).json({ error: error.message });
  }
});
router.post("/changeDefaultCurrency", async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "No token provided" });
  }
  if (!req.body.currency) {
    return res.status(401).json({ error: "No currency provided" });
  }
  try {
    const userId = jwtService.verifyToken(req.headers.authorization).id;
    await userService.UpdateUserDefaultCurrency(userId, req.body.currency);
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    var user = await userService.getUserById(req.params.id);
    if (user) {
      return res.status(200).json({ user: user });
    } else {
      return res.status(200).json({ error: "User not found" });
    }
  } catch (error) {
    req.logger.error({ message: error.message, className: "User API" });
    req.logger.error({
      message: JSON.stringify(error) + "\n" + error.stacktrace,
      className: "User API",
    });
    return res.status(501).json({ error: error });
  }
});

module.exports = router;
