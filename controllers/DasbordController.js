const express = require('express')
const app = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const moment = require('moment')
const CheckSingInMiddle = require('../middleware/Middleware')

app.get('/summary', CheckSingInMiddle, async (req, res) => {
    try {
        const queryCount = await prisma.product.aggregate({
            _count: {
                quantity:true
            },
        })

       const stockMovementData = await prisma.stockmovement.aggregate({
            _count:true,
            where: {
                movement_date: {
                    gte: new Date('2025-05-02T00:00:00.000Z'),
                    lt: new Date('2025-05-03T00:00:00.000Z'),
                },
            },
        });

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

app.get('/chartdata', CheckSingInMiddle, async (req, res)=> {
    try {
        const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm');
        const endOfMonth   = moment().endOf('month').format('YYYY-MM-DD hh:mm');
        
        const queryStockIn = await prisma.stockmovement.findMany({
            select: {
                movement_type: true,
                quantity: true,
                movement_date: true
            },
            where: {
                movement_type: "IN",
                status_delete: false,
                movement_date: {
                    gte: new Date(startOfMonth),
                    lte: new Date(endOfMonth)
                }
            }
        })
        const queryStockOut = await prisma.stockmovement.findMany({
             select: {
                movement_type: true,
                quantity: true,
                movement_date: true
            },
            where: {
                movement_type: "OUT",
                status_delete: false,
                movement_date: {
                    gte: new Date(startOfMonth),
                    lte: new Date(endOfMonth)
                }
            }
        })
        res.json({
            stockIn: queryStockIn,
            stockOut: queryStockOut
        })
    } catch(e) {
        console.log(e.message)
        res.status(500).json({error: e.message})
    }
})

app.get('/recentstock', CheckSingInMiddle, async (req, res) => {
    try {
        const query = await prisma.stockmovement.findMany({
            select: {
                movement_id: true,
                movement_date: true,
                movement_type: true,
                product: {
                    select: {
                        product_id: true,
                        name: true
                    }
                },
                quantity: true,
                warehouseLocation_DLI: {
                    select: {
                        location_id: true,
                        name: true,
                       
                    }
                },
                warehouseLocation_SLI: {
                    select: {
                        location_id: true,
                        name: true,
                       
                    }
                },
                remarks: true
            },
            take: 4,
            orderBy: {
                createdAt: 'desc'
            } 
        })
        if(query){
            // console.log(query)
            res.json(query)
        }
    } catch (e) {
        console.log(e.message)
        res.status(500).json({error: e.message})
    }
})

app.get('/curentstock', CheckSingInMiddle, async (req, res) => {
    try {
        const result = await prisma.product.findMany({
            take: 4,
            select: {
                name: true,
                quantity: true,
                stockmovement: {
                    select: {
                        quantity: true,
                    },
                    orderBy: {
                        createdAt: 'desc', // หรือใช้ createdAt ถ้ามี
                    },
                },
            },
            where: {
                status_delete: false
            }
        });

        if(result) {
            const data = result.map(item => ({
            name: item.name,
            quantity: item.quantity,
            latestStockMovement: item.stockmovement.at(-1)?.quantity || 0,
            }));

            console.log(data);
            res.json(data)
        }

    }catch(e){
        console.log(e.message)
        res.status(500).json({error: e.message})
    }
}) 
module.exports = app