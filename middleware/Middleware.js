const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

function checkSingIn (req, res, next){
    try{
        const secret = process.env.TOKEN
        const token = req.headers['autorization']
        const result = jwt.verify(token, secret)

        if (result != undefined){
            next()
        }

    }catch (e){
        console.log(e)
        res.status(500).send({ error: e.message})
    }
}


module.exports = checkSingIn