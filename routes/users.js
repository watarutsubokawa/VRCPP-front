"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        }).catch(err => next(new errors_1.HTTPError(err, 500)));
    }
    else {
        next(new errors_1.HTTPError(new Error(), 503));
    }
});
router.get('/:id', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = String(req.params.id);
            const userId = yield app_1.vrcDatabase.getUserId(id);
            const nowUser = yield app_1.vrcDatabase.getUserById(userId);
            if (app_1.vrcDatabaseStatus.isStarted) {
                const exchanges = yield app_1.vrcDatabase.getExchangesByUserId(userId);
                console.log(exchanges);
                res.render('userDetail', {
                    exchanges: exchanges.map(exchange => ({
                        id: exchange.exchangeId,
                        begin: exchange.getBeginDateTime(),
                        end: exchange.getEndDateTime(),
                        worldName: exchange.worldName,
                    })),
                    title: "User Details",
                    userName: nowUser.name,
                    userInternalId: id,
                });
            }
            else {
                next(new errors_1.HTTPError(new Error(), 503));
            }
        }
        catch (e) {
            console.error(e);
            next(new errors_1.HTTPError(new Error(), 500));
        }
    });
});
module.exports = router;
