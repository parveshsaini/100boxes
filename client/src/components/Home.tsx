import { useEffect, useState } from 'react';
import '../App.css';
import axios from 'axios';
import { useAuth } from '../providers/auth.provider';
import { useSocketContext } from '../providers/socket.provider';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const  Home= ()=> {
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [disabledCells, setDisabledCells] = useState<boolean[][]>(
    Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => false))
  );

  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocketContext()

  const navigate = useNavigate();


  console.log("onlineUsers: ", onlineUsers);

  // console.log("onlineUsers email: ", onlineUsers[0].email);

  useEffect(() => {
    const getGrid = async () => {
      const res = await axios.get('http://localhost:3000/api/v1/grid');
      setGrid(res.data);
    };

    getGrid();
  }, []);


  useEffect(()=>{
    socket?.on("updateGrid", ({message}: {message: { row: number; col: number; value: string }}) => {
        console.log("event recieved for updateGrid", message);

        const updatedGrid = [...grid];
        updatedGrid[message.row][message.col] = message.value;
        setGrid(updatedGrid);
        handleDisable(message.row, message.col);
      });

    socket?.on("rateLimittedBlock", (message: any) => {

        const parsedMessage = JSON.parse(message);

        console.log("parsedMessage", parsedMessage);
        console.log("parsedMessage.message", parsedMessage.message);
        console.log("parsedMessage.message.row", parsedMessage.message.row);
        console.log("parsedMessage.err", parsedMessage.err);

        toast.error(parsedMessage.err);
        undoDisable(parsedMessage.message.row, parsedMessage.message.col);
      });
  
    return () => {
        socket?.off("updateGrid");
        socket?.off("rateLimittedBlock");
    };
  }, [socket])

  const handleClickCell = (row: number, col: number) => {
    console.log(`clicked at ${row}, ${col}`);
    setSelectedCell({ row, col });
    setTempValue(grid[row][col] ? grid[row][col] : '?');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempValue(e.target.value.slice(0, 1)); 
  };

  const handleSubmit = async () => {
    if (!selectedCell) return; 

    if(!user) {
      alert("user not logged in")
      return
    }

    if(!socket) {
        console.log("socket not connected")
        return
    }

    // const updatedGrid = [...grid];
    // updatedGrid[selectedCell.row][selectedCell.col] = tempValue;

    socket.emit("updateGrid", {
        row: selectedCell.row,
        col: selectedCell.col,
        value: tempValue,
        user: user
    });
    // console.log("emmiting updateGrid", updatedGrid);

    // setGrid(updatedGrid);
    setSelectedCell(null);
    handleDisable(selectedCell.row, selectedCell.col);
    // await axios.patch(`http://localhost:3000/api/v1/grid/upsert`, {"x": selectedCell.row, "y": selectedCell.col, "val": tempValue});
  };

  const handleDisable = (row: number, col: number) => {
    const updatedDisabledCells = [...disabledCells];
    updatedDisabledCells[row][col] = true;
    setDisabledCells(updatedDisabledCells);

    setTimeout(() => {
      const updatedDisabledCells = [...disabledCells];
      updatedDisabledCells[row][col] = false;
      setDisabledCells(updatedDisabledCells);
    }, 20000);
  }

  const undoDisable = (row: number, col: number) => {
    const updatedDisabledCells = [...disabledCells];
    updatedDisabledCells[row][col] = false;
    setDisabledCells(updatedDisabledCells);
  }

  const handleCancel = () => {
    setSelectedCell(null);
  };

  const handleLogout = async () => {
     logout();

  }

  return (
    <div className="flex flex-col gap-4 space-y-8">
      <h1>Welcome to 100boxes {user?.name}</h1>
      
      <div className='flex gap-2'>
      {onlineUsers.map((user)=> {
        return <div key={user.id} className='flex gap-1 items-center justify-center border-2 p-3'>
          <img className='w-10 h-10' src={user.imageUrl} alt={user.name} />
          <h1>{user.name}</h1>
          </div>
      })}
      </div>
      <div className='flex gap-4 items-center'>
      {user && <button className='border-2 border-blue-500 p-2 rounded-lg' onClick={handleLogout}>Logout</button>}
      <button className='border-2 border-blue-500 p-2 rounded-lg' onClick={()=>navigate('/history')}>HIstory</button>

      </div>

      {selectedCell && (
        <div className="flex space-x-4">
          <button 
            onClick={handleSubmit} 
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Submit
          </button>
          <button 
            onClick={handleCancel} 
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="grid grid-cols-10 gap-1">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`border border-gray-400 p-4 text-center cursor-pointer` + (disabledCells[rowIndex][colIndex] ? ' bg-gray-400 cursor-not-allowed hover:cursor-not-allowed' : '')}
              onClick={() => handleClickCell(rowIndex, colIndex)}
              
            >
              {selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex ? (
                <input
                  className={`w-full text-center`}
                  type="text"
                  value={tempValue}
                  onChange={handleInputChange}
                  disabled={disabledCells[rowIndex][colIndex]}
                  autoFocus
                />
              ) : (
                cell === '' ? '?' : cell
              )}
            </div>
          ))
        )}
      </div>

     
    </div>
  );
}

export default Home;
