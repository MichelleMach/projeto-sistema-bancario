export type user = {
    name: string,
    cpf: string,
    dateOfBirth: Date | string ,
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
        dateOfBirth: new Date("1997-12-03"),
        balance: 2500,
        extract: []
    },

    {
        name: "Victor",
        cpf: "547638764",
        dateOfBirth: new Date("2003-5-20"),
        balance: 3000,
        extract: []
    },

    {
        name: "Rafael",
        cpf: "756392874",
        dateOfBirth: new Date("2002-10-25"),
        balance: 1500,
        extract: []
    }
]
