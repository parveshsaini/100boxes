import { useEffect, useState } from 'react';
import '../App.css';
import axios from 'axios';
import { useAuth } from '../providers/auth.provider';

const  Home= ()=> {
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const { user, logout } = useAuth();

  useEffect(() => {
    const getGrid = async () => {
      const res = await axios.get('http://localhost:3000/api/v1/grid');
      setGrid(res.data);
    };

    getGrid();
  }, []);

  const handleClickCell = (row: number, col: number) => {
    console.log(`clicked at ${row}, ${col}`);
    setSelectedCell({ row, col });
    setTempValue(grid[row][col] ? grid[row][col] : '?');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempValue(e.target.value.slice(0, 1)); 
  };

  const handleSubmit = async () => {
    console.log("submit called", selectedCell); // Log the current editCell
    if (!selectedCell) return; // If editCell is null, return early

    const updatedGrid = [...grid];
    updatedGrid[selectedCell.row][selectedCell.col] = tempValue;
    setGrid(updatedGrid);
    setSelectedCell(null);
    await axios.patch(`http://localhost:3000/api/v1/grid/upsert`, {"x": selectedCell.row, "y": selectedCell.col, "val": tempValue});

  };

  const handleCancel = () => {
    setSelectedCell(null);
  };

  const handleLogout = async () => {
     logout();

  }

  return (
    <div className="flex flex-col gap-4 space-y-8">
      <h1>Welcome to 100boxes {user?.name}</h1>
      <h1>{selectedCell?.row}, {selectedCell?.col}</h1>

      {user && <button onClick={handleLogout}>Logout</button>}

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
              className="border border-gray-400 p-4 text-center cursor-pointer"
              onClick={() => handleClickCell(rowIndex, colIndex)}
            >
              {selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex ? (
                <input
                  className="w-full text-center"
                  type="text"
                  value={tempValue}
                  onChange={handleInputChange}
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
