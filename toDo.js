const express = require('express')
var toDo = express();
const exphbs = require('express-handlebars').create({defaultLayout: 'main'});
const session = require('express-session');
const parser = require('body-parser');
let jsonParser = parser.json()
let urlParser = parser.urlencoded({extended: false})
toDo.engine('handlebars', exphbs.engine);
toDo.set('view engine', 'handlebars');
toDo.set('port', 3000);

toDo.use(session({secret: 'SuperSecretPassword'}));

toDo.get('/',(req,res, next) => {
    let context = {};
    if(!req.session.name){
        res.render('newSession', context)
        return;
    }
    context.name = req.session.name;
    context.toDoCount = req.session.toDo.length || 0;
    context.toDo = req.session.todo || [];
    console.log(context.todo);
    res.render('todopage', context)
});

toDo.post('/', urlParser, (req,res) => {
    let context = {};
    console.log(req.body);

    if (req.body["New List"]) {
        req.session.name = req.body.name;
        req.session.toDo = [];
        req.session.curId = 0;
    }
    if (!req.session.name) {
        res.render('newSession', context);
        return;
    }
    if(req.body['Add Item']) {
        req.session.toDo.push({"name":req.body.name, "id":req.session.curId});
        req.session.curId ++;
    }
    if(req.body['Done']){
        req.session.toDo = req.session.toDo.filter(function(e){
            return e.id != req.body.id;
        })
    }

    context.name = req.session.name;
    context.toDoCount = req.session.toDo.length;
    context.toDo = req.session.toDo;
    console.log(context.toDo);
    res.render('todopage', context)
})

toDo.get('/count', (req,res) => {
    var context = {};
    context.count = req.session.count || 0;
    req.session.count = context.count + 1;
    res.render('counter', context)
})
toDo.get('/other-page', (req,res) => {
    res.render('other')
});

toDo.use((req,res) => {
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