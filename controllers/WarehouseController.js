const express = require('express')
const app = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const CheckSingInMiddle = require('../middleware/Middleware')

app.get('/', CheckSingInMiddle, async(req, res) => {
    try{
        const query = await prisma.warehouseLocation.findMany({
            select:{
                location_id: true,
                name: true,
                address: true,
                zone: true
            },
            orderBy:{
                createdAt: 'desc'
            },
             where: {
                status_delete: false
            }
        })
        if(query.length !== 0){
            console.log('query location warehouse successfulyyy!!')
            res.json(query)
        }else{
            res.status(404).json({error: 'query error'})
        }
    }catch(error){
        res.status(500).json({error: `server error`})
    }
})

app.post('/create', CheckSingInMiddle, async(req, res) => {
    try{
        const location_name = req.body.location_name
        const location_address = req.body.location_address
        const location_zone = req.body.location_zone

        const result = await prisma.warehouseLocation.create({
            data: {
                name: location_name,
                address: location_address,
                zone: location_zone
            }
        })
        if(result){
            console.log('create location warehouse successfulyyy!!')
            console.log(result)
            res.json(result)
        }
    }catch(e){
        console.error(e.message)
        res.status(500).json({error: `server error`})
    }
})

app.put('/update/:locationId', CheckSingInMiddle, async(req, res) => {
    try{
        const location_id = req.params.locationId

        const location_name = req.body.location_name
        const location_address = req.body.location_address
        const location_zone = req.body.location_zone

        const result = await prisma.warehouseLocation.update({
            where:{
                location_id: parseInt(location_id)
            },
            data:{
                 name: location_name,
                address: location_address,
                zone: location_zone
            }
        })

        if(result){
            console.log('update location warehouse successfulyyy!!')
            console.log(result)
            res.json(result)
        }
    }catch(e){
        console.error(e.message)
        res.status(500).json({error: `server error`})
    }
})

app.delete('/delete/:locationId', CheckSingInMiddle, async(req, res)=> {
    try{
        const location_id = req.params.locationId

        const result = await prisma.warehouseLocation.update({
            where:{
                location_id: parseInt(location_id)
            },
            data:{
                status_delete: true
            }
        })
        if(result){
            console.log('delete location warehouse successfulyyy!!')
            console.log(result)
            res.json(result)
        }
    }catch(e){
        console.error(e.message)
        res.status(500).json({error: `server error`})
    }
})

module.exports = app