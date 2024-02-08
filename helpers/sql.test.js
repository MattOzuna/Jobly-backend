const { sqlForPartialUpdate } = require('./sql')


describe('Test sqlForPartialUpdate', () => {
    test('working', () => {
        const result = sqlForPartialUpdate(
            {
                handle: "new",
                name: "New",
                description: "New Description",
                numEmployees: 1,
                logoUrl: "http://new.img"
            }, {
                numEmployees: "num_employees",
                logoUrl: "logo_url",
            }
        )
        expect(result).toEqual({
            setCols: `"handle"=$1, "name"=$2, "description"=$3, "num_employees"=$4, "logo_url"=$5`,
            values: ['new', 'New', "New Description", 1, "http://new.img"]
        })
    })
})