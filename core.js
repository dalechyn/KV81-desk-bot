var line = [];
//DB Definition
const sqlite3 = require("sqlite3").verbose();

var db;

const dbpath = "./db/users.db";

const TABLE_NAME_USERS = "users";

const KEY_COL_UID = "uid";
const KEY_COL_NAME = "name";
const KEY_COL_ADMIN = "admin";
//
function dbInit() {
  db = new sqlite3.Database(dbpath);

  db.serialize(function() {
    db.run(
      `CREATE TABLE IF NOT EXISTS ${TABLE_NAME_USERS}(${KEY_COL_UID} integer primary key, ${KEY_COL_NAME} text, ${KEY_COL_ADMIN} int(1))`
    );
    db.each(
      `SELECT ${KEY_COL_UID} ${KEY_COL_UID}, ${KEY_COL_NAME} ${KEY_COL_NAME}, ${KEY_COL_ADMIN} ${KEY_COL_ADMIN} FROM ${TABLE_NAME_USERS}`,
      (err, row) => {
        userList.push({
          name: row[KEY_COL_NAME],
          uid: row[KEY_COL_UID],
          admin: row[KEY_COL_ADMIN]
        });
      }
    );
  });
}

dbInit();

var funcs = {};

var userList = [];

function getList() {
  var list = "";
  for (var i = 0; i < line.length; i++) {
    list = list + `Номер: ${i + 1}, Имя: ${getNameByUID(line[i])} \n`;
  }
  if (list == "") {
    list = `Очередь пустая`;
  }
  return list;
}

function findUserByUID(uid) {
  for (const A of userList) {
    if (A.uid == uid) return A;
  }
}

function userExists(uid) {
  for (const A of userList) {
    if (A.uid == uid) return true;
  }
  return false;
}

function start(uid, username) {
  var result;
  if (!userExists(uid)) {
    db.run(
      `INSERT INTO ${TABLE_NAME_USERS} ( ${KEY_COL_UID}, ${KEY_COL_NAME}, ${KEY_COL_ADMIN} ) VALUES ( '${uid}', '${username}', 0 )`,
      function(err) {
        if (err) return console.log(err.message);
        console.log("successfull");
      }
    );
    db.close();
    userList.push({
      name: username,
      uid: uid
    });
    result = `Привет, ${username}! По всему видимому ты ещё не пользовался этим ботом.\nПомощь по командам - /help\nУдачи!`;
  } else {
    if (findUserByUID(uid).name !== username)
      findUserByUID(uid).name = username;
    result = `Давно не виделись, ${username}`;
  }
  console.log(userList);
  return result;
}

function help() {
  return `/start - зарегистрироваться в боте\n/in - занять очередь\n/out - выйти из очереди\n/getList - посмотреть очередь к доске`;
}

function getNameByUID(uid) {
  for (const A of userList) {
    if (A.uid == uid) {
      return A.name;
    }
  }
}

function getInLine(uid) {
  var result;

  if (userExists(uid)) {
    if (!line.includes(uid)) {
      line.push(uid);
      result = `Ваш номер в очереди - ${line.length}`;
    } else {
      result = `Вы уже зарегистрированы в очереди`;
    }
  } else {
    result = `Похоже вы не зарегистрированы в боте. Введите команду /start.`;
  }
  return result;
}

function popFirst() {
  line = line.reverse();
  line.pop();
  line = line.reverse();
}

function getJSONForInline() {
  var jsonArr = [];
  for (var i = 0; i < line.length; i++) {
    jsonArr.push([
      {
        text: i + 1 + " - " + findUserByUID(line[i]).name,
        callback_data: line[i]
      }
    ]);
  }
  jsonArr.push([
    {
      text: "Отмена",
      callback_data: -1
    }
  ]);
  return {
    reply_markup: { inline_keyboard: jsonArr, one_time_keyboard: true }
  };
}

function isAdmin(uid) {
  return findUserByUID(uid).admin === 1;
}

function popByUIDAdmin(uid) {
  var result;

  if (isAdmin(uid)) {
    if (line.length !== 0) {
      result = { msg: `Выберите кого удалить:`, json: getJSONForInline() };
    } else {
      result = `Очередь пустая, удалять некого.`;
    }
  } else {
    result = `Вам недоступна эта команда.`;
  }
  return result;
}

function popByUID(uid) {
  if (typeof uid !== "number") uid = parseInt(uid);
  let index = line.indexOf(uid);
  let result;

  if (index !== -1) {
    line.splice(index, 1);
    result = `Вы успешно вышли из очереди`;
  } else {
    result = `Вы не зарегистрированы в очереди`;
  }
  return result;
}

function whoIsNow() {
  return line[0];
}

module.exports = {
  help,
  getList,
  getNameByUID,
  popbyUIDAdmin: popByUIDAdmin,
  start,
  getJSONforInline: getJSONForInline,
  popByUID,
  popFirst,
  whoIsNow,
  getInLine
};
