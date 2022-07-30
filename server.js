const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser')
const blog = require('./public/Blog/blog.json');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './public/Blog/images/')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname)
    }
});

const filefilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png'){
        cb(null, true);
    }else{
        cb(null, false)
    }
}
const upload = multer({
    storage: storage,
    fileFilter: filefilter
});

const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(jsonParser)
app.use(urlencodedParser)

app.use('/', express.static('admin'));

const port = parseInt(process.env.PORT || 5000, 10);
const public_path = path.resolve(__dirname, "public");

const public_url = process.env || `http://loclhost:${port}`;

const indexHTML = path.join(public_path, "index.html");
const indexHtmlContent = fs.readFileSync(indexHTML, "utf-8").replace(/__PUBLIC_URL_PLACEHOLDER__/g, public_url);
const admin = fs.readFileSync('./public/Admin/admin.html', 'utf8');

app.use(express.static('public')); // default
app.use(express.static(path.join(__dirname, 'public')));

app.get('', (req, res) => {
    res.send(indexHtmlContent);
});
app.get('/blog', (req, res) => {
    res.send(indexHtmlContent)
})
app.get('/about', (req, res) => {
    res.send(indexHtmlContent)
})

const handler = (req, res) => res.send(path.join(__dirname, "public/index.html"))
const routes = ['/', '/blog', '/about'];
routes.forEach(route => app.get(route, handler))

app.get('/api/customers', (req, res) => {
    const customers = [
        {id: 1, firstName: 'John', lastName: 'Doe'},
        {id: 2, firstName: 'Steve', lastName: 'Smith'},
        {id: 3, firstName: 'Mary', lastName: 'Swanson'}
    ]

    res.json(customers);
})

app.get('/api/Blogs', (req, res) => {
    res.json(blog);
})

var filepath = '/public/Blog/images/';

app.get('/api/Blog/images/:blogImage', (req, res) => {
    const {blogImage} = req.params
    res.sendFile(__dirname + filepath + String(blogImage));
})

app.get('/admin', (req, res) => {
    res.send(admin);
    res.end();
})

app.post('/success', upload.single('filetoupload'), async(req, res) => {
    var data ={
        id: blog.length + 1,
        path: req.file.path.replace(/\\/g, "/").replace("public/", ""),
        tag: req.body.tag,
        time: new Date().toISOString().toLocaleString().replace("T", " ").replace('Z', ""),
        heading: req.body.heading,
        post: req.body.post
    }
    var cp = [...blog, data]
    fs.writeFile('./public/Blog/blog.json', JSON.stringify(cp), function(err){
        if(err) return console.log(err);
    });
    res.write('<h1>Successfully</h1>')
    res.end()
})

app.listen(port, () => {
    console.log(`Server started on ${port}`);
});