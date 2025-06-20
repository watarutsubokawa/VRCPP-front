"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var router = express.Router();
const app_1 = require("../app");
const errors_1 = require("../modules/errors");
/* GET users listing. */
router.get('/', function (req, res, next) {
    if (app_1.vrcDatabaseStatus.isStarted) {
        app_1.vrcDatabase
            .getUsers()
            .then(users => {
            console.log(users);
            return users.filter(user => ({
                username: user.username,
                vrchat_internal_id: user.vrchat_internal_id,
            })).sort((a, b) => a.username === b.username
                ? (a.vrchat_internal_id === b.vrchat_internal_id
                    ? 0
                    : a.vrchat_internal_id < b.vrchat_internal_id
                        ? -1
                        : 1)
                : (a.username < b.username
                    ? -1
                    : 1));
        }).then(users => {
            res.render('users', { users: users, title: "users" });
        }).catch(err => {
            next(new errors_1.HTTPError(err, 500));
        });
    }
    else {
        next(new errors_1.HTTPError(new Error(), 503));
    }
});
module.exports = router;
