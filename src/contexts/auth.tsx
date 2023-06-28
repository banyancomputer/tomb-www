import { createContext, useState, useEffect, useContext } from 'react';
import { Auth } from '../config/firebase';
import {
	signOut,
	User as FirebaseUser,
	GoogleAuthProvider,
	signInWithPopup,
} from 'firebase/auth';

export const AuthContext = createContext<{
	user: FirebaseUser | null;
	logIn: () => Promise<void>;
	logOut: () => Promise<void>;
}>({
	user: null,
	logIn: async () => {},
	logOut: async () => {},
});

export const AuthProvider = ({ children }: any) => {
	const [user, setUser] = useState<FirebaseUser | null>(null);
	const [error, setError] = useState<string>('');

	/* Effects */

	// Update the user state when the auth state changes
	useEffect(() => {
		const unsubscribe = Auth.onAuthStateChanged(async (firebaseUser) => {
			setUser(firebaseUser);
		});
		return unsubscribe;
	}, []);

	// Set an error alert when an error occurs
	useEffect(() => {
		if (error) {
			console.error(error);
		}
	}, [error]);

	/* Methods */

	const logIn = async (): Promise<void> => {
		signInWithPopup(Auth, new GoogleAuthProvider()).catch((err) => {
			setError(err.message);
		});
	};

	const logOut = async (): Promise<void> => {
		signOut(Auth).catch((err) => {
			setError(err.message);
		});
	};

	return (
		<AuthContext.Provider value={{ user, logIn, logOut }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
