import { createContext, useState, useEffect, useContext, ReactNode, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { IUser, useAuth } from "./auth.provider";

interface ISocketContext {
	socket: Socket | null;
	onlineUsers: IUser[];
}

const SocketContext = createContext<ISocketContext | undefined>(undefined);

const socketURL = import.meta.env.VITE_API_URL;

export const SocketProvider = ({ children }: { children: ReactNode }) => {
	const socketRef = useRef<Socket | null>(null);

	const [onlineUsers, setOnlineUsers] = useState<IUser[]>([]);
	const { user, loading } = useAuth();

	useEffect(() => {
		if (user && !loading) {
			const socket = io(socketURL, {
				query: {
					user: JSON.stringify(user),
				},
			});
			socketRef.current = socket;

			socket.on("getOnlineUsers", (users) => {
				//@ts-ignore
				const parsedUsers = users.map(user => JSON.parse(user)); 
				setOnlineUsers(parsedUsers);
			});

			return () => {
				socket.close();
				socketRef.current = null;
			};
		} else if (!user && !loading) {
			if (socketRef.current) {
				socketRef.current.close();
				socketRef.current = null;
			}
		}
	}, [user, loading]);

	return (
		<SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>{children}</SocketContext.Provider>
	);
};

export const useSocketContext = (): ISocketContext => {
	const context = useContext(SocketContext);
	if (context === undefined) {
		throw new Error("useSocketContext must be used within a SocketContextProvider");
	}
	return context;
};