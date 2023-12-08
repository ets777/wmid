# What Must I Do

## Запуск

Для разработки необходимо запустить фронт и бэк командами:

```sh
npm run front-start
npm run back-start-dev-watch
```

Для выполнения тестов для бэка:

```sh
npm run back-test-dev
```

Запуск на проде осуществляется через файл `start.sh`. Чтобы проект запускался через сервис, необходимо создать файл `wmid.service` со следующим содержимым:

```bash
[Unit]
Description=WMID

[Service]
Type=simple
Restart=always
RestartSec=1
ExecStart=/var/www/wmid/start.sh
User=root

[Install]
WantedBy=multi-user.target
```

где `/var/www/wmid/` - путь до проекта.

Файл должен находиться в директории `/etc/systemd/system`.

Запуск сервиса осуществляется командой:

```sh
systemctl start wmid
```

Просмотр логов (последних 100 строк):

```sh
journalctl -u wmid -n 100 --no-pager
```

## База данных

В качестве СУБД в проекте используется MySQL. 

Скрипты для создания необходимых таблиц находятся в директории `src/database/tables`. 

Миниальный набор данных для старта проекта расположен в папке `src/database/import`

Тестовые данные хранятся в `src/database/test`.

## Настройки сред

Для настройки сред можно использовать файл-шаблон `.draft.env`.

Настройки среды для разработки должны находиться в файле `.dev.env`. Для прода - `.prod.env`.

Пример заполнения:

```sh
PORT=3000 # порт, на котором будет запущен бэк
DB_HOST=localhost # хост базы данных
DB_USER=root # имя пользователя базы данных
DB_PASSWORD=root # пароль пользователя базы данных
DB_NAME=wmid # название основной базы данных
DB_NAME_TEST=wmid_test # название тестовой базы данных (используется для тестов бэка)
DB_PORT=3306 # порт базы данных
DB_TIMEZONE=+10:00 # часовой пояс базы данных
JWT_ACCESS_SECRET=Mp5p # случайная строка для генерации токена доступа
JWT_REFRESH_SECRET=GDZDN # случайная строка для генерации токена обновления
SWAGGER=1 # запуск сваггера, 1 - запускать, 0 - нет
```

## Процесс публикации изменений

1. Войти на сервер:

```sh
ssh root@40.15.75.130
```

2. Остановить сервис:

```sh
systemctl stop wmid
```

3. Перейти в папку проекта:

```sh
cd /var/www/wmid
```

4. Подтянуть изменения из репозитория:

```sh
git checkout master
git fetch
git pull
```

5. Подтянуть зависимости:

```sh
npm install
```

6. Запустить сервис

```sh
systemctl start wmid
```
