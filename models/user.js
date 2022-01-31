/** User class for message.ly */

/** User of the site. */

const BCRYPT_WORK_FACTOR = require('../config');
const ExpressError = require('../expressError');

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    if (!username || !password || !first_name || !last_name || !phone) {
      throw new ExpressError("Username and password required", 400);
    }
    const currentTime = new Date();
    // hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    // save to db
    const results = await db.query(`
      INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, $6, $6)
      RETURNING username`,
      [username, hashedPassword, first_name, last_name, phone, currentTime]);
    return true;
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    if (!username || !password) {
      throw new ExpressError("Username and password required", 400);
    }
    const results = await db.query(
      `SELECT username, password 
       FROM users
       WHERE username = $1`,
      [username]);
    const user = results.rows[0];
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username }, SECRET_KEY);
        return true }
      }
    return false;
    }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    if(!username) {
      throw new ExpressError("Username and password required", 400)
    }
    const date = new Date()
    const time = await db.query(
      `SET last_login_at = $1
      RETURN last_login_at`, [date]
    )

    return time;
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const all = await db.query(
      `SELECT * FROM users;`
    )
    return all;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const user = await db.query(
      `SELECT * FROM users WHERE username=$1`, [username]
    )
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const messages = await db.query(
      `SELECT id, to_user, body, sent_at, read_at FROM messages WHERE to_user=$1`, [username] 
    )
    return messages
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const messages = await db.query(
      `SELECT id, from_user, body, sent_at, read_at FROM messages WHERE from_user=$1`, [username] 
    )
    return messages
  }
}


module.exports = User;