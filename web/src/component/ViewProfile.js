import React, { useEffect, useState } from 'react';
import { Col, Drawer, Form, Input, Button, message, Space } from 'antd';
import useApi from "../service/api";
import { useForm } from "antd/es/form/Form";

const ViewProfile = () => {
    const [open, setOpen] = useState(false);
    const [isEditable, setIsEditable] = useState(false);
    const [form] = Form.useForm();
    const { getUserById, updateUser, parseToken } = useApi();
    const [loading, setLoading] = useState(false);
    let id = null;

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        setIsEditable(false); // Reset edit mode when drawer is closed
    };

    useEffect(() => {
        if (open) {
            fetchUserProfile(); // Fetch user profile when the drawer is opened
        }
    }, [open]);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const tokenPayload = parseToken(token);
                id = tokenPayload['userId'];
            }
            const response = await getUserById(id);
            const user = response.data['content'];
            form.setFieldsValue({
                id: user.id,
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt,
                createdBy: user.createdBy,
                updatedAt: user.updatedAt,
                updatedBy: user.updatedBy,
            });
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await updateUser(values);
            message.success("User updated successfully!");
            onClose();  // Close the modal after successful update
        } catch (err) {
            console.error("Error editing user: " + err);
            message.error("Failed to update user!");
        } finally {
            setLoading(false);
        }
    };


    const handleEditClick = () => {
        setIsEditable(true);
    };

    return (
        <>
            <a onClick={showDrawer} style={{ cursor: 'pointer', color: 'black' }}>
                View Profile
            </a>
            <Drawer
                title="My Profile"
                onClose={onClose}
                open={open}
                width={720}
                bodyStyle={{ paddingBottom: 80 }}
                extra={
                    <Space>
                        <Button type="primary" onClick={handleEditClick}>
                            Edit
                        </Button>
                        <Button type="primary" htmlType="submit" onClick={() => form.submit()} loading={loading}>
                            Save
                        </Button>
                    </Space>
                }
            >
                <Form layout="vertical" hideRequiredMark form={form} onFinish={onFinish}>
                    <Form.Item hidden name="id"></Form.Item>
                    <Col span={12}>
                        <Form.Item
                            name="username"
                            label={<span style={{ color: '#001529' }}>Username</span>}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter the username',
                                },
                            ]}
                        >
                            <Input disabled={!isEditable} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="fullname"
                            label="Fullname"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter the fullname',
                                },
                            ]}
                        >
                            <Input disabled={!isEditable} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                {
                                    required: true,
                                    type: 'email',
                                    message: 'Please enter a valid email',
                                },
                            ]}
                        >
                            <Input disabled={!isEditable} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="phone"
                            label="Phone"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter the phone number',
                                },
                            ]}
                        >
                            <Input disabled={!isEditable} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="createdAt"
                            label="Created At"
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="createdBy"
                            label="Created By"
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="updatedAt"
                            label="Updated At"
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="updatedBy"
                            label="Updated By"
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                </Form>
            </Drawer>
        </>
    );
};

export default ViewProfile;
