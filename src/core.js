let modules_path = "../node_modules/";

//DB Definition
const sqlite3 = require(modules_path + "sqlite3").verbose();

let db;

const dbpath = "../db/users.db";

const TABLE_NAME_USERS = "users";

const KEY_COL_UID = "uid";
const KEY_COL_NAME = "name";
const KEY_COL_ADMIN = "admin";
//
let timezone = 3;

let line = [];
let userList = [];

(function dbInit() {
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
})();

function getTime() {
  return {
    hours: new Date().getUTCHours() + timezone,
    minutes: new Date().getUTCMinutes(),
    seconds: new Date().getUTCSeconds(),
    toMinutes: (new Date().getUTCHours() + timezone) * 60 + new Date().getUTCMinutes()
  }
}

function getList() {
  let list = "";
  for (let i = 0; i < line.length; i++) {
    list = list + `Номер: ${i + 1}, Имя: ${getNameByUID(line[i])} \n`;
  }
  if (list === "") {
    list = `Очередь пустая.`;
  }
  return list;
}

function findUserByUID(uid) {
  for (const A of userList) {
    if (A.uid === uid) return A;
  }
}

function userExists(uid) {
  for (const A of userList) {
    if (A.uid === uid) return true;
  }
  return false;
}

function start(uid, username) {
  let result;
  if (!userExists(uid)) {
    db.run(
      `INSERT INTO ${TABLE_NAME_USERS} ( ${KEY_COL_UID}, ${KEY_COL_NAME}, ${KEY_COL_ADMIN} ) VALUES ( '${uid}', '${username}', 0 )`,
      function(err) {
        if (err) return console.log(err.message);
      }
    );
    db.close();
    userList.push({
      name: username,
      uid: uid
    });
    result = `Привет, ${username}! По всему видимому ты ещё не пользовался этим ботом.\nПомощь по командам - /help.\nУдачи!`;
  } else {
    if (findUserByUID(uid).name !== username)
      findUserByUID(uid).name = username;
    result = `Давно не виделись, ${username}!`;
  }
  return result;
}

function help() {
  return `/in - занять очередь;\n/out - выйти из очереди;\n/getList - посмотреть очередь к доске.`;
}

function getNameByUID(uid) {
  for (const A of userList) {
    if (A.uid === uid) {
      return A.name;
    }
  }
}

function timeCheck(){
  let time = getTime().toMinutes;
  return (time >= 510 && time <= 605) ||
    (time >= 625 && time <= 720) ||
    (time >= 740 && time <= 835) ||
    (time >= 855 && time <= 950) ||
    (time >= 970 && time <= 1065);
}

function getInLine(uid) {
  let result;

  if (userExists(uid)) {
    if(timeCheck()) {
      if (!line.includes(uid)) {
        line.push(uid);
        result = `Ваш номер в очереди - ${line.length}.`;
      } else {
        result = `Вы уже зарегистрированы в очереди.`;
      }
    } else {
      result = `Сейчас нет пар, поэтому вы не можете занять очередь.`
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
  let jsonArr = [];
  for (let i = 0; i < line.length; i++) {
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
  let result;

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
    result = `Вы успешно вышли из очереди.`;
  } else {
    result = `Вы не зарегистрированы в очереди.`;
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
