const compression = require("compression");
const express = require("express");
const router = express.Router();
const pool = require("./../mysqlconnect");
const bodyParser = require("body-parser");

const nodemailer = require("nodemailer");

/**
 * создание transporter, используя SMTP протокол
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "autio.no.reply@gmail.com",
    pass: "autio.no.reply.pass",
  },
});

const urlencodedParser = bodyParser.urlencoded({ extended: false });

/**
 * добавление CORS заголовков
 */
function updateResponseHeaders(resp) {
  resp.header(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  resp.header("Access-Control-Allow-Origin", "*");
  resp.header("Access-Control-Allow-Methods", "*");
}

router.use(function(req, res, next) {
  updateResponseHeaders(res);
  next();
});

/**
 *  получение списка пользователей
 */
router.get("/", function(req, res) {
  pool.query("SELECT * FROM users", function(err, data) {
    if (err) return console.log(err);
  });
});

/**
 *  отправка сообщения с сылкой для восстановления пароля на почту
 */
router.get("/auth/forgot_password/:mail", function(req, res) {
  const mail = req.params.mail;

  pool.query("SELECT * FROM users WHERE mail=?", [mail], (err, data) => {
    if (err) return console.log(err);
    if (data.length > 0) {
      let token = Math.random()
        .toString(36)
        .substr(2);

      let url = `http://autio.website/auth/reset_password/${token}`;

      async function main() {
        await transporter.sendMail({
          from: '"Autio" <autio.no.reply@gmail.com>',
          to: `${mail}`,
          subject: "Autio - Восстановление пароля",
          html: `<p>Воспользуйтесь <a href="${url}">этой ссылкой</a>, чтобы восстановить пароль</p>`,
        });
      }

      main().catch(console.error);

      pool.query(
        "UPDATE users SET password_reset_token=? WHERE id=?",
        [token, data[0].id],
        function(err, data) {
          if (err) return console.log(err);
        }
      );

      res.send({ success: true });
    } else {
      res.send({ success: false });
    }
  });
});

/**
 * проверка данных при авторизации
 */
router.post("/auth", urlencodedParser, function(req, res) {
  if (!req.body) return res.sendStatus(400);
  const login = req.body.login;
  const password = req.body.password;

  pool.query(
    `SELECT * FROM users WHERE login=? AND password=?`,
    [login, password],
    (err, data) => {
      if (err) return console.log(err);

      updateResponseHeaders(res);

      if (data.length > 0) {
        res.send({ user: data[0] });
      } else {
        res.send({ user: "" });
      }
    }
  );
});

/**
 * добавление пользователя
 */

router.post("/create", urlencodedParser, function(req, res) {
  if (!req.body) return res.sendStatus(400);
  const mail = req.body.mail;
  const login = req.body.login;
  const password = req.body.password;

  pool.query(
    `SELECT * FROM users WHERE mail=? OR login=?`,
    [mail, login],
    function(err, data) {
      if (err) return console.log(err);
      if (data.length > 0) {
        res.send({ unique: false });
      } else {
        pool.query(
          "INSERT INTO users (mail, login, password) VALUES (?,?,?)",
          [mail, login, password],
          function(err, data) {
            if (err) return console.log(err);
            res.send({ unique: true });
          }
        );
      }
    }
  );
});

/**
 * получение id добавленного пользователя
 */
router.get("/create/get_id", function(req, res) {
  pool.query("SELECT MAX(id) AS id FROM users", function(err, data) {
    if (err) return console.log(err);
    res.send({ id: data[0].id });
  });
});

/**
 * получение id редактируемого пользователя
 */
router.get("/edit/:id", function(req, res) {
  const id = req.params.id;
  pool.query("SELECT * FROM users WHERE id=?", [id], function(err, data) {
    if (err) return console.log(err);
  });
});

/**
 * редактирование данных пользователя
 */
router.post("/edit", urlencodedParser, function(req, res) {
  if (!req.body) return res.sendStatus(400);
  const mail = req.body.mail;
  const login = req.body.login;
  const password = req.body.password;
  const id = req.body.id;

  pool.query(
    "UPDATE users SET mail=?, login=?, password=? WHERE id=?",
    [mail, login, password, id],
    function(err, data) {
      if (err) return console.log(err);
    }
  );
});

/**
 * установка нового пароля
 */
router.get("/edit/reset/:token/:password", function(req, res) {
  const token = req.params.token;
  const password = req.params.password;

  pool.query(
    "SELECT * FROM users WHERE password_reset_token=?",
    [token],
    function(err, data) {
      if (err) return console.log(err);
      if (data.length > 0) {
        pool.query(
          "UPDATE users SET password=?, password_reset_token=NULL WHERE password_reset_token=?",
          [password, token, token],
          function(err, data) {
            if (err) return console.log(err);
          }
        );

        async function main() {
          await transporter.sendMail({
            from: '"Autio" <autio.no.reply@gmail.com>',
            to: `${data[0].mail}`,
            subject: "Autio - Восстановление пароля",
            html: `<p>Ваш пароль был изменён.</p>`,
          });
        }

        main().catch(console.error);

        res.send({ success: true });
      } else {
        res.send({ success: false });
      }
    }
  );
});

/**
 * проверка токена
 */
router.get("/token_check/:token", function(req, res) {
  const token = req.params.token;

  pool.query(
    "SELECT * FROM users WHERE password_reset_token=?",
    [token],
    function(err, data) {
      if (err) return console.log(err);
      if (data.length > 0) {
        res.send({ success: true });
      } else {
        res.send({ success: false });
      }
    }
  );
});

/**
 * привязка аккаунта к Last.fm
 */
router.get("/edit/:id/:key/:name", function(req, res) {
  const id = req.params.id;
  const lastfmKey = req.params.key;
  const lastfmName = req.params.name;

  pool.query(
    "UPDATE users SET lastfm_key=?, lastfm_name=? WHERE id=?",
    [lastfmKey, lastfmName, id],
    function(err, data) {
      if (err) return console.log(err);
      res.send(req.params);
    }
  );
});

/**
 * удаление пользователя
 */
router.post("/delete/:id", function(req, res) {
  const id = req.params.id;
  pool.query("DELETE FROM users WHERE id=?", [id], function(err, data) {
    if (err) return console.log(err);
  });
});

module.exports = router;