"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VRCLogDatabase = void 0;
const sqlite3 = require("sqlite3");
class VRCLogDatabase extends sqlite3.Database {
    constructor(filename, callback) {
        super(filename, callback);
        this.init();
    }
    init() {
        this.parallelize(() => {
            this.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time INTEGER NOT NULL,
            end_time INTEGER,
            world_name TEXT NOT NULL
        );
    `); // end_time can be NULL if the session is ongoing
            this.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            vrchat_internal_id TEXT NOT NULL,
            last_seen INTEGER NOT NULL
        );
    `);
            this.run(`
        CREATE TABLE IF NOT EXISTS exchanges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            start_time INTEGER NOT NULL,
            end_time INTEGER
        );
    `); // end_time can be NULL if the exchange is ongoing
        });
    }
    createSession(startTime, worldName) {
        return new Promise((resolve, reject) => {
            this.run(`INSERT INTO sessions (start_time, world_name) VALUES (?, ?);`, startTime, worldName, function (err) {
                if (err == null) {
                    //@ts-ignore
                    resolve(this.lastID);
                }
                else {
                    reject(err);
                }
            });
        });
    }
    endSession(sessionId, endTime) {
        return new Promise((resolve, reject) => {
            this.run(`UPDATE sessions SET end_time = ? WHERE id = ?;`, endTime, sessionId, function (err) {
                if (err == null) {
                    resolve();
                }
                else {
                    reject(err);
                }
            });
        });
    }
    getUserId(vrchatInternalId) {
        return new Promise((resolve, reject) => {
            this.all(`SELECT id FROM users WHERE vrchat_internal_id = ?;`, vrchatInternalId, function (err, row) {
                if (err == null) {
                    if (row.length >= 2) {
                        reject(new Error('Multiple records found for UNIQUE constraint'));
                    }
                    else if (row.length == 1) {
                        resolve(row[0].id);
                    }
                    else {
                        reject(new Error('User not found'));
                    }
                }
                else {
                    reject(err);
                }
            });
        });
    }
    existsUser(vrchatInternalId) {
        return new Promise((resolve, reject) => {
            this.get(`SELECT COUNT(*) as count FROM users WHERE vrchat_internal_id = ?;`, vrchatInternalId, function (err, row) {
                if (err == null) {
                    resolve(row.count > 0);
                }
                else {
                    reject(err);
                }
            });
        });
    }
    createUser(username, vrchatInternalId) {
        return new Promise((resolve, reject) => {
            const lastSeen = 0; // default
            this.run(`INSERT INTO users (username, vrchat_internal_id, last_seen) VALUES (?, ?, ?);`, username, vrchatInternalId, lastSeen, function (err) {
                if (err == null) {
                    //@ts-ignore
                    resolve(this.lastID);
                }
                else {
                    reject(err);
                }
            });
        });
    }
    getUsers() {
        return new Promise((resolve, reject) => {
            this.all(`SELECT username, vrchat_internal_id, last_seen FROM users;`, function (err, rows) {
                if (err == null) {
                    resolve(rows.map(row => ({
                        username: row.username,
                        vrchat_internal_id: row.vrchat_internal_id,
                        last_seen: row.last_seen
                    })));
                }
                else {
                    reject(err);
                }
            });
        });
    }
    createExchange(sessionId, userId, startTime) {
        return new Promise((resolve, reject) => {
            this.run(`INSERT INTO exchanges (session_id, user_id, start_time) VALUES (?, ?, ?);`, sessionId, userId, startTime, function (err) {
                if (err == null) {
                    //@ts-ignore
                    resolve(this.lastID);
                }
                else {
                    reject(err);
                }
            });
        });
    }
    endExchange(exchangeId, endTime) {
        return new Promise((resolve, reject) => {
            this.run(`UPDATE exchanges SET end_time = ? WHERE id = ?;`, endTime, exchangeId, function (err) {
                if (err == null) {
                    resolve();
                }
                else {
                    reject(err);
                }
            });
        });
    }
}
exports.VRCLogDatabase = VRCLogDatabase;
module.exports.VRCLogDatabase = VRCLogDatabase;
