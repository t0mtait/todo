import express from 'express'
import bodyParser from "body-parser";
import pg from 'pg'
import dotenv from 'dotenv'

const app = express()
const port = 3000
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs')


dotenv.config()
let pw = process.env.PASSWORD

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "todo",
    password: pw,
    port: 5432, 
});
db.connect();

app.get('/', async (req,res) => {
    console.log('fetching todos')
    let result = await db.query('SELECT * from todo')
    let todos = result.rows.map(row => row.task + ' [' + row.id + ']')
    result = await db.query('SELECT task from completed')
    let completedTasks = result.rows.map(row => row.task)
    console.log('todos:', todos)
    res.render('index', { todos: todos , completed: completedTasks })
    console.log('successfully fetched todos')
})

app.post('/add', async (req,res) => {
    await db.query('INSERT INTO todo (task) VALUES ($1)', [req.body.task])
    let result = await db.query('SELECT task from todo')
    let todos = result.rows.map(row => row.task)
    res.redirect('/')
})

app.post('/complete', async (req,res) => {
    let result = await db.query('SELECT task FROM todo WHERE id = $1', [req.body.taskNumber])
    let completedTask = result.rows.map(row => row.task)[0]
    await db.query('DELETE FROM todo WHERE id = $1', [req.body.taskNumber])
    await db.query('INSERT INTO completed (id,task) VALUES ($1,$2)', [req.body.taskNumber,completedTask])
    res.redirect('/')
})

app.listen(port, () => {
    console.log('listening on ', port)
})