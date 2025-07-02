const express = require('express');
const router = express.Router();
const osc_client = require('node-osc').Client;

router.get('/ja', function(req:any, res:any, next:any) {
    res.render('chatbox', {title: "Chat", lang: 'ja-JP'});
})

router.get('/en', function(req:any, res:any, next:any) {
    res.render('chatbox', {title: "Chat", lang: 'en-US'});
})

router.all('/message', function(req:any, res:any, next:any) {
    const message = req.query.message;
    console.log(message);

    // send OSC message to VRC
    try {
        const client = new osc_client('127.0.0.1', 9000);
        client.send('/chatbox/input', message, true, () => {
            client.close();
            res.render('ok');
        })

    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;