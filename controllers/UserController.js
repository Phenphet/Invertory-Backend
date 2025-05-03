const express = require('express')
const bcrypt = require('bcrypt')
const app = express.Router()
const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
const prisma = new PrismaClient()
const dotenv = require('dotenv')
dotenv.config()

const CheckSingInMiddle = require('../middleware/Middleware')



app.get('/', async(req, res) => {
    try{

        const result = await prisma.user.findMany()

        if(result.length > 0){
            res.json(result)
        }else{
            res.status(404).json({'message': 'No users found .'})
        }
    }
    catch (error){
        console.error(error)
        res.status(500).json({
            error: `server error`
        })
    }
})


app.post('/create', async(req, res) => {
    try{
        const data = req.body
        
        const emailCheck = await prisma.user.findFirst({
            where: {
                email: data.email,
            }
        })

        const hasPassword = await bcrypt.hash(data.password, 10)

        if(emailCheck){
            res.status(404).json({error : 'Email already exists'})
        }else{
            const result = await prisma.user.create({
                data: {
                    fullname: data.fullname,
                    email: data.email,
                    password: hasPassword,
                    role: data.role
                }
            })
            if(result){
                res.json({message: "creat success fully!!!!"})
            }else {
                res.status(404).json({
                    error : "error check a query db"
                })
            }
        }
    }
    catch (error){
        console.error(error)
        res.status(500).json({error: `server error`})
    }
})


app.post('/login', async(req, res) => {
    try{
        const email = req.body.email
        const password = req.body.password

        const query = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        if(query){
            const cheackHas = await bcrypt.compare(password, query.password)
            if(cheackHas){
                const secret = process.env.TOKEN
                const payload = {
                    fullname: query.fullname,
                    email: query.email,
                    role: query.role,
                }
                const tokegen = jwt.sign(payload, secret, {expiresIn: '1d'})
                res.json({
                    message: 'login success',
                    token: tokegen
                })
            }else{
                res.status(401).json({
                    error: 'error check password'
                })
            }
        }else{
            res.status(404).json({
                error: 'error check email'
            })
        }
    }
    catch (error){
        res.status(500).json({error: `server error`})
    }
})

app.get('/verifytoken', CheckSingInMiddle,  async(req, res) => {
    try{
        res.json({message: 'hello'})
    }   
    catch (error){
        res.status(500).send({error: error})
    }
})

module.exports = app