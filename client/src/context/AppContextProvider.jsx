import { useState } from "react"
import AppContext from "./AppContext"

const AppContextProvider = ({ children }) => {

    const [name, setName] = useState('');
    const [stream, setStream] = useState(null);
    const [roomId, setRoomId] = useState('');
    const [participants, setParticipants] = useState([])
    const [remoteStreams ,setRemoteStreams] = useState([])
    const [isHost, setIsHost] = useState(false);

    const value = { name, setName, stream, setStream, roomId, setRoomId, setParticipants, participants, remoteStreams, setRemoteStreams, isHost, setIsHost }
     
    return (
        <AppContext.Provider value={ value }>
             { children }
        </AppContext.Provider>
    )
}

export default AppContextProvider