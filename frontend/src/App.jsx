import {Navigate, Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import { userStore } from "./stores/userStore";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import ProblemsPage from "./pages/ProblemsPage";
import ProblemPage from "./pages/ProblemPage";
import ContestsPage from "./pages/ContestsPage";
import BattlesPage from "./pages/BattlesPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminPage from "./pages/AdminPage";

function App() {
  const {user, checkAuth} = userStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return (
    <div>
      <Navbar/>
      <Routes>
         <Route path = '/' element = {<HomePage/>}/>
         <Route path = '/signup' element = {user ? <Navigate to = '/'/> : <SignUpPage/>}/>
         <Route path = '/login' element = {user ? <Navigate to = '/'/>: <LoginPage/>}/>
         <Route path = '/problems' element = {<ProblemsPage/>}/>
         <Route path = '/problems/:id' element = {<ProblemPage/>}/>
         <Route path = '/contests' element = {<ContestsPage/>}/>
         <Route path = '/battles' element = {<BattlesPage/>}/>
         <Route path = '/leaderboard' element = {<LeaderboardPage/>}/>  
         <Route path = '/dashboard' element = {user?.role == "admin"? <AdminPage/>  :  <Navigate to = '/login'/>}/>

      </Routes>
      <Toaster/>
    </div>
  )
}

export default App
