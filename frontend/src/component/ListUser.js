import {useEffect, useState} from 'react';
import {Modal, Space, Table} from 'antd';
import useApi from "../service/api";
import EditUser from "./EditUser";
import DeleteUser from "./DeleteUser";
import ChatWindow from "./ChatWindow";

function ListUser() {
    const {Column, ColumnGroup} = Table;
    const {getAllUsers, parseToken} = useApi();
    const [users, setUsers] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await getAllUsers();
            const tokenPayload = parseToken(localStorage.getItem('token'));
            const userId = tokenPayload['userId'];
            const filterUser = response.data['content'].filter(user => user.id !== userId)
            setUsers(filterUser);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const handleEditUser = (id, username) => {
        setSelectedUserId(id);
        setSelectedUser(username);
        setIsEditModalOpen(true);
    };

    const handleDeleteUser = (id, username) => {
        setSelectedUserId(id);
        setSelectedUser(username);
        setIsDeleteModalOpen(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setSelectedUserId(null);
    };

    const handleDeleteModalClose = () => {
        setIsDeleteModalOpen(false);
        setSelectedUserId(null);
    };

    const handleChatUser = (username) => {
        setSelectedUser(username);
        setIsChatWindowOpen(true);
    };

    const handleChatWindowClose = () => {
        setIsChatWindowOpen(false);
        setSelectedUser(null);
    };

    return (
        <>
            <Table dataSource={users} bordered={true} rowKey="id">
                <ColumnGroup title="Name">
                    <Column title="UserName" dataIndex="username" key="username"
                            render={(text, record) => <a onClick={() => {
                                handleChatUser(record.username)
                            }} style={{color:'black'}}>{text}</a>}
                    />
                    <Column title="FullName" dataIndex="fullname" key="fullname"/>
                </ColumnGroup>
                <Column title="Email" dataIndex="email" key="email"/>
                <Column title="Phone" dataIndex="phone" key="phone"/>
                <Column title="Roles" dataIndex="roles" key="roles"/>
                <Column title="Create At" dataIndex="createdAt" key="createdAt"/>
                <Column title="Create By" dataIndex="createdBy" key="createdBy"/>
                <Column title="Update At" dataIndex="updatedAt" key="updatedAt"/>
                <Column title="Update By" dataIndex="updatedBy" key="updatedBy"/>
                <Column title="Status" dataIndex="status" key="status"/>
                <Column
                    title="Action"
                    key="action"
                    render={(_, record) => (
                        <Space size="middle">
                            <a onClick={() => handleEditUser(record.id, record.username)}>Edit</a>
                            <a onClick={() => handleDeleteUser(record.id)}>Delete</a>
                        </Space>
                    )}
                />
            </Table>

            <Modal
                title={`Delete account user: ${selectedUser}`}
                open={isDeleteModalOpen}
                onCancel={handleDeleteModalClose}
                footer={null}
                maskClosable={false}
                centered
            >
                <DeleteUser id={selectedUserId} onClose={handleDeleteModalClose} fetchUsers={fetchUsers}/>
            </Modal>

            <Modal
                title="Edit User"
                open={isEditModalOpen}
                onCancel={handleEditModalClose}
                footer={null}
                maskClosable={false}
                centered
            >
                <EditUser id={selectedUserId} username={selectedUser} onClose={handleEditModalClose}
                          fetchUsers={fetchUsers}/>
            </Modal>
            <ChatWindow
                isOpen={isChatWindowOpen}
                onClose={handleChatWindowClose}
                username={selectedUser}
            />
        </>
    );
}

export default ListUser;
