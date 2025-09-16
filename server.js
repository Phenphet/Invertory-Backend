const exress = require('express')
const app = exress()
const cors = require('cors')
const bodyParser = require('body-parser')

const UserController = require('./controllers/UserController')
const ProductController = require('./controllers/ProductsController')
const CateoryController = require('./controllers/CategoryController')
const WarehouseCOntroller = require('./controllers/WarehouseController')
const StockController = require('./controllers/StockController')
const DasbordController = require('./controllers/DasbordController')
const ReportingController = require('./controllers/ReporitingController')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

app.use('/user', UserController)
app.use('/product', ProductController)
app.use('/category', CateoryController)
app.use('/warehouse', WarehouseCOntroller)
app.use('/stock', StockController)
app.use('/dasbord', DasbordController)
app.use('/report', ReportingController)

app.listen(3001, () => {
    console.log(`server running port 3001`)
})