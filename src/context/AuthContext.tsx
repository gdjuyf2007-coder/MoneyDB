import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'ผู้ใช้งาน',
              photoURL: currentUser.photoURL || '',
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.warn('Could not sync user document to Firestore:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatAuthError = (err: unknown): string => {
    if (err instanceof Error) {
      const msg = err.message;
      if (msg.includes('auth/unauthorized-domain')) {
        const currentDomain = window.location.hostname;
        return `โดเมน "${currentDomain}" ยังไม่ได้รับอนุญาตใน Firebase Console โปรดเพิ่ม "${currentDomain}" ที่ Firebase Console > Authentication > Settings > Authorized domains`;
      }
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
        return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      }
      if (msg.includes('auth/email-already-in-use')) {
        return 'อีเมลนี้ถูกลงทะเบียนไว้แล้ว โปรดเลือกเข้าสู่ระบบ';
      }
      if (msg.includes('auth/weak-password')) {
        return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
      }
      if (msg.includes('auth/invalid-email')) {
        return 'รูปแบบอีเมลไม่ถูกต้อง';
      }
      if (msg.includes('auth/operation-not-allowed')) {
        return 'ระบบอีเมลยังไม่ได้เปิดใช้งานใน Firebase Authentication (Sign-in method > Email/Password)';
      }
      return msg;
    }
    return 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์';
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      console.error('Google Sign In Error:', err);
      setAuthError(formatAuthError(err));
      throw err;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: unknown) {
      console.error('Email Sign In Error:', err);
      setAuthError(formatAuthError(err));
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    setAuthError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName && displayName.trim() && res.user) {
        await updateProfile(res.user, { displayName: displayName.trim() });
        const userRef = doc(db, 'users', res.user.uid);
        await setDoc(userRef, {
          id: res.user.uid,
          email: res.user.email || '',
          displayName: displayName.trim(),
          photoURL: res.user.photoURL || '',
          createdAt: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (err: unknown) {
      console.error('Email Sign Up Error:', err);
      setAuthError(formatAuthError(err));
      throw err;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (err: unknown) {
      console.error('Sign Out Error:', err);
      throw err;
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
