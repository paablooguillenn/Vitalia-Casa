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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
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
        const res = await fetch("http://172.20.10.4:8080/api/auth/login", {
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
    setUser(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
