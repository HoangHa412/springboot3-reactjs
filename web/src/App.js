import Login from "./pages/Login";
import Loading from "./pages/Loading";
import Resetpassword from "./pages/Resetpassword";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";

function App() {
    return (
        <div>
            <Router>
                <Routes>
                    <Route exact path="/" element={<Login/>}/>
                    <Route path="/home/*" element={<Home/>}/>
                    <Route path="/loading" element={<Loading/>}/>
                    <Route path="/reset-password/:token" element={<Resetpassword/>}/>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
