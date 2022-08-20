export type user = {
    name: string,
    cpf: string,
    birth: Date ,
    balance: number,
    extract: transactions[]
}

export type transactions = {
    value: number,
    date: Date,
    description: string
}
 


export const usersList: user[] = [

    {
        name: "Michelle",
        cpf: "123456789",
        birth: new Date(1997, 12, 3),
        balance: 0,
        extract: []
    },

    {
        name: "Victor",
        cpf: "547638764",
        birth: new Date(2003, 5, 20),
        balance: 0,
        extract: []
    },

    {
        name: "Rafael",
        cpf: "756392874",
        birth: new Date(2002, 10, 25),
        balance: 0,
        extract: []
    }
]
