const { json } = require("body-parser");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth")
const express = require("express");

const Messages = require(".models/message")
const User = require("./models/user");
const router = new express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in user is either the to or from user.
 *
 **/
router.get('/:id', ensureCorrectUser, async (req, res, next) => {
    try {
        const res = await Messages.get(req.params.id)
        return res.json({res})
    } catch (e) {
        return next(e)
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const res = await Messages.create(req.body)
        return res.json({res})
    } catch (e) {
        return next(e)
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureCorrectUser, async (req, res, next) => {
    try {
        const res = await Messages.markRead(req.params.id)
        return res.json({res})
    } catch (e) {
        return next(e)
    }
})