const exress = require('express')
const app = exress()
const cors = require('cors')
const bodyParser = require('body-parser')

const UserController = require('./controllers/UserController')
const ProductController = require('./controllers/ProductsController')


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

app.use('/user', UserController)
app.use('/product', ProductController)


app.listen(3001, () => {
    console.log(`server running port 3001`)
})