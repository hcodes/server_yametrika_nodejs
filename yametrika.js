/**
 * Серверная отправка хитов с помощью Node.js в Яндекс.Метрику
 *
 * Author: Denis Seleznev <hcodes@yandex.ru>
 * License: MIT
 */

(function () {
    'use strict';

    var HOST = 'mc.yandex.ru';
    var PATH = '/watch/';
    var PORT = 443;

    var querystring = require('querystring');
    var https = require('https');

    /**
     * Конструктор счётчика Метрики
     * @constructor
     *
     * @param {Object} settings - Настройки счётчика.
     */
    var Counter = function(settings) {
        // Номер счётчика
        this._id = settings.id;

        // Тип счётчика: 0 - обычный счётчик, 1 - РСЯ-счётчик
        this._type = settings.type || 0;

        this._encoding = settings.encoding || 'utf-8';

        this._request = {
            host: null,
            url: null,
            referer: null,
            'user-agent': null,
            ip: null
        };
    };

    Counter.prototype = {
        /**
         * Отправка хита.
         *
         * @param {string} pageUrl - Адрес страницы.
         * @param {string} [pageTitle] - Заголовок страницы.
         * @param {string} [pageRef] - Реферер страницы.
         * @param {Object} [userParams] - Параметры визитов.
         * @param {string} [ut] - Для запрета индексирования 'noindex'.
         *
         * @returns {Object} this
         *
         * @example
         * counter.hit('http://mysite.org', 'Main page', 'http://google.com/...');
         */
        hit: function(pageUrl, pageTitle, pageRef, userParams, ut) {
            if (!pageUrl) {
                pageUrl = this._request.url;
            }

            if (!pageRef) {
                pageRef = this._request.referer;
            }

            this._hitExt(pageUrl, pageTitle, pageRef, userParams, {ut: ut});

            return this;
        },
        /**
         * Достижение цели.
         *
         * @param {string} target - Название цели.
         * @param {Object} [userParams] - Параметры визитов.
         *
         * @returns {Object} this
         *
         * @example
         * counter.reachGoal('goalName');
        */
        reachGoal: function(target, userParams) {
            var referer;
            if (target) {
                target = 'goal://' + this._request.host + '/' + target;
                referer = this._request.url;
            } else {
                target = this._request.url;
                referer = this._request.referer;
            }

            this._hitExt(target, null, referer, userParams, null);

            return this;
        },
        /**
         * Внешняя ссылка.
         *
         * @param {string} url - Адрес страницы.
         * @param {string} [title] - Заголовок страницы.
         *
         * @returns {Object} this
         *
         * @example
         * counter.extLink('http://nodejs.org');
         */
        extLink: function(url, title) {
            if (url) {
                this._hitExt(url, title, this._request.url, null, {
                    ln: true,
                    ut: 'noindex'
                });
            }

            return this;
        },
         /**
         * Загрузка файла.
         *
         * @param {string} file - Ссылка на файл.
         * @param {string} [title] - Заголовок страницы.
         *
         * @returns {Object} this
         *
         * @example
         * counter.file('http://mysite.org/secret.zip');
         */
        file: function(file, title) {
            if (file) {
                this._hitExt(file, title, this._request.url, null, {
                    dl: true,
                    ln: true
                });
            }

            return this;
        },
        /**
         * Параметры визитов.
         *
         * @param {...*} data - Параметры визитов.
         *
         * @returns {Object} this
         *
         * @example
         * counter.params({level1: {level2: {level3: 1}}});
         * или
         * counter.params('level1', 'level2', 'level3', 1);
         */
        params: function(data) {
            var obj = {};
            var pointer = obj;
            var len = arguments.length;
            if (len > 1) {
                for (var i = 0; i < len - 1; i++) {
                    pointer[arguments[i]] = {};
                    if (i == len - 2) {
                         pointer[arguments[i]] = arguments[i + 1];
                    } else {
                        pointer = pointer[arguments[i]];
                    }
                }

                this._hitExt('', '', '', obj, {pa: true});
            } else {
                if (data) {
                    this._hitExt('', '', '', data, {pa: true});
                }
            }

            return this;
        },
        /**
         * Не отказ.
         *
         * @returns {Object} this
         *
         * @example
         * counter.notBounce();
         */
        notBounce: function() {
            this._hitExt('', '', '', null, {nb: true});

            return this;
        },
        /**
         * Заполнение необходимых параметров из запроса сервера для отправки данных в Метрику.
         *
         * @param {Object} req
         *
         * @returns {Object} this
         *
         * @example
         * counter.req(req);
         */
        req: function(req) {
            var rh = req.headers;
            this._request = {
                host: rh.host,
                url: this._protocol(req) + '://' + rh.host + req.url,
                referer: rh.referer,
                'user-agent': rh['user-agent'],
                ip: this._clientIP(req)
            };

            return this;
        },
        _clientIP: function(req) {
            var rh = req.headers;
            return rh['x-real-ip'] || rh['x-forwarded-for'] || rh['x-remote-ip'] || rh['x-originating-ip'] || req.connection.remoteAddress;
        },
        _protocol: function(req) {
            var rh = req.headers;
            return rh['x-forwarded-proto'] || rh.protocol || (req.secure ? 'https' : 'http');
        },
        _hitExt: function(pageUrl, pageTitle, pageRef, userParams, modes) {
            var postData = {};

            if (this._type) {
                postData['cnt-class'] = this._type;
            }

            if (pageUrl) {
                postData['page-url'] = pageUrl;
            }

            if (pageRef) {
                postData['page-ref'] = pageRef;
            }

            if (modes) {
                modes.ar = true;
            } else  {
                modes = {ar: true};
            }

            var browserInfo = [];
            for(var key in modes) {
                if (!modes.hasOwnProperty(key)) {
                    continue;
                }

                if (key != 'ut') {
                    browserInfo.push(key + ':' + (modes[key] === true ? '1' : modes[key]));
                }
            }

            browserInfo.push('en:' + this._encoding);
            browserInfo.push('rn:' + (Math.floor(Math.random() * 1E6)));

            if (pageTitle) {
                browserInfo.push('t:' + pageTitle);
            }

            postData['browser-info'] = browserInfo.join(':');

            if (userParams) {
                postData['site-info'] = JSON.stringify(userParams);
            }

            if (modes['ut']) {
                postData['ut'] = modes['ut'];
            }

            this._sendData(postData);
        },
        _sendData: function(data) {
            var path = PATH + this._id
                + '/1?rn=' + (Math.floor(Math.random() * 1E6))
                + '&wmode=2'
                + '&' + querystring.stringify(data);

            var req = https.request({
                host: HOST,
                port: PORT,
                path: path,
                method: 'GET',
                headers: {
                    'x-real-ip': this._request.ip,
                    'user-agent': this._request['user-agent']
                }
            }, function() {});

            req.end();
        }
    };

    exports.counter = function(settings) {
        return new Counter(settings);
    };
})();
