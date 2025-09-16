const express = require('express')
const app = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const moment = require('moment')
const CheckSingInMiddle = require('../middleware/Middleware')


app.get('/reportstock', CheckSingInMiddle, async (req, res) => {
    try {
        const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm');
        const endOfMonth = moment().endOf('month').format('YYYY-MM-DD hh:mm');

        const queryReport = await prisma.stockmovement.findMany({
            select: {
                movement_date: true,
                quantity: true,
                product: {
                    select: {
                        product_id: true,
                        name: true
                    }
                },
                warehouseLocation_SLI: {
                    select: {
                        location_id: true,
                        name: true
                    }
                },
                reference_number: true,
                remarks: true
            },
            where: {
                movement_type: 'OUT',
                movement_date: {
                    gte: new Date(startOfMonth),
                    lte: new Date(endOfMonth),
                }
            }
        })
        if (queryReport) {
            res.json(queryReport)
        }
    } catch (e) {
        console.error(e.message)
        res.status(500).json({ error: `server error | ${e.message}` })
    }
})

module.exports = app

