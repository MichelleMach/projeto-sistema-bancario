import express from 'express'
import cors from 'cors'
import { usersList, user, transactions } from './data'

const app = express()
app.use(express.json())
app.use(cors())

app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003");
});

// PEGAR TODOS OS USUÁRIOS

app.get('/user', (req, res) => {
    try {
        if (usersList.length == 0) {
            throw new Error("Não usuários cadastrados na sua lista")
        }
        res.status(200).send(usersList)
    } catch (error: any) {
        res.status(res.statusCode || 500).send({ message: error.message })
    }
})

// CRIAR UM NOVO USUÁRIO

app.post('/user', (req, res) => {

    const { name, cpf, dateOfBirth } = req.body
    const [day, month, year] = dateOfBirth.split("/")  // [01 , 01, 2020]

    const birthDateFormatted = new Date(`${year}-${month}-${day}`)
    const birthDateinMilliseconds = birthDateFormatted.getTime()
    const today = new Date().getTime()

    const age = Math.floor((today - birthDateinMilliseconds) / (1000 * 60 * 60 * 24 * 365))

    try {

        if (age > 18) {
            const cpfIndex = usersList.findIndex(client => client.cpf === cpf)
            const nameIndex = usersList.findIndex(client => client.name === name)

            if (cpfIndex >= 0) {
                res.statusCode = 400
                throw new Error("Já existe um usuário com o mesmo cpf")

            } else if (nameIndex >= 0) {
                res.statusCode = 400
                throw new Error("Já existe um usuário com o mesmo nome")

            } else {
                usersList.push({ name, cpf, dateOfBirth, balance: 0, extract: [] })
                res.status(201).send(usersList)
            }

        } else {
            res.statusCode = 400
            console.log(age)
            throw new Error("Apenas maiores de 18 anos podem se cadastrar")
        }

    } catch (error: any) {
        res.status(res.statusCode || 500).send({ message: error.message })
    }
})

// PEGAR SALDO

app.get('/balance', (req, res) => {
    const name = req.query.name
    const cpf = req.query.cpf

    try {

        const findCPF = usersList.findIndex(user => user.cpf == cpf)
        const findUser = usersList.find(user => user.name == name)


        if (!name || !cpf) {
            res.statusCode = 404
            throw new Error("Por favor, digite nos campos obrigatórios")

        } else if (!findCPF) {
            res.statusCode = 404
            throw new Error("Usuário não encontrado")
        }

        res.status(200).send({balance: findUser?.balance})

    } catch (error: any) {
        res.status(res.statusCode || 500).send({ message: error.message })
    }
})

// ADICIONAR SALDO

app.put('/user', (req, res) => {
    const name = req.query.name
    const cpf = req.query.cpf
    const newBalance = req.body.balance

    try {
        const changeUser = usersList.filter((user) => {
            if (user.name == name && user.cpf == cpf) {
                console.log(user.name)
                user.balance = newBalance
                return user
            }
        })
        res.send(changeUser)

    } catch (error: any) {
        res.status(res.statusCode || 500).send({ message: error.message })
    }
})

// PAGAR CONTA

app.put('/user/:cpf', (req, res) => {
    const searchCpf = req.params.cpf

    const { value, date, description } = req.body
    const [day, month, year] = date.split("/")  // [01 , 01, 2020]

    const birthDateFormatted = new Date(`${year}-${month}-${day}`)
    const birthDateinMilliseconds = birthDateFormatted.getTime()
    const today = new Date().getTime()


    try {
        const payBills = usersList.filter((user) => {
            if (searchCpf === user.cpf) {

                if (!date) {
                    req.body.date = today
                    user.balance = user.balance - value
                    user.extract.push({ value, date, description })
                    return "Pagamento realizado com sucesso, na data de hoje"
                }

                else if (date < today) {
                    throw new Error("Você não pode agendar um pagamento em uma data que já passou ")
                }

                else if (value > user.balance) {
                    throw new Error("O seu saldo é menor do que o valor a ser pago")
                }

                user.balance = user.balance - value
                user.extract.push({ value, date, description })
                return user
            }
        })
        res.send(payBills)
    } catch (error: any) {
        res.status(res.statusCode || 500).send({ message: error.message })
    }
})

// TRANSFERENCIA ENTRE CLIENTES

app.post("/transfer", (req, res) => {
    try {

        const { cpf, name } = req.query
        const { nameDestination, cpfDestination, value, description } = req.body
        let { date } = req.body

        const [day, month, year] = date.split('/')
        const dateFormatted = new Date(`${year}-${month}-${day}`)


        if (!cpf || !name || !nameDestination || !cpfDestination) {
            res.statusCode = 400
            throw new Error("Não foi possível realizar a transferência, passou algum dado não preenchido")
        }

        const clientIndex = usersList.findIndex(client => client.cpf === cpf && client.name.toLowerCase() === client.name.toLowerCase())
        const client = usersList[clientIndex]

        const clientDestinationIndex = usersList.findIndex(client => client.cpf === cpfDestination)

        if (clientDestinationIndex < 0) {
            res.statusCode = 404
            throw new Error("Não foi possível realizar a transferência, não existe um cliente cadastrado com esse CPF")
        }

        const clientDestination = usersList[clientDestinationIndex]

        const newTransaction: transactions = {
            value: - value,
            date: new Date(),
            description: `Transferência de ${client.name} para ${nameDestination}`
        }

        const newTransaction2: transactions = {
            value: value,
            date: new Date(),
            description: `Transferência de ${client.name} para ${nameDestination}`
        }

        client.extract.push(newTransaction)
        client.balance = client.balance - value

        clientDestination.extract.push(newTransaction2)
        clientDestination.balance = clientDestination.balance + value

        res.status(200).send("Transferência realizada com sucesso")

    } catch (error: any) {
        if (res.statusCode == 200) {
            res.status(500).send(error.message)
        } else {
            res.status(res.statusCode).send(error.message)
        }
    }
})


