
import { useState } from 'react'
import { useAuth } from '../providers/auth.provider'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {

    const {user, logout} = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const navigate = useNavigate()
        
    return (
      <nav className="bg-gray-800 p-4 shadow-lg rounded-full md:flex md:justify-between md:items-center">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-green-400 md:text-3xl text-base  tracking-wide flex items-center gap-1">
          100_B
          <span className="bg-green-500 text-white rounded-md py-1 flex items-center justify-center">
            ☑️
          </span>
          XES
        </h1>

        
    
        <button
          className="text-white md:hidden block"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>

      {user ? (
          <h1 className="text-white tracking-wider md:text-xl text-base mt-8 font-semibold text-center">
            Welcome, {user.name}
          </h1>
        ) : (
          <h1 className="text-white text-center">
            <span
              className="underline cursor-pointer text-green-400 hover:text-green-500 transition duration-300"
              onClick={() => navigate("/login")}
            >
              Login
            </span>{" "}
            /{" "}
            <span
              className="underline cursor-pointer text-green-400 hover:text-green-500 transition duration-300"
              onClick={() => navigate("/signup")}
            >
              Signup
            </span>{" "}
            to start playing 🎮
          </h1>
        )}
    
      <div
        className={`md:flex md:items-center md:space-x-6 space-y-4 md:space-y-0 mt-4 md:mt-0 ${
          menuOpen ? "block" : "hidden"
        }`}
      >
        
    
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
          <button
            onClick={() => navigate("/history")}
            className="bg-transparent font-semibold tracking-wider border-2 border-green-400 text-green-400 px-4 py-1 rounded-lg hover:bg-green-400 hover:text-white transition duration-300 w-full md:w-auto"
          >
            History
          </button>
          {user ? (
            <button
              onClick={() => logout()}
              className="bg-transparent font-semibold tracking-wider border-2 border-green-400 text-green-400 px-4 py-1 rounded-lg hover:bg-green-400 hover:text-white transition duration-300 w-full md:w-auto"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/signup")}
              className="bg-green-500 font-semibold tracking-wider text-white px-4 py-1 rounded-lg hover:bg-green-400 transition duration-300 w-full md:w-auto"
            >
              Signup
            </button>
          )}
        </div>
      </div>
    </nav>
    

    )
}

export default Navbar
