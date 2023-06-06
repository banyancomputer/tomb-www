import { createContext, useState, useEffect, useContext } from 'react';
import User, { FirebaseUser } from '@/lib/entities/user'
import { auth, firestore } from '@/lib/firebase';
import { Client as WorkerClient } from '@/lib/worker/client'

// TODO: Why doesn't this work when passed as a prop?

export const AuthContext = createContext<{
  user: User | null;
  userLoading: boolean;
  workerClient: WorkerClient | null;
  signUp: (email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}>({
  user: null,
  userLoading: true,
  workerClient: null,
  signUp: async (email: string, password: string) => {},
  logIn: async (email: string, password: string) => {},
  logOut: async () => {},
});

export const AuthProvider = ({ children }: any) => {
  const [userLoading, setUserLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [workerClient, setWorkerClient] = useState<WorkerClient | null>(null);

  useEffect(() => {
    return auth.onAuthStateChanged(async ({user, id}: User) => {
      if (!user) {
        setUser(null);
        setUserLoading(false)
        return
      }
      let data = await firestore.getUser(id)
      setUser({
        user, id, data
      } as User);
      setUserLoading(false);
      // Initialize worker client
      let accessKeyId = data.key_id;
      let accessKey = await firestore.getKey(accessKeyId);
      let workerClient = new WorkerClient(
        process.env.NEXT_PUBLIC_WORKER_API ?? "http://localhost:8787", accessKey
      );
      setWorkerClient(workerClient);
    });
  }, []);

  const signUp = async (email: string, password: string): Promise<void> => {
    let { user } = await auth.signUp(email, password)
    let id = user.uid;
    let data = await firestore.createUser(id)
    setUser({
      user, id, data
    } as User);
  };

  const logIn = async (email: string, password: string): Promise<void> => {
    let { user } = await auth.signIn(email, password)
    let id = user.uid;
    let data = await firestore.getUser(id)
    setUser({
      user, id, data
    } as User);
  };

  const logOut = async (): Promise<void> => {
    await auth.signOut();
    return;
  };

  return (
    <AuthContext.Provider value={{ user, userLoading, workerClient, signUp, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
