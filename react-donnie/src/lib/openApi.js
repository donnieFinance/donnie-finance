import axios from 'axios'
const getIostContract = (page = 1, pageSize = 1) => new Promise(async (resolve) => {

    const initialData = {
        actions: [],
        total: 0
    }

    try{
        const {status, data} = await axios.get(`https://www.iostabc.com/api/contract/ContractL3GFG4Wo5XmpUpoJ8LctTA3VFbwTi9x9AEWDKNzg1VR/actions?page=${page}&size=${pageSize}`)
        if (status === 200) {
            resolve(data)
        }else{
            resolve(initialData)
        }
    }catch (err) {
        console.error(err)
        resolve(initialData)
    }
})
export default {
    getIostContract
}