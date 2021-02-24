const express = require('express')
var toDo = express();
const exphbs = require('express-handlebars').create({defaultLayout: 'main'});

toDo.engine('handlebars', exphbs.engine);
toDo.set('view engine', 'handlebars');
toDo.set('port', 3000);

toDo.get('/', (req,res) => {
    res.render('home')
});

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