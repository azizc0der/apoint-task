import {Navigate, Route, Routes} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ReportsPage from "./pages/ReportsPage";

const PrivateRoute = ({children}) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace/>
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/reports" element={
                <PrivateRoute>
                    <ReportsPage/>
                </PrivateRoute>}
            />
            <Route path="*" element={
                <PrivateRoute>
                    <Navigate to="/reports" replace/>
                </PrivateRoute>
            }/>
        </Routes>
    );
}

