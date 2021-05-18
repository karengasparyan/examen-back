import axios from "axios"

class Test {
    static async testFunction(test) {
      const response = await axios.post(`http://localhost:4000/events/all-my`,{
          userId: '60928c88d6a1150458337e74',
          headers: {
              authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDkyOGM4OGQ2YTExNTA0NTgzMzdlNzQiLCJpYXQiOjE2MjAyODMwOTR9.0TXpTQpNooqyAc0Q-nYzNCnRAmpUDfnB0SPDBvz0z1M',
          }
      })
        if (response.status === 200){
            return console.log('  \x1b[32m', '✔ success')
        }
        return console.log('\x1b[31m', 'fail')
    }
    static testFunction1(test) {
        setTimeout(() => {
            console.log('  \x1b[31m','✖ fail')
        },200)
    }
    static resetColors() {
        setTimeout(() => {
            console.log('\x1b[0m')
        },200)
    }
}

export default Test;