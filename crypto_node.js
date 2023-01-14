const express = require('express')
const crypto = require('crypto')
const app = express()

app.get('/generateKey', (req, res) => {
    const key = crypto.randomBytes(32).toString('hex')
    res.json({
        key
    })
})

app.post('/encrypt', (req, res) => {
    const plaintext = req.body.plaintext
    const password = req.body.password
    const algorithm = 'aes-256-cbc'

    const key = crypto.scryptSync(password, 'salt', 32)
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, key, iv)

    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    res.json({
        iv: iv.toString('hex'),
        encrypted
    })
})

app.post('/decrypt', (req, res) => {
    const encrypted = req.body.encrypted
    const password = req.body.password
    const algorithm = 'aes-256-cbc'

    const key = crypto.scryptSync(password, 'salt', 32)
    const iv = Buffer.from(req.body.iv, 'hex')
    const decipher = crypto.createDecipheriv(algorithm, key, iv)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    res.json({
        decrypted
    })
})

app.post('/sign', (req, res) => {
    const data = req.body.data
    const privateKey = req.body.privateKey
    const sign = crypto.createSign('SHA256')
    sign.update(data)
    const signature = sign.sign(privateKey, 'hex')
    res.json({
        signature
    })
})

app.post('/verify', (req, res) => {
    const data = req.body.data
    const signature = req.body.signature
    const publicKey = req.body.publicKey
    const verify = crypto.createVerify('SHA256')
    verify.update(data)

    const isValid = verify.verify(publicKey, signature, 'hex')
    res.json({
        isValid
    })
})


app.listen(3000, () => {
    console.log('Server started on port 3000')
})