import { useEffect, useState } from "react";
import "../App.css";
import axios from "axios";
import { useAuth } from "../providers/auth.provider";
import { useSocketContext } from "../providers/socket.provider";
import toast from "react-hot-toast";
import Navbar from "./Navbar";

const Home = () => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [disabledCells, setDisabledCells] = useState<boolean[][]>(
    Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => false))
  );

  const { user } = useAuth();
  const { socket, onlineUsers } = useSocketContext();

  useEffect(() => {
    const getGrid = async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/grid`);
      setGrid(res.data);
    };

    getGrid();
  }, []);

  console.log('env', import.meta.env.VITE_API_URL)

  useEffect(() => {
    socket?.on(
      "updateGrid",
      ({
        message,
      }: {
        message: { row: number; col: number; value: string };
      }) => {
        const updatedGrid = [...grid];
        updatedGrid[message.row][message.col] = message.value;
        setGrid(updatedGrid);
        // console.log("updatedGrid", updatedGrid);
        // toast.success("Update successful 🎉");
        handleDisable(message.row, message.col);
      }
    );

    socket?.on("rateLimittedBlock", (message: any) => {
      const parsedMessage = JSON.parse(message);

      toast.error(parsedMessage.err);
      undoDisable(parsedMessage.message.row, parsedMessage.message.col);
    });

    return () => {
      socket?.off("updateGrid");
      socket?.off("rateLimittedBlock");
    };
  }, [socket]);

  const handleClickCell = (row: number, col: number) => {
    setSelectedCell({ row, col });
    setTempValue(grid[row][col] );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempValue(e.target.value.slice(0, 1));
  };

  const handleSubmit = async () => {
    if (!selectedCell) return;

    if (!user) {
      // alert("user not logged in")
      toast.error("Login to get started!");
      return;
    }

    if (!socket) {
      console.log("socket not connected");
      return;
    }


    socket.emit("updateGrid", {
      row: selectedCell.row,
      col: selectedCell.col,
      value: tempValue,
      user: user,
    });
    // console.log("emmiting updateGrid", updatedGrid);

    setSelectedCell(null);
    handleDisable(selectedCell.row, selectedCell.col);
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
  };

  const undoDisable = (row: number, col: number) => {
    const updatedDisabledCells = [...disabledCells];
    updatedDisabledCells[row][col] = false;
    setDisabledCells(updatedDisabledCells);
  };

  const handleCancel = () => {
    setSelectedCell(null);
  };


  return (
    <div className="flex flex-col gap-4 space-y-4 bg-gray-900 min-h-screen text-white md:p-8 pt-2">
  <Navbar />

  {selectedCell ? (
    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 items-center justify-center">
      <h1 className="text-lg font-semibold tracking-wider text-center">
        Edit block at{" "}
        <span className="font-semibold text-green-400">
          {selectedCell.row}, {selectedCell.col}
        </span>{" "}
        ?
      </h1>
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-green-500 font-semibold tracking-wider rounded-lg hover:bg-green-400 transition duration-300 w-full md:w-auto"
      >
        Confirm
      </button>
      <button
        onClick={handleCancel}
        className="px-4 py-2 bg-gray-600 font-semibold tracking-wider rounded-lg hover:bg-gray-500 transition duration-300 w-full md:w-auto"
      >
        Cancel
      </button>
    </div>
  ) : (
    <h1 className="py-2 text-lg text-center">Select a block to edit</h1>
  )}

  <div className="grid grid-cols-10 md:gap-6 gap-2 px-2 md:px-4">
    <div className="col-span-10 md:col-span-8 grid grid-cols-10 gap-1 md:gap-2">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={
              `border-2 border-green-400 p-2 md:p-4 text-center rounded-lg cursor-pointer hover:bg-green-500 hover:text-white font-semibold transition duration-300 ` +
              (disabledCells[rowIndex][colIndex]
                ? "bg-gray-600 cursor-not-allowed hover:cursor-not-allowed hover:bg-gray-600"
                : "")
            }
            onClick={() => handleClickCell(rowIndex, colIndex)}
          >
            {selectedCell &&
            selectedCell.row === rowIndex &&
            selectedCell.col === colIndex ? (
              <input
                className="w-full text-center bg-gray-800 border-0 text-white"
                type="text"
                value={tempValue}
                onChange={handleInputChange}
                disabled={disabledCells[rowIndex][colIndex]}
                autoFocus
              />
            ) : cell === "" ? (
              ""
            ) : (
              cell
            )}
          </div>
        ))
      )}
    </div>

    <div className="flex flex-col gap-4 col-span-10 md:col-span-2 bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-center text-green-400 font-bold text-xl mb-4">
        <span className="px-2 py-1 rounded-lg bg-green-400 text-black mr-2">
          {onlineUsers.length}
        </span>
        Users Online
      </h2>
      {onlineUsers.length > 0 ? (
        onlineUsers.map((user) => (
          <div
            key={user.id}
            className="flex gap-4 items-center justify-start  border-2 border-green-400 p-3 rounded-lg"
          >
            <img
              className="w-12 h-12 rounded-full"
              src={user.imageUrl}
              alt={user.name}
            />
            <h1 className="text-lg font-semibold">{user.name}</h1>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-400">No users online</p>
      )}
    </div>
  </div>
</div>

  );
};

export default Home;
