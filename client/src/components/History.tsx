import axios from 'axios'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const History = () => {

    const [page, setPage] = useState(1)
    const [history, setHistory] = useState<any[]>([])

    const navigate = useNavigate()

    useEffect(()=> {
        fetchHistory()
        toast.success("History fetched")
    }, [page])

    const fetchHistory = async()=> {
        const res= await axios.get(`http://localhost:3000/api/v1/grid/history?page=${page}`)

        if(res.data){
            setHistory(res.data)
        }
    }

    return (
        <div className='flex flex-col gap-4'>

<button className='border-2 border-blue-500 p-2 rounded-lg' onClick={()=>navigate('/')}>Home</button>


            {history && history.length && history.map((item)=> {
                return <div className='flex gap-4 items-center' key={item.id}>
                    <div className='flex gap-2 items-center'>
                        <img className='w-10 h-10' src={item.user.imageUrl} alt={item.user.name} />
                        <h1>{item.user.name}</h1>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <h1>{item.row}, {item.col}</h1>
                        <p>{item.character}</p>
                        <p>{new Date(item.updatedAt).toLocaleString()}</p>
                    </div>
                    
                     </div>
            })}

            {!history.length && <h1>No history found</h1>}

            <button onClick={()=>setPage(page>0 ? page-1 : 0)}>Prev {page}</button>
            <button onClick={()=>setPage(page+1)}>Next</button>
            
        </div>
    )
}

export default History
