import { useOJTStore } from '../store/useOJTStore.js';

/**
 * Authentication Service
 * Serves as the central point for authenticating all stakeholders
 * (Students, Partners, Coordinators, Admins) from the database to have access to their dashboard.
 */
export const authService = {
  /**
   * Authenticate a user with email and password
   */
  login: async (email, password) => {
    // In a real application, this would make an API request to a backend database.
    // Here we delegate to our store which acts as our mock database.
    return useOJTStore.getState().login(email, password);
  },

  /**
   * Register a new stakeholder (Student, Industry Partner, etc.)
   */
  register: async (userData) => {
    return useOJTStore.getState().signup(userData);
  },

  /**
   * Logout current user
   */
  logout: () => {
    useOJTStore.getState().logout();
  }
};
