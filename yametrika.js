/*
    Серверная отправка хитов с помощью Node.js в Яндекс.Метрику     
    ===========================================================
    
    Author: Seleznev Denis, hcodes@yandex.ru
    Version: 0.3.0a
    License: MIT
*/

(function () {
	var querystring = require('querystring');
	var http = require('http');

	var YaMetrika = function (data) {
        // Номер счётчика
		this._id = data.id;
        
        // Тип счётчика, 0 - обычный счётчик, 1 - для РСЯ-счётчиков
		this._type = data.type || 0;
        
		this._encoding = data.encoding || 'utf-8';
        
        this._request = {
            host: null,
            url: null,
            referer: null,
            userAgent: null,
            ip: null
        };
	};

	const HOST = 'mc.yandex.ru';
	const PATH = '/watch';
	const PORT = 80;

	YaMetrika.prototype = {
		// Отправка хита
		hit:  function (pageUrl, pageTitle, pageRef, userParams, ut) {
            if (!pageUrl) {
                pageUrl = this._request.url;
            }
            
            if (!pageRef) {
                pageRef = this._request.referer;
            }
            
            this._hitExt(pageUrl, pageTitle, pageRef, userParams, {ut: ut});
		},
		// Достижение цели
		reachGoal: function (target, userParams) {
			var referer;
			if (target) {
				target = 'goal://' + this._request.host + '/' + target;
				referer = this._request.url;
			} else {
				target = this._request.url;
				referer = this._request.referer;
			}
			
			this._hitExt(target, null, referer, userParams, null);
		},
		// Внешняя ссылка
		extLink: function (url, title) {
			if (url) {
				this._hitExt(url, title, this._request.url, null, {
					ln: true,
					ut: 'noindex'
				});
			}
		},
		// Загрузка файла
		file: function (file, title) {
			if (file) {
				this._hitExt(file, title, this._request.url, null, {
					dl: true,
					ln: true
				});
			}
		},
		// Параметры визитов
		params: function (data) {
			if (data) {
				this._hitExt('', '', '', data, {pa: true});
			}
		},
		// Не отказ
		notBounce: function () {
			this._hitExt('', '', '', null, {nb: true});
		},
        setRequest: function (request) {
            if (!request) {
                this._setAutoRequest();
            } else {
                this._request = request;
            }
        },
        _setAutoRequest: function () {
            this._request = {};
        },        
		// Общий метод для отправки хитов
		_hitExt: function (pageUrl, pageTitle, pageRef, userParams, modes) {
			var postData = {};

			if (this._type) {
				postData['cnt-class'] = this._type;
			}
			
			if (pageUrl) {
				postData['page-url'] = encodeURI(pageUrl);
			}
			
			if (pageRef) {
				postData['page-ref'] = encodeURI(pageRef);
			}         
			
			if (modes) {
				modes.ar = true;
			} else  {
				modes = {ar: true};
			}
			
			browserInfo = [];
			for(var key in modes) {
				if (!modes.hasOwnProperty(key)) {
					continue;
				}
				
				if (key != 'ut') {
					browserInfo.push(key + ':' + (modes[key] === true ? '1' : modes[key]));
				}
			}
			
			browserInfo.push('en:' + this._encoding);

			if (pageTitle) {
				browserInfo.push('t:' + encodeURI(pageTitle));
			}
			
			postData['browser-info'] = browserInfo.join(':');
			
			if (userParams) {
				postData['site-info'] = encodeURI(JSON.stringify(userParams));
			}

			if (modes['ut']) {
				postData['ut'] = modes['ut'];
			}

			var path = PATH + this._id + '/1?rn=' + (Math.floor(Math.random() * 1E6)) + '&wmode=2';

			this._postRequest(path, querystring.stringify(postData));
		},
		_postRequest: function (path, dataToSend) {
			var req = http.request({
				host: HOST,
				port: PORT,
				path: path,
				method: 'POST',
				headers: {
					'X-Real-IP': this._request.ip,
					'User-Agent': this._request.userAgent
				},
			});
			
			req.write(dataToSend, this._encoding);
			req.end();
		}
	};

	exports.counter = YaMetrika;
})();
