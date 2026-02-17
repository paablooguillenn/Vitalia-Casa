"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User, UserRole } from "./types"
// import { users } from "./mock-data"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Recuperar usuario de localStorage si existe
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
    const id = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    const name = typeof window !== "undefined" ? localStorage.getItem("userName") : null;
    const email = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
    if (token && role && id && name && email) {
      return { id, name, email, role } as User;
    }
    return null;
  });
  const router = useRouter()

  const redirectByRole = useCallback(
    (role: UserRole) => {
      switch (role) {
        case "patient":
          router.push("/patient")
          break
        case "doctor":
          router.push("/doctor")
          break
        case "admin":
          router.push("/admin")
          break
      }
    },
    [router]
  )

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const res = await fetch("http://192.168.68.58:8080/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        // data: { jwt, rol, id }
        localStorage.setItem("token", data.jwt);
        localStorage.setItem("role", data.rol);
        localStorage.setItem("userId", data.id ? String(data.id) : "");
        localStorage.setItem("userName", data.nombre || "");
        localStorage.setItem("userEmail", email);
        const userObj = {
          id: data.id ? String(data.id) : "",
          name: data.nombre || "",
          email: email,
          role: data.rol,
        };
        setUser(userObj);
        redirectByRole(data.rol);
        return true;
      } catch (err) {
        return false;
      }
    },
    [redirectByRole]
  )



  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
