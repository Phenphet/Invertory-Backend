const express = require('express')
const app = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const CheckSingInMiddle = require('../middleware/Middleware')

app.get('/summary', CheckSingInMiddle, async (req, res) => {
    try {
        const queryCount = await prisma.product.aggregate({
            _count: {
                quantity:true
            },
        })
        
        const now = new Date();
        const dateOnly = now.toISOString().slice(0, 10)
        const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`)
        const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`)

        const stockMovementData = await prisma.stockmovement.aggregate({
            _count:true,
            where: {
                movement_date: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
        })

        const querySum = await prisma.product.aggregate({
             _sum: {
                quantity: true
            },
        })

        const queryLowQuantity = await prisma.$queryRaw`SELECT count(quantity) as lowQuantity FROM public."Product" WHERE quantity < reoder_level`

        console.log('qury product cal success')
        res.json({
            countProduct: queryCount._count.quantity,
            sumProduct: querySum._sum.quantity,
            sotckMove: stockMovementData._count,
            lowQuantity:  queryLowQuantity.lowQuantity || 0
        })
    } catch (e){
        console.log(e.message)
        res.status(500).json({error: e.message})
    }
})

app.get('/', CheckSingInMiddle, async (req, res) => {
    try {
        const query = await prisma.product.findMany({
            include: {
                category: true,
                warehouselocation: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            where: {
                status_delete: false
            }
        })

        if (query.length !== 0) {
            console.log('quey data successfulyy!')
            res.json(query)
        } else {
            res.status(404).json({ error: 'query error' })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: `server error | ${e.message}` })
    }
})

app.post('/create', CheckSingInMiddle, async (req, res) => {
    try {
        const productName = req.body.product_name
        const productDescription = req.body.procuct_description
        const categoryId = req.body.category_id
        const quantity = req.body.quantity
        const unit = req.body.unit
        const locationId = req.body.location_id
        const reorderLevel = req.body.reorder_level

        const getIdProduct = await prisma.product.findFirst({
            select: {
                product_id: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const productIdQuery = getIdProduct.product_id.split('P')[1]
        const crateId = `P00${parseInt(productIdQuery) + 1}`

        const create = await prisma.product.create({
            data: {
                product_id: crateId,
                name: productName,
                description: productDescription,
                category_id: parseInt(categoryId),
                quantity: parseInt(quantity),
                unit: unit,
                location_id: parseInt(locationId),
                reoder_level: parseInt(reorderLevel)
            }
        })
        console.log('create data successfulyyy')
        res.json(create)
    } catch (e) {
        console.log(e.message)
        res.status(500).json({ error: `server error | ${e.message}` })
    }
})

app.put('/update/:productId', CheckSingInMiddle, async (req, res) => {
    try{
        const productId = req.params.productId

        const productName = req.body.product_name
        const productDescription = req.body.procuct_description
        const categoryId = req.body.category_id
        const quantity = req.body.quantity
        const unit = req.body.unit
        const locationId = req.body.location_id
        const reorderLevel = req.body.reorder_level

        const result = await prisma.product.update({
            where:{
                product_id: productId
            },
            data:{
                name: productName,
                description: productDescription,
                category_id: parseInt(categoryId),
                quantity: parseInt(quantity),
                unit: unit ,
                location_id: parseInt(locationId) ,
                reoder_level: parseInt(reorderLevel),
            }
        })

        console.log('update data successfulyyy!')
        res.json(result)

    }catch(e){
        console.log(e.message)
        res.status(500).json({ error: `server error | ${e.message}` })
    }
})

app.delete('/delete/:productId', CheckSingInMiddle, async (req, res) => {
    try {
        const productId = req.params.productId
        const result = await prisma.product.update({
            where:{
                product_id: productId
            },
            data: {
                status_delete: true
            }
        })
        console.log('delete data product successfulyyy')
        res.json(result)

    } catch (e) {
        console.log(e.message)
        res.status(500).json({ error: `server error | ${e.message}` })
    }
})

module.exports = app