import sqlite3 = require('sqlite3');
import {User, Exchange} from './modules/VRCtypes';

export class VRCLogDatabase extends sqlite3.Database {
    constructor(filename: string, callback?: (err: Error | null) => void) {
        super(filename, callback);
        this.init();
    }

    private init() {
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
    `)
            this.run(`
        CREATE TABLE IF NOT EXISTS exchanges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            start_time INTEGER NOT NULL,
            end_time INTEGER
        );
    `) // end_time can be NULL if the exchange is ongoing
        })
    }

    public createSession(startTime: number, worldName: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.run(
                `INSERT INTO sessions (start_time, world_name) VALUES (?, ?);`,
                startTime,
                worldName,
                function (err: Error | null) {
                    if (err == null) {
                        //@ts-ignore
                        resolve(this.lastID);
                    } else {
                        reject(err);
                    }
                }
            );
        })
    }

    public endSession(sessionId: number, endTime: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.run(
                `UPDATE sessions SET end_time = ? WHERE id = ?;`,
                endTime,
                sessionId,
                function (err: Error | null) {
                    if (err == null) {
                        resolve();
                    } else {
                        reject(err);
                    }
                }
            );
        })
    }

    public getUserId(vrchatInternalId: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.all(
                `SELECT id FROM users WHERE vrchat_internal_id = ?;`,
                vrchatInternalId,
                function (err: Error | null, row: any[]) {
                    if (err == null) {
                        if (row.length >= 2) {
                            reject(new Error('Multiple records found for UNIQUE constraint'));
                        } else if (row.length == 1) {
                            resolve(row[0].id);
                        } else {
                            reject(new Error('User not found'));
                        }
                    } else {
                        reject(err);
                    }
                }
            )
        })
    }

    public existsUser(vrchatInternalId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.get(
                `SELECT COUNT(*) as count FROM users WHERE vrchat_internal_id = ?;`,
                vrchatInternalId,
                function (err: Error | null, row: any) {
                    if (err == null) {
                        resolve(row.count > 0);
                    } else {
                        reject(err);
                    }
                }
            )
        })
    }

    public createUser(username: string, vrchatInternalId: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const lastSeen = 0; // default
            this.run(
                `INSERT INTO users (username, vrchat_internal_id, last_seen) VALUES (?, ?, ?);`,
                username,
                vrchatInternalId,
                lastSeen,
                function (err: Error | null) {
                    if (err == null) {
                        //@ts-ignore
                        resolve(this.lastID);
                    } else {
                        reject(err);
                    }
                }
            )
        })
    }

    public getUsers(): Promise<{username: string, vrchat_internal_id: string, last_seen: number}[]> {
        return new Promise((resolve, reject) => {
            this.all(
                `SELECT id, username, vrchat_internal_id, last_seen FROM users;`,
                function (err: Error | null, rows: any[]) {
                    if (err == null) {
                        resolve(rows.map(row => ({
                            id: row.id,
                            username: row.username,
                            vrchat_internal_id: row.vrchat_internal_id,
                            last_seen: row.last_seen
                        })));
                    } else {
                        reject(err);
                    }
                }
            )
        })
    }

    public getUserById(id: number): Promise<User> {
        return new Promise((resolve, reject) => {
            this.all(
                `SELECT username, vrchat_internal_id FROM users WHERE id = ?`,
                id,
                function (err: Error | null, row: any) {
                    if (err == null) {
                        if (row.length === 1) resolve(new User({
                            id: id,
                            vrc_internal_id: row[0].vrchat_internal_id,
                            name: row[0].username
                        }));
                        else reject(new Error("A user expected to exist was not found"));
                    } else {
                        reject(err);
                    }
                }
            )
        })
    }

    public createExchange(sessionId: number, userId: number, startTime: number): Promise<number> {
        return new Promise((resolve, reject) => {
            this.run(
                `INSERT INTO exchanges (session_id, user_id, start_time) VALUES (?, ?, ?);`,
                sessionId,
                userId,
                startTime,
                function (err: Error | null) {
                    if (err == null) {
                        //@ts-ignore
                        resolve(this.lastID);
                    } else {
                        reject(err);
                    }
                }
            )
        })
    }

    public getExchangesByUserId(userId: number): Promise<Exchange[]> {
        return new Promise<Exchange[]>((resolve, reject) => {
            this.all(`
                SELECT * FROM exchanges
                INNER JOIN sessions
                    ON exchanges.session_id = sessions.id
                WHERE user_id = ?;`,
                userId,
                function (err: Error | null, rows: any[]) {
                    if (!err) {
                        resolve(rows.map(row => new Exchange({
                            worldName: row.world_name,
                            exchangeId: row.id,
                            begin: row.start_time,
                            end: row.end_time,
                            user: row.user_id,
                            session: row.session_id,

                        })));
                    } else {
                        reject(err);
                    }
                }
            )
        })
    }

    public endExchange(exchangeId: number, endTime: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.run(
                `UPDATE exchanges SET end_time = ? WHERE id = ?;`,
                endTime,
                exchangeId,
                function (err: Error | null) {
                    if (err == null) {
                        resolve();
                    } else {
                        reject(err);
                    }
                }
            )
        })
    }
}

module.exports.VRCLogDatabase = VRCLogDatabase;