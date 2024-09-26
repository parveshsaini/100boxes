import axios from "axios";
import  { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const History = () => {
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedState, setSelectedState] = useState<string[][] | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/grid/history?page=${page}`
    );

    if (res.data) {
      setHistory(res.data);
    // console.log('history', history[0])

    }
  };

  const handleViewClick = (state: string[][], row: number, col: number) => {
    setSelectedState(state)
    setSelectedRow(row)
    setSelectedCol(col)
    setOpenModal(true);
  };

  return (
    <div className="flex flex-col gap-6 px-6 py-8 bg-gray-800 text-white min-h-screen">
  <button
    className="self-start bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-400 transition duration-300"
    onClick={() => navigate("/")}
  >
    Home
  </button>

  {history && history.length > 0 ? (
    <div className="space-y-4">
      {history.map((item) => (
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-700 p-4 rounded-md shadow-md"
          key={item.id}
        >

          <div className="flex gap-3 items-center">
            <img
              className="w-12 h-12 rounded-full border-2 border-green-500"
              src={item.user.imageUrl}
              alt={item.user.name}
            />
            <div>
              <h1 className="text-lg font-semibold">{item.user.name}</h1>
              <p className="text-gray-400 text-sm">
                {new Date(item.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center mt-4 md:mt-0">
            <span>Updated block</span>
            <h1 className="text-green-500">( {item.row}, {item.col} )</h1>
            <span>with character</span>
            <p className="bg-green-600 text-white px-3 py-1 rounded-md">
              {item.character}
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <button
              onClick={() => handleViewClick(item.state, item.row, item.col)}
              className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-md transition duration-300"
            >
              View Grid State
            </button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <h1 className="text-center text-xl font-semibold">No history found</h1>
  )}

  <div className="flex justify-between items-center mt-6">
    <button
      className={`px-6 py-2 rounded-md ${
        page > 1 ? "bg-green-500 hover:bg-green-400" : "bg-gray-500 cursor-not-allowed hover:cursor-not-allowed"
      } transition duration-300`}
      onClick={() => setPage(page > 0 ? page - 1 : 0)}
      disabled={page === 0}
    >
      Prev {page}
    </button>
    <button
      className={` hover:bg-green-400 px-6 py-2 rounded-md transition duration-300 ${history.length === 0 || history.length< 10 ? "bg-gray-500 cursor-not-allowed hover:cursor-not-allowed" : "bg-green-500"}`}
      onClick={() => setPage(page + 1)}
      disabled= {history.length === 0 || history.length< 10}
    >
      Next
    </button>
  </div>

  {openModal && selectedState && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-h-[90vh] w-full md:w-[50vw] overflow-y-auto">
        <h1 className="text-xl font-semibold text-center mb-4">Grid State</h1>
        <div className="grid grid-cols-10 gap-1">
          {selectedState.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`border p-1 text-center ${
                  selectedRow === rowIndex && selectedCol === colIndex
                    ? "bg-green-500 border-3 font-semibold"
                    : "border-gray-500"
                }`}
              >
                {cell}
              </div>
            ))
          )}
        </div>
        <button
          onClick={() => setOpenModal(false)}
          className="mt-4 bg-red-500 hover:bg-red-400 px-4 py-2 rounded-md transition duration-300 block mx-auto"
        >
          Close
        </button>
      </div>
    </div>
  )}
</div>

  );
};

export default History;
