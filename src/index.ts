import express from 'express'
import cors from 'cors'
import { usersList, user, transactions } from './data'

const app = express()
app.use(express.json())
app.use(cors())

app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003");
});

app.post('/user', (req, res) => {

    const newUser: user = {
        name: req.body.name,
        cpf: req.body.cpf,
        birth: req.body.birth,
        balance: req.body.saldo,
        extract: req.body.extract
    }

    try {

        if (newUser.birth >= new Date(1,1,2004)) {
            usersList.filter((user) => {
                if (user.cpf !== newUser.cpf) {
                    usersList.push(newUser)
                    res.send(usersList)
                } else {
                    res.statusCode = 400
                    throw new Error("Já existe um usuário com o mesmo cpf")
                }
            })
        } else {
            res.statusCode = 400
            throw new Error("Apenas maiores de 18 anos podem se cadastrar")
        }

    } catch (error: any) {
        res.status(res.statusCode || 500).send({ message: error.message })
    }
})

app.get('/user', (req, res) => {
    const name = req.query.name
    const cpf = req.query.cpf

    try {

        const findUser = usersList.filter((user) => {

            if (user.name == name && user.cpf == cpf) {
                res.status(200).send(`${user.name}, seu saldo é ${user.balance}`)
            }

            else if (!name || !cpf) {
                res.statusCode = 404
                throw new Error("Por favor, digite nos campos obrigatorios")
            }
        })

        if (findUser.length == 0) {
            res.statusCode = 404
            throw new Error("Usuário não encontrado")
        }

    } catch (error: any) {
        res.status(res.statusCode || 500).send({ message: error.message })
    }
})

app.put('/user', (req, res) => {
    const name = req.query.name
    const cpf = req.query.cpf
    const newBalance = req.body.balance

    try {
        const changeUser = usersList.filter((user) => {
            if (user.name === name && user.cpf === cpf) {
                user.balance = newBalance
                return user
            } else {
                res.statusCode = 404
                throw new Error("Ocorreu um erro, verifique se os campos foram escritos corretamente")
            }
        })

        res.send(changeUser)

    } catch (error: any) {
        res.status(res.statusCode || 500).send({ message: error.message })
    }
})

app.post('/user/:cpf', (req, res) => {
    const searchCpf = req.params.cpf
    const today = new Date() 

    const newPayment: transactions = {
        value: req.body.value,
        date: req.body.date,
        description: req.body.description
    }

    try{
        const payBills = usersList.filter((user) => {
            if(searchCpf === user.cpf){
                if(!newPayment.date){
                    req.body.date = today
                    return user
                }

                else if (newPayment.date < today) {
                    throw new Error("Você não pode agendar um pagamento em uma data que já passou ")
                }

                else if (newPayment.value > user.balance) {
                    throw new Error("O seu saldo é menor do que o valor a ser pago")
                }

            } else {
                res.statusCode = 404
                throw new Error("Usuario não foi encontrado")
            }
        })
        res.send(payBills)
    } catch (error:any){
        res.status(res.statusCode || 500).send({ message: error.message })
    }


})