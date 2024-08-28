import React, {useState, useEffect} from 'react';
import {
    UserAddOutlined,
    UserOutlined,
    WechatOutlined
} from '@ant-design/icons';
import {Layout, Menu, Dropdown, theme} from 'antd';
import {Link, Route, Routes, useLocation} from "react-router-dom";
import ListUser from "../component/ListUser";
import CreateUser from "../component/CreateUser";
import Chat from "./Chat";
import logo from "../assets/favicon.ico";
import ViewProfile from "../component/ViewProfile"
import WebSocketService from "../service/WebSocketService";
import useApi from "../service/api";
import Notifications from "../component/Notifications";

const {Header, Content, Sider} = Layout;

const Home = () => {
    const [collapsed, setCollapsed] = useState(true); // Sider is collapsed by default
    const [selectedKey, setSelectedKey] = useState(''); // Manage selected item
    const [notification, setNotification] = useState('');
    const location = useLocation(); // Hook to get the current path
    const token = localStorage.getItem('token');
    const {parseToken} = useApi();
    const {
        token: {colorBgContainer},
    } = theme.useToken();

    useEffect(() => {
        // Update selectedKey based on the current path
        const path = location.pathname.split('/')[1]; // Get the first segment of the path
        setSelectedKey(path || 'welcome'); // Default to 'welcome' if path is empty
    }, [location.pathname]);

    useEffect(() =>{
        const tokenPayload = parseToken(token);
        const name = tokenPayload['sub'];
        WebSocketService.connect(`http://localhost:8081/ws?authentication=${localStorage.getItem('token')}`,name);
    },[token])

    useEffect(() => {
        // Subscribe to WebSocket messages
        WebSocketService.onMessageReceived((receivedMessage) => {
            const tokenPayload = parseToken(token);
            const name = tokenPayload['sub'];
            if (receivedMessage.senderId !== name) {
                setNotification(`New message from ${receivedMessage.senderId}: ${receivedMessage.content}`);
            }
        });
    }, []);

    const handleLogoClick = () => {
        setSelectedKey(''); // Reset selected item
    };

    const handleLogout = () => {
        const tokenPayload = parseToken(token);
        const name = tokenPayload['sub'];
        WebSocketService.disconnect(name);
        localStorage.removeItem("token");
        localStorage.removeItem('refreshToken');
    }

    const profileMenuItems = [
        {
            key: 'viewProfile',
            label: <ViewProfile/>,
            onClick: () => setSelectedKey('viewProfile'),
        },
        {
            key: 'logout',
            label: <Link to={"/"} onClick={handleLogout}>Logout</Link>,
            onClick: () => setSelectedKey('logout'),
        }
    ];

    const menuItems = [
        {
            key: 'listUser',
            icon: <UserOutlined/>,
            label: <Link to="listUser">User</Link>,
            onClick: () => setSelectedKey('listUser'),
        },
        {
            key: 'createUser',
            icon: <UserAddOutlined/>,
            label: <Link to="createUser">Create User</Link>,
            onClick: () => setSelectedKey('createUser'),
        },
        // {
        //     key: 'chat',
        //     icon: <WechatOutlined/>,
        //     label: <Link to="chat">Chat</Link>,
        //     onClick: () => setSelectedKey('chat'),
        // },
    ];

    return (
        <Layout style={{height: '100vh'}}>
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Link to="welcome" style={{display: 'flex', alignItems: 'center'}} onClick={handleLogoClick}>
                    <img src={logo} alt="Logo" style={{height: '32px', marginRight: '16px'}}/>
                    <span style={{color: 'white', fontSize: '20px'}}>My App</span>
                </Link>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    style={{
                        flex: 1,
                        minWidth: 0,
                        justifyContent: 'right',
                    }}
                    selectedKeys={[selectedKey]}
                >
                    <Dropdown overlay={<Menu items={profileMenuItems}/>} trigger={['click']}>
                        <Menu.Item key="profile" icon={<UserOutlined/>}>
                            Profile
                        </Menu.Item>
                    </Dropdown>
                </Menu>
            </Header>
            <Layout>
                <Sider
                    width={300}
                    collapsed={collapsed}
                    onMouseEnter={() => setCollapsed(false)} // Expand on hover
                    onMouseLeave={() => setCollapsed(true)}  // Collapse when not hovered
                    style={{
                        background: colorBgContainer,
                        height: '100vh',
                        position: 'fixed',
                        left: '0',
                        top: '64px',
                        transition: 'width 0.3s',
                    }}
                >
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[selectedKey]} // Bind selected key
                        style={{
                            height: '100%',
                            borderRight: 0,
                            fontSize: '15px',
                        }}
                        items={menuItems}
                    />
                </Sider>
                <Layout
                    style={{
                        padding: '0 24px 24px',
                        marginLeft: collapsed ? 80 : 300, // Adjust content margin depending on collapsed state
                        transition: 'margin-left 0.3s', // Smooth transition
                    }}
                >
                    <Content>
                        <Routes>
                            <Route path="listUser" element={<ListUser/>}/>
                            <Route path="createUser" element={<CreateUser/>}/>
                            <Route path="chat" element={<Chat/>}/>
                            <Route path="viewProfile" element={<ViewProfile/>}/>
                            <Route path="welcome" element={
                                <div>
                                    <h1>Welcome to the Dashboard!</h1>
                                    <p>This is the introduction section. Here, you can find an overview of the
                                        application and its features.</p>
                                </div>
                            }/>
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
            <Notifications message={notification}  />
        </Layout>
    );
};

export default Home;
