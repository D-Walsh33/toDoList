const express = require('express')
const request = require('request')
const exphbs = require('express-handlebars').create({ defaultLayout: 'main' });
const session = require('express-session');
const parser = require('body-parser');
const myAppId = '3bce35859e726137df7f1d0c91aec15e'

let jsonParser = parser.json()
let urlParser = parser.urlencoded({ extended: false })

var toDo = express();

toDo.engine('handlebars', exphbs.engine);
toDo.set('view engine', 'handlebars');
toDo.set('port', 3000);

toDo.use(session({ secret: 'SuperSecretPassword' }));

toDo.get('/', (req, res, next) => {
    let context = {};
    if (!req.session.name) {
        res.render('newSession', context)
        return;
    }
    context.name = req.session.name;
    context.toDoCount = req.session.toDo.length || 0;
    context.toDo = req.session.todo || [];
    console.log(context.todo);
    res.render('todopage', context)
});

toDo.post('/', urlParser, (req, res) => {
    let context = {};

    if (req.body["New List"]) {
        req.session.name = req.body.name;
        req.session.toDo = [];
        req.session.curId = 0;
    }
    if (!req.session.name) {
        res.render('newSession', context);
        return;
    }
    if (req.body['Add Item']) {
        req.session.toDo.push({ "name": req.body.name, "id": req.session.curId, "city": req.body.city, "temp": req.body.temp, "YorN": false });
        req.session.curId++;
    }

    if (req.body['Done']) {
        req.session.toDo = req.session.toDo.filter(function (e) {
            return e.id != req.body.id;
        })
    }

    context.name = req.session.name;
    context.toDoCount = req.session.toDo.length;
    context.toDo = req.session.toDo;
    for (let toDoitem = 0; toDoitem < context.toDo.length; toDoitem++) {
        request(`http://api.openweathermap.org/data/2.5/weather?q=${context.toDo[toDoitem].city}&APPID=` + myAppId, function (err, response, body) {
            if (!err && response.statusCode < 400) {
                const response = JSON.parse(body).main.temp - 273.15
                console.log(response)
                if (response >= context.toDo[toDoitem].temp) {
                    context.toDo[toDoitem].YorN = true;
                    console.log(context.toDo)
                }
            } else {
                console.log(err);
                if (response) {
                    console.log(response.statusCode);
                }
                next(err);
            }
        });
    };
    console.log(context.toDo)
    res.render('todopage', context);
});

toDo.get('/count', (req, res) => {
    var context = {};
    context.count = req.session.count || 0;
    req.session.count = context.count + 1;
    res.render('counter', context)
})
toDo.get('/other-page', (req, res) => {
    res.render('other')
});



toDo.use((req, res) => {
    res.status(404);
    res.render('404');
});

toDo.use((err, req, res) => {
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
})
toDo.listen(toDo.get('port'), () => {
    console.log('Express started on http://localhost:' + toDo.get('port') + 'press Ctrl-c to terminate.')
});


