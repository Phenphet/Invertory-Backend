const express = require('express')
const app = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const CheckSingInMiddle = require('../middleware/Middleware')

app.get('/', CheckSingInMiddle, async(req, res) => {
    try{
        const quuery = await prisma.category.findMany({
            select: {
                category_id: true,
                name: true,
                description : true,
            },
            where: {
                status_delete: false
            },
            orderBy:{
                createdAt: 'desc'
            }
        })
        if(quuery.length !== 0){
            console.log('quey data successfulyy!')
            res.json(quuery)
        }else{
            res.status(404).json({error: 'query error'})
        }
    }
    catch(e){
        res.status(500).json({error: `server error | ${e.message}`})
    }
})

app.post('/create', CheckSingInMiddle, async(req, res) => {
    try{
        const name = req.body.categoryName
        const description = req.body.categoryDescription

        const result = await prisma.category.create({
            data:{
                name: name,
                description: description
            }
        })

        if(result) {
            console.log('create data successfulyyy!')
            console.log(result)
            res.json(result)
        }
    }catch(e){
        res.status(500).json({error: `server error | ${e.message}`})
    }
})

app.put('/update/:categoryId', CheckSingInMiddle, async(req, res) => {
    try{
        const categoryId = req.params.categoryId
        const name = req.body.categoryName
        const description = req.body.categoryDescription

        const result = await prisma.category.update({
            where: {
                category_id: parseInt(categoryId)
            },
            data: {
                name: name,
                description: description
            }
        })

         if(result) {
            console.log('update data successfulyyy!')
            console.log(result)
            res.json(result)
        }
    }catch(e){
        console.error(e.message)
        res.status(500).json({error: `server error | ${e.message}`})
    }
})

app.delete('/delete/:categoryId', CheckSingInMiddle, async(req, res) => {
    try{
        const categoryId = req.params.categoryId
        
        const result = await prisma.category.update({
            where: {
                category_id: parseInt(categoryId)
            }, 
            data: {
                status_delete: true
            }
        })

        if(result){
            console.log('delete data successfulyyy!')
            console.log(result)
            res.json(result)
        }

    }catch(e){
        console.error(e.message)
        res.status(500).json({error: `server error | ${e.message}`})
    }
})
module.exports = app