import {VRCLogDatabase} from "../database.cjs";

const express = require('express');
const router = express.Router();

import {vrcDatabase, vrcDatabaseStatus} from "../app.cjs";
import {HTTPError} from "../modules/errors";

/* GET users listing. */
router.get('/', function(req:any, res:any, next:any) {
    if (vrcDatabaseStatus.isStarted) {
        vrcDatabase
            .getUsers()
            .then(users => { // sort and filter
                return users.filter(user => ({
                    username: user.username,
                    vrchat_internal_id: user.vrchat_internal_id,
                })).sort(
                    (a,b) =>
                        a.username === b.username
                            ? (
                                a.vrchat_internal_id === b.vrchat_internal_id
                                ? 0
                                : a.vrchat_internal_id < b.vrchat_internal_id
                                    ? -1
                                    : 1
                            )
                            : (
                                a.username < b.username
                                    ? -1
                                    : 1
                            )
                );
            }).then(users => {
                res.render('users', {users: users, title: "users"})
            }).catch(err => next(new HTTPError(err as Error, 500)));
    } else {
        next(new HTTPError(new Error(), 503));
    }
});

router.get('/:id', async function(req:any, res:any, next:any) {
    try {
        const id = String(req.params.id);
        const userId = await vrcDatabase.getUserId(id);
        const nowUser = await vrcDatabase.getUserById(userId);

        if (vrcDatabaseStatus.isStarted) {
            const exchanges = await vrcDatabase.getExchangesByUserId(userId);
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
        } else {
            next(new HTTPError(new Error(), 503));
        }
    } catch(e) {
        console.error(e);
        next(new HTTPError(new Error(), 500));
    }
})

module.exports = router;
