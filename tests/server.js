// https://metrika.yandex.ru/stat/?counter_id=21312094
'use strict';

const
    http = require('http'),
    counter = require('../yametrika').counter({id: 21312094});

http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('okay');

    counter.req(req);

    counter.hit('http://example.com', 'Main page', 'http://google.com');
    counter.hit('http://example.com/back/', 'Back', 'http://example.com/back/');
    counter.reachGoal('action');
    counter.extLink('http://nodejs.org');
    counter.file('http://example.com/file.zip');
    counter.params('level1', 'level2', 'level3', 1);
}).listen(8080);
