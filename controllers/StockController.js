const express = require('express')
const app = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const CheckSingInMiddle = require('../middleware/Middleware')

app.get('/', CheckSingInMiddle, async (req, res) => {
    try {
        const query = await prisma.stockmovement.findMany({
            include: {
                product: true,
                warehouseLocation_SLI: true,
                warehouseLocation_DLI: true,
            },
            orderBy:{
               movement_id: 'desc'
            }
        })
        if (query.length !== 0) {
            console.log('query stock successfully!!!')
            res.json(query)
        } else {
            res.status(404).json({ error: 'query error' })
        }
    } catch (e) {
        res.status(500).json({ error: `server error` })
    }
})

app.get('/movement/:type', CheckSingInMiddle, async (req, res) => {
    try {
        const param = req.params.type
        const query = await prisma.stockmovement.findMany({
            select: {
                movement_id: true,
                quantity: true,
                movement_date: true,
                reference_number: true,
                remarks: true,
                product: {
                    select: {
                        product_id: true,
                        name: true,
                        quantity: true
                    }
                },
                warehouseLocation_SLI: {
                    select: {
                        location_id: true,
                        name: true,
                        address: true,
                        zone: true
                    }

                },
                warehouseLocation_DLI: {
                    select: {
                        location_id: true,
                        name: true,
                        address: true,
                        zone: true
                    }
                }
            },
            where: {
                movement_type: param,
                status_delete: false
            },
            orderBy:{
               createdAt: 'desc'
            }
        })
        if (query.length !== 0) {
            console.log(`query stock ${param} successfully!!!`)
            res.json(query)
        }else{
            res.json({data: 'data not found'})
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ error: `server error` })
    }
})

// inbound create 

app.post('/create/inbound', CheckSingInMiddle, async (req, res) => {
    try {
        const productId = req.body.product_id
        const movementDate = new Date(req.body.movement_date)
        const destinationLocation = req.body.destination_location
        const quantity = req.body.quantity
        const remarks = req.body.remarks
        const referenceNumber = req.body.reference_number
        
        const result = await prisma.stockmovement.create({
            data: {
                product_id: productId,
                movement_type: "IN",
                movement_date: movementDate,
                quantity: parseInt(quantity),
                reference_number: referenceNumber,
                destination_location_id: destinationLocation,
                remarks: remarks
            }
        })

        if(result){
            const queryProduct = await prisma.product.findFirst({
                select:{
                    product_id: true,
                    quantity: true
                },
                where: {
                    product_id: result.product_id
                }
            })
            console.log(queryProduct)
            if(queryProduct){
                const updateProduct = await prisma.product.update({
                    data: {
                        quantity: {
                            increment: result.quantity
                        }
                    },
                    where:{
                        product_id: queryProduct.product_id
                    }
                })
                if(updateProduct){
                    // console.log(updateProduct)
                    console.log('update product quantity success')
                }
            }
            console.log('create stock inbound successfulyyy!!!')
            res.json(result)
        }

    }catch(e){
        console.error(e.message)
        res.status(500).json({error: `server error ${e.message}`})
    }
})

app.put('/update/inbound/:movementId', CheckSingInMiddle, async(req, res) => {
    try{
        const movementId = req.params.movementId
        const productId = req.body.product_id
        const movementType = req.body.movement_type
        const movementDate = new Date(req.body.movement_date)
        const destinationLocation = req.body.destination_location
        const quantity = req.body.quantity
        const remarks = req.body.remarks
        const referenceNumber = req.body.reference_number

        const queryMovement = await prisma.stockmovement.findFirst({
            select: {
                quantity: true
            },
            where: {
                movement_id: parseInt(movementId)
            }
        })

        if( queryMovement ){
            const curentQuantity = queryMovement.quantity
            console.log('ค่า quantity เก่า',curentQuantity)

            const updateInbound = await prisma.stockmovement.update({
                data: {
                    product_id: productId,
                    movement_type: movementType,
                    movement_date: movementDate,
                    quantity: parseInt(quantity),
                    reference_number: referenceNumber,
                    destination_location_id: destinationLocation,
                    remarks: remarks
                },
                where: {
                    movement_id: parseInt(movementId)
                }
            })
            if(updateInbound){
                const updateProductDecrement = await prisma.product.update({
                    data:{
                        quantity: {
                            decrement: parseInt(curentQuantity)
                        }
                    },
                    where:{
                        product_id: updateInbound.product_id
                    }
                })
                if(updateProductDecrement){
                    const updateProductIncrement = await prisma.product.update({
                        data:{
                            quantity: {
                                increment: parseInt(updateInbound.quantity)
                            }
                        },
                        where:{
                            product_id: updateInbound.product_id
                        }
                            
                    })
                    if(updateProductIncrement){
                        console.log('success')
                        res.json(updateInbound)
                    }else{
                        console.error(`error can't update data quantity pleas check your error `)
                    }
                }else{
                    console.error('update curentQuantity error')
                }
            }else{
                console.error('update inbound error')
            }
        }else{
            console.error('query curent quantity error')
        }
        
    }catch(e){
        console.error(e.message)
        res.status(500).json({error: `server error ${e.message}`})
    }
})

app.delete('/delete/inbound/:movementId', CheckSingInMiddle, async(req, res) => {
    try{
        const movementId = req.params.movementId
        const queryProduct = await prisma.stockmovement.findFirst({
            select:{
                quantity: true,
                product_id: true
            },
            where: {
                movement_id: parseInt(movementId)
            }
        })
        if(queryProduct) {
            const updateProduct = await prisma.product.update({
                data: {
                    quantity:{
                        decrement: queryProduct.quantity
                    }
                },
                where: {
                    product_id: queryProduct.product_id
                }
            })
            if(updateProduct){
                console.log(updateProduct)
                const result = await prisma.stockmovement.update({
                    data: {
                        status_delete: true
                    },
                    where: {
                        movement_id: parseInt(movementId)
                    }
                })
                if(result){
                    console.log('delete Inbound stock successfully!!!')
                    res.json(result)
                }else{
                    console.log('update Inbound error')
                }
            }else{
                console.log('update product error')
            }
        }else{
            console.log('query error pleass check params')
        }
    }catch(e){
        console.error(e.message)
        res.status(500).json({error: `server error ${e.message}`})
    }
})

// create outbound

app.post('/create/outbound', CheckSingInMiddle, async(req, res) => {
    try{
        const productId = req.body.product_id
        const movementDate = new Date(req.body.movement_date)
        const sourceLocation = req.body.source_location
        const quantity = req.body.quantity
        const remarks = req.body.remarks
        const referenceNumber = req.body.reference_number
        
        const result = await prisma.stockmovement.create({
            data:{
                product_id: productId,
                movement_type: "OUT",
                movement_date: movementDate,
                quantity: parseInt(quantity),
                reference_number: referenceNumber,
                source_location_id: sourceLocation,
                remarks: remarks
            }
        })
        if(result){
          const queryProduct = await prisma.product.findFirst({
                select:{
                    product_id: true,
                    quantity: true
                },
                where: {
                    product_id: result.product_id
                }
            })
            console.log(queryProduct)
            if(queryProduct){
                const updateProduct = await prisma.product.update({
                    data: {
                        quantity: {
                            decrement: result.quantity
                        }
                    },
                    where:{
                        product_id: queryProduct.product_id
                    }
                })
                if(updateProduct){
                    console.log('update product quantity success')
                }
            }
            console.log('create stock outbound successfulyyy!!!')
            res.json(result)
        }
    }catch(e){
        console.error(e.message)
        res.status(500).json({error: `server error ${e.message}`})
    }
})

app.put('/update/outbound/:movementId', CheckSingInMiddle, async(req, res) => {
    try{
        const movementId = req.params.movementId
        const productId = req.body.product_id
        const movementDate = new Date(req.body.movement_date)
        const sourceLocation = req.body.source_location
        const quantity = req.body.quantity
        const remarks = req.body.remarks
        const referenceNumber = req.body.reference_number

        const queryMovement = await prisma.stockmovement.findFirst({
            select: {
                quantity: true
            },
            where: {
                movement_id: parseInt(movementId)
            }
        })

        if( queryMovement ){
            const curentQuantity = queryMovement.quantity
            console.log('ค่า quantity เก่า',curentQuantity)

            const updateInbound = await prisma.stockmovement.update({
                data: {
                    product_id: productId,
                    movement_type: "OUT",
                    movement_date: movementDate,
                    quantity: parseInt(quantity),
                    reference_number: referenceNumber,
                    source_location_id: sourceLocation,
                    remarks: remarks
                },
                where: {
                    movement_id: parseInt(movementId)
                }
            })
            if(updateInbound){
                const updateProductDecrement = await prisma.product.update({
                    data:{
                        quantity: {
                            increment: parseInt(curentQuantity)
                        }
                    },
                    where:{
                        product_id: updateInbound.product_id
                    }
                })
                if(updateProductDecrement){
                    const updateProductIncrement = await prisma.product.update({
                        data:{
                            quantity: {
                                decrement: parseInt(updateInbound.quantity)
                            }
                        },
                        where:{
                            product_id: updateInbound.product_id
                        }
                            
                    })
                    if(updateProductIncrement){
                        console.log('success')
                        res.json(updateInbound)
                    }else{
                        console.error(`error can't update data quantity pleas check your error `)
                    }
                }else{
                    console.error('update curentQuantity error')
                }
            }else{
                console.error('update outbound error')
            }
        }else{
            console.error('query curent quantity error')
        }

    }catch(e){
        console.error(e.message)
        res.status(500).json({error: `server error ${e.message}`})
    }
})

app.delete('/delete/outbound/:movementId', CheckSingInMiddle, async(req, res) => {
    try{
        const movementId = req.params.movementId
        const queryProduct = await prisma.stockmovement.findFirst({
            select:{
                quantity: true,
                product_id: true
            },
            where: {
                movement_id: parseInt(movementId)
            }
        })
        if(queryProduct) {
            const updateProduct = await prisma.product.update({
                data: {
                    quantity:{
                        increment: queryProduct.quantity
                    }
                },
                where: {
                    product_id: queryProduct.product_id
                }
            })
            if(updateProduct){
                console.log(updateProduct)
                const result = await prisma.stockmovement.update({
                    data: {
                        status_delete: true
                    },
                    where: {
                        movement_id: parseInt(movementId)
                    }
                })
                if(result){
                    console.log('delete Outbound stock successfully!!!')
                    res.json(result)
                }else{
                    console.log('update Outbound error')
                }
            }else{
                console.log('update product error')
            }
        }else{
            console.log('query error pleass check params')
        }
    }catch(e){
        console.error(e.message)
        res.status(500).json({error: `server error ${e.message}`})
    }
    
})

// create tranfer 

app.post('/create/tranfer', CheckSingInMiddle, async(req, res)=> {
    try{
        const productId = req.body.product_id
        const movementDate = new Date(req.body.movement_date)
        const destinationLocation = req.body.destination_location
        const sourceLocation = req.body.source_location
        const quantity = req.body.quantity
        const remarks = req.body.remarks
        const referenceNumber = req.body.reference_number

        const result = await prisma.stockmovement.create({
            data: {
                product_id: productId,
                movement_type: "TRANSFER",
                movement_date: movementDate,
                source_location_id: sourceLocation,
                quantity: parseInt(quantity),
                reference_number: referenceNumber,
                destination_location_id: destinationLocation,
                remarks: remarks
            }
        })    

        if(result){
            console.log('create data stock transfer successfully!!!!')
            res.json(result)
        }
        else{
            console.log('create data stock error pleass check data')
            res.status(404).json({error: 'check error pleass'})
        }
    
    }catch(e){
        console.error(e.message)
        res.status(500).json({error: `server error ${e.message}`})
    }
})

app.put('/update/tranfer/:movementId', CheckSingInMiddle, async(req, res)=> {
    try{
        const movementId = req.params.movementId
        const productId = req.body.product_id
        const movementDate = new Date(req.body.movement_date)
        const destinationLocation = req.body.destination_location
        const sourceLocation = req.body.source_location
        const quantity = req.body.quantity
        const remarks = req.body.remarks
        const referenceNumber = req.body.reference_number

        const result = await prisma.stockmovement.update({
            data: {
                product_id: productId,
                movement_date: movementDate,
                source_location_id: sourceLocation,
                quantity: parseInt(quantity),
                reference_number: referenceNumber,
                destination_location_id: destinationLocation,
                remarks: remarks
            },
            where:{
                movement_id: parseInt(movementId)
            }
        })    

        if(result){
            console.log('create data stock transfer successfully!!!!')
            res.json(result)
        }
        else{
            console.log('create data stock error pleass check data')
            res.status(404).json({error: 'check error pleass'})
        }

    }catch(e){
        console.error(e.message)
        res.status(500).json({error: `server error ${e.message}`})
    }
})

app.delete('/delete/tranfer/:movementId', CheckSingInMiddle, async(req, res)=> {
    try{
        const movementId = req.params.movementId

        const result = await prisma.stockmovement.update({
            data:{
                status_delete: true
            },
            where:{
                movement_id: parseInt(movementId)
            }
        })
        if(result){
            console.log('delete transfer successfuly!!')
            res.json(result)
        }else{
            console.log('delete transfer error')
        }
    }
    catch (error){
        console.error(e.message)
        res.status(500).json({error: `server error ${e.message}`})
    }
    
})

// create history 

app.post('/create/history', CheckSingInMiddle, async(req, res)=> {
    try{

    }catch(e){
         console.error(e.message)
        res.status(500).json({error: `server error ${e.message}`})
    }
})

app.put('/update/history/:movementId', CheckSingInMiddle, async(req, res)=> {
    try{

    }catch(e){
         console.error(e.message)
        res.status(500).json({error: `server error ${e.message}`})
    }
})

app.delete('/delete/history/:movementId', CheckSingInMiddle, async(req, res)=> {
    try{

    }catch(e){
         console.error(e.message)
        res.status(500).json({error: `server error ${e.message}`})
    }
})

module.exports = app 