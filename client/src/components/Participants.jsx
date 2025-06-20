import React, { useContext } from 'react'
import AppContext from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const Participants = () => {

  const { participants, isHost, roomId} = useContext(AppContext)
 
  const navigate = useNavigate();

  return (
    <div className='w-full min-h-screen bg-gray-600 p-2 relative'>

           { isHost && ( 
                 <h1 className='bg-green-600 w-[30%] px-4 py-2 rounded text-white font-semibold text-xl'>Participants { participants.length }</h1>
            )}

        {
          isHost ?
                
                participants.map((user) =>(
                      
                     <div className='flex flex-col gap-2 w-[30%] px-4 py-2 bg-gray-500'>

                        <div className='flex gap-3 items-center '>
                            <div className='flex items-center justify-center w-9 h-9 bg-purple-700 rounded-full'>
                               <p className='  text-white uppercase font-semibold '>{ user.name.split('')[0] }</p>
                            </div>
                     
                           <p className='text-white'>{user.name}</p>
                        </div>

                         <hr className='w-full h-0.5 bg-gray-200 rounded border-none'/>
                     </div>
                ))
                 : <div className='h-screen bg-gray-500 flex justify-center items-center'>
                     <h1 className=' text-white text-3xl animate-bounce duration-700'>Only host can see participants</h1>
                  </div>
        }

        <h1 className='absolute top-2 right-8 text-gray-300 text-lg border-b-1 border-gray-300' onClick={() => navigate(`/meeting/${roomId}`)}>Back</h1>
    </div>
  )
}

export default Participants
