/**
 * Серверная отправка хитов с помощью Node.js в Яндекс.Метрику
 *
 * Author: Denis Seleznev <hcodes@yandex.ru>
 * License: MIT
 */

'use strict';

const
    querystring = require('querystring'),
    https = require('https'),
    HOST = 'mc.yandex.ru',
    PATH = '/watch/',
    PORT = 443;

class Counter {
    /**
     * Конструктор счётчика Метрики
     * @constructor
     *
     * @param {Object} settings - Настройки счётчика.
     * @param {string|number} settings.id - Номер счётчика.
     * @param {number} [settings.type] - Тип счётчика: 0 - обычный счётчик, 1 - РСЯ-счётчик.
     */
    constructor(settings) {
        this._id = settings.id;
        this._type = settings.type || 0;

        this._request = {
            host: null,
            url: null,
            referer: null,
            'user-agent': null,
            ip: null
        };
        this._onerror = function (err) {
            if (err)
                return true;
        }
    }

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
     * counter.hit('https://mysite.org', 'Main page', 'https://google.com/...');
     */
    hit(pageUrl, pageTitle, pageRef, userParams, ut) {
        if (!pageUrl) {
            pageUrl = this._request.url;
        }

        if (!pageRef) {
            pageRef = this._request.referer;
        }

        this._hitExt(pageUrl, pageTitle, pageRef, userParams, {ut});

        return this;
    }

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
    reachGoal(target, userParams) {
        const req = this._request;
        let referer;
        if (target) {
            target = 'goal://' + req.host + '/' + target;
            referer = req.url;
        } else {
            target = req.url;
            referer = req.referer;
        }

        this._hitExt(target, null, referer, userParams, null);

        return this;
    }

    /**
     * Внешняя ссылка.
     *
     * @param {string} url - Адрес страницы.
     * @param {string} [title] - Заголовок страницы.
     *
     * @returns {Object} this
     *
     * @example
     * counter.extLink('https://nodejs.org');
     */
    extLink(url, title) {
        if (url) {
            this._hitExt(url, title, this._request.url, null, {
                ln: true,
                ut: 'noindex'
            });
        }

        return this;
    }

    /**
     * Загрузка файла.
     *
     * @param {string} file - Ссылка на файл.
     * @param {string} [title] - Заголовок страницы.
     *
     * @returns {Object} this
     *
     * @example
     * counter.file('https://mysite.org/secret.zip');
     */
    file(file, title) {
        if (file) {
            this._hitExt(file, title, this._request.url, null, {
                dl: true,
                ln: true
            });
        }

        return this;
    }

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
    params(data) {
        const
            len = arguments.length,
            obj = {};

        let pointer = obj;
        if (len > 1) {
            for (let i = 0; i < len - 1; i++) {
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
    }

    /**
     * Не отказ.
     *
     * @returns {Object} this
     *
     * @example
     * counter.notBounce();
     */
    notBounce() {
        this._hitExt('', '', '', null, {nb: true});

        return this;
    }

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
    req(req) {
        const rh = req.headers;
        this._request = {
            host: rh.host,
            url: this._protocol(req) + '://' + rh.host + req.url,
            referer: rh.referer,
            'user-agent': rh['user-agent'],
            ip: this._clientIP(req)
        };

        return this;
    }

    _clientIP(req) {
        const rh = req.headers;
        return rh['x-real-ip'] || rh['x-forwarded-for'] || rh['x-remote-ip'] || rh['x-originating-ip'] || req.connection.remoteAddress;
    }

    _protocol(req) {
        const rh = req.headers;
        return rh['x-forwarded-proto'] || rh.protocol || (req.secure ? 'https' : 'http');
    }

    _hitExt(pageUrl, pageTitle, pageRef, userParams, modes) {
        const postData = {};

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

        const browserInfo = [];
        Object.keys(modes).forEach((key) => {
            if (key != 'ut') {
                browserInfo.push(key + ':' + (modes[key] === true ? '1' : modes[key]));
            }
        });

        browserInfo.push('en:utf-8');
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
    }

    _sendData(data) {
        if (this._onerror()) {
            return;
        }
        const path = PATH + this._id
            + '/1?rn=' + (Math.floor(Math.random() * 1E6))
            + '&wmode=2'
            + '&' + querystring.stringify(data);

        const req = https.request({
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
}

module.exports.counter = function(settings) {
    return new Counter(settings);
};
