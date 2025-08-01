import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme/theme';

// Import components
import Layout from './components/Layout/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import FoodSearch from './pages/FoodSearch.jsx';
import FoodLog from './pages/FoodLog.jsx';
import MyFoods from './pages/MyFoods.jsx';
import Recipes from './pages/Recipes.jsx';
import Weight from './pages/Weight.jsx';
import BloodPressure from './pages/BloodPressure.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Goals from './pages/Goals.jsx';
import BarcodeTest from './pages/BarcodeTest.jsx';

// Import contexts
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SettingsProvider } from './contexts/SettingsContext.jsx';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SettingsProvider>
          <Router>
            <Box sx={{
              minHeight: '100vh',
              backgroundColor: '#f8f9fa'
            }}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="food-search" element={<FoodSearch />} />
                  <Route path="food-log" element={<FoodLog />} />
                  <Route path="my-foods" element={<MyFoods />} />
                  <Route path="recipes" element={<Recipes />} />
                  <Route path="weight" element={<Weight />} />
                  <Route path="blood-pressure" element={<BloodPressure />} />
                  <Route path="goals" element={<Goals />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="barcode-test" element={<BarcodeTest />} />
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Box>
          </Router>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;