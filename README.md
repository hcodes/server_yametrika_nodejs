# Серверное отслеживание посетителей с помощью Яндекс.Метрики для Node.js
[![NPM version](https://img.shields.io/npm/v/yametrika.svg)](https://www.npmjs.com/package/yametrika)
[![NPM Downloads](https://img.shields.io/npm/dm/yametrika.svg?style=flat)](https://www.npmjs.org/package/yametrika)
[![install size](https://packagephobia.com/badge?p=yametrika)](https://packagephobia.com/result?p=yametrika)


В некоторых случаях требуется отслеживать действия на стороне сервера.

Например:
+ Слежка за поисковыми роботами
+ Редиректы
+ Загрузка файлов
+ Страницы с ошибками (403, 404, 500)
+ RSS
+ Время выполнения скриптов
+ Время запросов к базам данных
+ Треккинг AJAX-запросов
+ и пр.

## Возможности
+ Загрузка страницы - hit()
+ Внешняя ссылка - extLink()
+ Загрузка файла - file()
+ Параметры визита - params()
+ Неотказ - notBounce()

## Настройки счётчика Метрики
**В настройках счётчика во вкладке «Фильтры» / «Фильтрация роботов» необходимо выбрать опцию «Учитывать посещения всех роботов». В противном случае, статистика собираться не будет.**

## Ограничения
Отчёты, которые будут недоступны в Метрике при серверной отправки:
+ Половозрастная структура
+ Пол и возраст
+ Разрешения дисплеев
+ Версия Flash
+ Вебвизор, аналитика форм
+ Карта кликов

Уникальные посетители считаются по user agent'у и IP-адресу.

## Установка
`npm install yametrika`

## Использование
```js
var http = require('http');

// Создаем счётчик, 12345 — номер счётчика
var counter = require('yametrika').counter({id: 12345});

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('okay');

    // Заполняем счётчик данными (referer, ip и ua) из запроса к серверу.
    counter.req(req);

    // Страница https://example.com, с заголовком 'Main page'
    // переход был с реферером https://othersite.com
    counter.hit('https://example.com', 'Main page', 'https://othersite.com');
}).listen(8080);
```

## Отправка хита
```js
/**
 * @param {string} pageUrl - Адрес страницы.
 * @param {string} [pageTitle] - Заголовок страницы.
 * @param {string} [pageRef] - Реферер страницы.
 * @param {Object} [userParams] - Параметры визитов.
 * @param {string} [ut] - Для запрета индексирования 'noindex'
 *
 * @returns {Object} this
 */
counter.hit('https://mysite.org', 'Main page', 'https://google.com/...');

// С запретом на индексирование и параметрами визитов
counter.hit('https://mysite.org', 'Main page', 'https://google.com/...', {level1: {level2: 1}}, 'noindex');
```

## Достижение цели
```js
/**
 * @param {string} target - Название цели.
 * @param {Object} [userParams] - Параметры визитов.
 *
 * @returns {Object} this
 */
counter.hit();
counter.reachGoal('goalName');

// или

// С параметрами визитов
counter.hit();
counter.reachGoal('goalName', {level1: {level2: 1}});
```
Вызов метода `hit()` перед `reachGoal()` необходим для корректной привязки цели к визиту.

## Внешняя ссылка
```js
/**
 * @param {string} url - Адрес страницы.
 * @param {string} [title] - Заголовок страницы.
 *
 * @returns {Object} this
 */
counter.extLink('https://nodejs.org');
```

## Загрузка файла
```js
/**
 * @param {string} file - Ссылка на файл.
 * @param {string} [title] - Заголовок страницы.
 *
 * @returns {Object} this
 */
counter.file('https://mysite.org/secret.zip');
```

## Параметры визитов
```js
/**
 * @param {...*} data - Параметры визитов.
 *
 * @returns {Object} this
 */
counter.params({level1: {level2: {level3: 1}}});

// или
counter.params('level1', 'level2', 'level3', 1);
```

## Не отказ
```js
/**
 * @returns {Object} this
 */
counter.notBounce();
```

## Полезные ссылки
+ [Версия для PHP](https://github.com/hcodes/server_yametrika/)
+ [Помощь Яндекс.Метрики](https://yandex.ru/support/metrika/)

## Лицензия
MIT License
