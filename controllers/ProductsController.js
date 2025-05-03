const express = require('express')
const app = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const CheckSingInMiddle = require('../middleware/Middleware')

app.get('/', (req, res) => {
    res.send('hello wordl')
})

module.exports = app