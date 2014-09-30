# Серверное отслеживание посетителей с помощью Яндекс.Метрики для Node.js

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
**В настройках счётчика во вкладке "Фильтры" / "Фильтрация роботов" необходимо выбрать опцию "Учитывать посещения всех роботов". В противном случае, статистика собираться не будет.**

## Ограничения
Отчёты, которые будут недоступны в Метрике при серверной отправки:
+ Половозрастная структура
+ Пол и возраст
+ Разрешения дисплеев
+ Версия Flash и Silverlight
+ Вебвизор, аналитика форм
+ Карта кликов

Уникальные посетители считаются по User Agent и IP-адресу.

## Установка
`npm install yametrika`

## Использование
  ```JavaScript
var http = require('http');

// Создаем счётчик, 12345 - номер счётчика
var counter = require('yametrika').counter({id: 12345});

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('okay');
  
    // Заполняем нужные данные из запроса к серверу для отправки данных в Метрику
    counter.req(req);
    
    // Страница http://example.com, с заголовком 'Main page'
    // переход был с http://google.com (реферер)
    counter.hit('http://example.com', 'Main page', 'http://google.com');
}).listen(8080);  
  ```
  
## Отправка хита
  ```JavaScript
/**
 * @param {string} pageUrl - адрес страницы
 * @param {string} [pageTitle] - заголовок страницы
 * @param {string} [pageRef] - реферер страницы
 * @param {Object} [userParams] - параметры визитов
 * @param {string} [ut] - для запрета индексирования 'noindex'
 * @return {Object} this
 * 
 * hit: function (pageUrl, pageTitle, pageRef, userParams, ut) {}
 */          
 
counter.hit('http://mysite.org', 'Main page', 'http://google.com/...');

// С запретом на индексирование и параметрами визитов
counter.hit('http://mysite.org', 'Main page', 'http://google.com/...', {level1: {level2: 1}}, 'noindex');
  ```
  
## Достижение цели
  ```JavaScript
/**
 * @param {string} target - название цели
 * @param {Object} [userParams] - параметры визитов
 * 
 * reachGoal: function (target, userParams) {}
*/   

counter.reachGoal('goalName');

// С параметрами визитов
counter.reachGoal('goalName', {level1: {level2: 1}});
  ```

## Внешняя ссылка
  ```JavaScript
/**
 * @param {string} url - адрес страницы
 * @param {string} [title] - заголовок страницы
 * @return {Object} this
 * 
 * extLink: function (url, title) {}
 * @example
 */         
 
counter.extLink('http://nodejs.org');  
  ```

## Загрузка файла  
  ```JavaScript
/**
 * @param {string} file - ссылка на файл
 * @param {string} [title] - заголовок страницы
 * @return {Object} this
 * 
 * file: function (file, title) {}
 */        
 
counter.file('http://mysite.org/secret.zip');
  ```
  
## Параметры визитов
  ```JavaScript
/**
 * @param {...*} параметры визитов
 * @return {Object} this         
 * 
 * params: function (...) {}
 */         
 
counter.params({level1: {level2: {level3: 1}}});

// или
counter.params('level1', 'level2', 'level3', 1);
  ```
  
## Не отказ
  ```JavaScript
/**
 * @return {Object} this
 * 
 */
 
counter.notBounce();
  ```
  
## Полезные ссылки
+ [Версия для PHP](https://github.com/hcodes/server_yametrika/)
+ [Помощь Яндекс.Метрики](http://help.yandex.ru/metrika/)

## Лицензия
MIT License
