import axios from "axios"

class Test {
    static testFunction1(test) {
        setTimeout(() => {
            console.log('  \x1b[31m','✖ fail')
        },200)
    }
    static async testFunction2(id) {
      const response = await axios.post(`http://localhost:4000/events/all-my`,{userId: id})
        if (response.status === 200){
            return console.log('  \x1b[32m', '✔ success')
        }
        return console.log('\x1b[31m', 'fail')
    }
    static resetColors() {
        setTimeout(() => {
            console.log('\x1b[0m')
        },200)
    }
}

export default Test;