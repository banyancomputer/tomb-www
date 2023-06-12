import { createContext, useState, useEffect, useContext } from 'react';
import { Auth } from '../config/firebase';
import { createKey } from '../lib/db/firestore';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';

// TODO: Why doesn't this work when passed as a prop?

export const SessionContext = createContext<{
  user: User | null;
  signUp: (email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}>({
  user: null,
  signUp: async (email: string, password: string) => {},
  logIn: async (email: string, password: string) => {},
  logOut: async () => {},
});

export const SessionProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);

  /* Authentication Logic */

  useEffect(() => {
    const unsubscribe = Auth.onAuthStateChanged((user) => {
      console.log('Auth state changed: ', user);
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string): Promise<void> => {
    createUserWithEmailAndPassword(Auth, email, password).then((userCredential) => {
      const uid = userCredential.user.uid;
      createKey(uid);
    })
  };

  const logIn = async (email: string, password: string): Promise<void> => {
    signInWithEmailAndPassword(Auth, email, password)
  };

  const logOut = async (): Promise<void> => {
    signOut(Auth)
  };

  return (
    // @ts-ignore
    <SessionContext.Provider value={{ user, signUp, logIn, logOut }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useAuth = () => useContext(SessionContext);
