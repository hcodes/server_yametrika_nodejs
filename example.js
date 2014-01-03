////////////////////////////////////////////
//// Примеры использования модуля yametrika
////////////////////////////////////////////

// 123456 - номер счётчика, site - для использования относительных адресов страниц
var counter = require('yametrika').counter({id: 123456, site: 'http://example.ru'});
    
// Параметры визита
var myParams = {
	level1: {
		level2: 1
	}
};

// Отправка хита
counter.hit('http://example.ru', 'Main page', 'http://ya.ru');

// Для работы с относительными урлами необходимо указать свойство site при создании счётчика
counter.hit('/index.html', 'Main page', '/back.html');

// Отправка хита вместе с параметрами визита
counter.hit('http://example.ru', 'Main page', 'http://ya.ru', myParams);

// Отправка хита вместе с параметрами визита и с запретом на индексацию
counter.hit('http://example.ru', 'Main page', 'http://ya.ru', myParams, 'noindex');

// Достижение цели
counter.reachGoal('back');

// Достижение цели с параметрами визита
counter.reachGoal('back', myParams);

// Внешняя ссылка - отчёт "Внешние ссылки"
counter.extLink('http://yandex.ru');

// Загрузка файла - отчёт "Загрузка файлов"
counter.file('http://example.ru/file.zip');

// Для работы с относительными урлами необходимо указать свойство site при создании счётчика
counter.file('/file.zip');

// Отправка параметров визита - отчёт "Параметры визитов"
counter.params({level1: {level2: 1});
// или
counter.params('level1', 'level2', 1);

// Не отказ
counter.notBounce();