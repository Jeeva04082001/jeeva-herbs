import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  /*
   * Get the currently logged-in user's details.
   * This function is ONLY called after successful login.
   */

  async function loadUser() {
    try {
      const response = await api.get("/api/auth/me/");
      const currentUser = response.data.user;

      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error(
        "Failed to load user:",
        error.response?.status,
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        setUser(null);
      }

      return null;
    }
  }



  useEffect(() => {
    async function initializeAuth() {
      try {
        await loadUser();
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    }

    initializeAuth();
  }, []);


  async function login(email, password) {
    setLoading(true);

    try {
      /*
       * Step 1:
       * Login API sets the HttpOnly cookies.
       */
      await api.post("/api/auth/login/", {
        username: email,
        password: password,
      });

      /*
       * Step 2:
       * Now that we are logged in,
       * get the user information.
       */
      const currentUser = await loadUser();

      if (!currentUser) {
        throw new Error("Unable to load logged-in user");
      }

      toast.success("Login successful!");

      return currentUser;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function register({
    name,
    email,
    phone,
    password,
    confirmPassword,
  }) {
    try {
      const response = await api.post("/api/auth/register/", {
        name,
        email,
        phone,
        password,
        confirm_password: confirmPassword,
      });

      toast.success("Account created successfully!");

      return response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  async function logout() {
    try {
      await api.post("/api/auth/logout/");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);

      toast.success("Logged out successfully!");
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authChecked,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}