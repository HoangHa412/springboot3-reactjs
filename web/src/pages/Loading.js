import {useState, useEffect} from "react";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom"
import loader from "../assets/loader.gif"
import WebSocketService from "../service/WebSocketService";
import useApi from "../service/api";

function Loading(){
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const {parseToken} = useApi();

    useEffect(() =>{
        const token = searchParams.get('token')

        if(!token){
            navigate('/')
        }else {
            localStorage.setItem('token', token);
            // const tokenPayload = parseToken(token);
            // const name = tokenPayload['sub'];
            // WebSocketService.connect(`http://localhost:8081/ws?authentication=${token}`,name );
            navigate('/home/welcome');
        }
    }, [searchParams, navigate]);

    return (
        <div className="loading-container"
             style={{display: 'flex', justifyContent:'center', alignItems: 'center', height: '100vh'}}>
            <div className="loader">
                <img src={loader} alt="loading..." style={{width: '100px', height: '100px'}}/>
            </div>
        </div>
    )
}

export default Loading;