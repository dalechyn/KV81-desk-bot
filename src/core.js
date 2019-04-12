import sqlite3 from 'sqlite3'
import sqldb from './sql-db'

import { queue } from './misc'

const { col, dbPath, dbCreate, dbGet, dbInsert } = sqldb

const userList = []

const db = new sqlite3.Verbose().Database(dbPath)

db.serialize(function() {
  db.run(dbCreate)
  db.each(dbGet, (err, row) => {
    if (err) {
      /* I am too lazy to create file logging */
      console.log(err)
      return
    }
    userList.push({
      name: row[col.name],
      uid: row[col.uid],
      admin: row[col.admin]
    })
  })
})

setInterval(() => {
  if (!classesRun() && !queue.isEmpty()) queue.clear()
}, 60 * 1000)

function getList() {
  if (queue.isEmpty()) return 'Очередь пуста'
  let list = ''
  queue.each(
    (val, i) => (list += `Номер: ${i + 1}, Имя: ${getNameByUID(val)}`)
  )
  return list
}

function findUserByUID(uid) {
  for (const A of userList) {
    if (A.uid === uid) return A
  }
}

function userExists(uid) {
  for (const A of userList) {
    if (A.uid === uid) return true
  }
  return false
}

function start(uid, name) {
  let result
  if (!userExists(uid)) {
    db.run(dbInsert(uid, name), function(err) {
      if (err) return console.log(err.message)
    })
    db.close()
    userList.push({
      name: name,
      uid: uid
    })
    result = `Привет, ${name}! По всему видимому ты ещё не пользовался этим ботом.\nПомощь по командам - /help.\nУдачи!`
  } else {
    const user = findUserByUID(uid)
    user.name = user.name === name ? user.name : name
    result = `Давно не виделись, ${name}!`
  }
  return result
}

function help() {
  return `/in - занять очередь;\n/out - выйти из очереди;\n/getList - посмотреть очередь к доске.`
}

function getNameByUID(uid) {
  for (const A of userList) {
    if (A.uid === uid) {
      return A.name
    }
  }
}

function classesRun() {
  const date = new Date()
  const minutes = date.getHours() * 60 + date.getMinutes()
  /*
    I left the number's to increase readability.
    However Node will optimize and calculate this values
  */
  return (
    (minutes >= 8 * 60 + 30 && minutes <= 10 * 60) ||
    (minutes >= 10 * 60 + 25 && minutes <= 11 * 60 + 55) ||
    (minutes >= 12 * 60 + 20 && minutes <= 13 * 60 + 50) ||
    (minutes >= 14 * 60 + 15 && minutes <= 15 * 60 + 45) ||
    (minutes >= 16 * 60 + 10 && minutes <= 17 * 60 + 40)
  )
}

function getInLine(uid) {
  let result

  if (userExists(uid))
    if (classesRun())
      if (!queue.has(uid)) {
        queue.enqueue(uid)
        result = `Ваш номер в очереди - ${queue.getLength()}.`
      } else result = `Вы уже зарегистрированы в очереди.`
    else
      result = `Сейчас нет пар, поэтому вы не можете занять очередь.`
  else
    result = `Похоже вы не зарегистрированы в боте. Введите команду /start.`

  return result
}

function getJSONForInline() {
  let jsonArr = []
  queue.each((el, i) =>
    jsonArr.push([
      {
        text: i + 1 + ' - ' + findUserByUID(el).name,
        callback_data: el
      }
    ])
  )
  jsonArr.push([
    {
      text: 'Отмена',
      callback_data: -1
    }
  ])
  return {
    reply_markup: {
      inline_keyboard: jsonArr,
      one_time_keyboard: true
    }
  }
}

function isAdmin(uid) {
  return findUserByUID(uid).admin === 1
}

function popByUIDAdmin(uid) {
  let result

  if (isAdmin(uid)) {
    if (!queue.isEmpty()) {
      result = {
        msg: `Выберите кого удалить:`,
        json: getJSONForInline()
      }
    } else {
      result = `Очередь пустая, удалять некого.`
    }
  } else {
    result = `Вам недоступна эта команда.`
  }
  return result
}

function popByUID(uid) {
  if (typeof uid !== 'number') uid = parseInt(uid)
  let result

  if (queue.getHead() === uid) {
    queue.pop()
    result = `Вы успешно вышли из очереди.`
  } else {
    result = `Вы или либо не зарегистрированы в очереди, либо не первый из списка.`
  }
  return result
}

function whoIsNow() {
  return queue.getHead()
}

export default {
  help,
  getList,
  getNameByUID,
  popbyUIDAdmin: popByUIDAdmin,
  start,
  getJSONForInline,
  popByUID,
  whoIsNow,
  getInLine
}
