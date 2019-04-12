export default {
  col: {
    uid: 'uid',
    name: 'name',
    admin: 'admin'
  },
  dbPath: '../db/users.db',
  dbCreate:
    'CREATE TABLE IF NOT EXISTS users(uid integer primary key, name text, admin int(1))',
  dbGet: 'SELECT uid uid, name name, admin admin FROM users',
  dbInsert: (uid, name) =>
    `INSERT INTO users ( uid, name, admin ) VALUES ( '${uid}', '${name}', 0 )`
}
