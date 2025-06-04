// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface AppUser {
    id: string;
    displayName: string;
    username: string;
    email: string;
    password: string;
    isDisabled: boolean;
    phoneNumber: string;
    address: string;
    avatar: string;
    role: number;
}

interface JwtPayload {
    Email: string;
    DisplayName: string;
    UserId: string;
    UserName: string;
    UserRole: string;
    nbf: number;
    exp: number;
    iat: number;
}

interface AuthContextProps {
    isAuthenticated: boolean;
    user: AppUser | null;
    login: (token: string, appUser: AppUser) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");
        
        if (token && storedUser) {
            try {
                const decoded = jwtDecode<JwtPayload>(token);
                if (decoded.exp * 1000 > Date.now()) {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                }
            } catch (error) {
                console.error("Error decoding token:", error);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
            }
        }
    }, []);

    const login = (token: string, appUser: AppUser) => {
        try {
            localStorage.setItem("accessToken", token);
            localStorage.setItem("user", JSON.stringify(appUser));
            setUser(appUser);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Error during login:", error);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
        }
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            <div >
                {children}
            </div>
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
