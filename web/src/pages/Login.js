import React, {useEffect, useState} from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal } from 'antd';
import useApi from "../service/api";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import Register from "../component/Register";
import ForgotPassword from "../component/ForgotPassword";
import WebSocketService from "../service/WebSocketService";

const HandleLogin: React.FC = () => {
    const navigate = useNavigate();
    const { login, parseToken } = useApi();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEditUser = () => {
        setIsEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
    };

    useEffect(()=>{
        const token = localStorage.getItem("token");
        if(token){
            navigate('/home/welcome');
        }else {
            WebSocketService.disconnect();
            navigate('/');
        }
    },[]);

    const handleLogin = async (values: any) => {
        try {
            const response = await login(values['username'], values['password']);
            if (response) {
                const data = response.data;
                localStorage.setItem("token", data["accessToken"]);
                localStorage.setItem("refreshToken", data["refreshToken"]);

                navigate('/home/welcome');
            }
        } catch (e) {
            console.error("Error message: " + e.message);
            message.error(e.response?.data?.message || "Invalid Username or Password");
        }
    };

    return (
        <div className="login">
            <div className="login-container">
                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    style={{ maxWidth: 360 }}
                    onFinish={handleLogin}
                >
                    <h2 style={{ textAlign: "center" }}>LOGIN</h2>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your Username!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
                    </Form.Item>
                    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                        <a onClick={handleEditUser}>Forgot password</a>
                    </div>
                    <Form.Item>
                        <Button block type="primary" htmlType="submit">
                            Log in
                        </Button>
                        <div className="register">
                            or <Register />
                        </div>
                        <div>
                            <p style={{ textAlign: 'center' }}>Sign in with:</p>
                            <div className="google-btn">
                                <a href="http://localhost:8081/oauth2/authorization/google">
                                    <img
                                        src="https://developers.google.com/identity/images/g-logo.png"
                                        alt="Google"
                                        width="20"
                                    />
                                </a>
                            </div>
                        </div>
                    </Form.Item>
                </Form>
            </div>
            <Modal
                title="Are you forgot your password?"
                open={isEditModalOpen}
                onCancel={handleEditModalClose}
                footer={null}
                maskClosable={false}
                centered
            >
                <ForgotPassword onClose={handleEditModalClose} />
            </Modal>
        </div>
    );
};

export default HandleLogin;
