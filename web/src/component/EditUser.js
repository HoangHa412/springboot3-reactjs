import React, { useEffect, useState } from 'react';
import { Button, Card, Input, Form, Select, message } from 'antd';
import useApi from "../service/api";
import { useForm } from "antd/es/form/Form";
const { Option } = Select;

const EditUser = ({ id, onClose, fetchUsers, username }) => {
    const [form] = useForm();
    const { getUserById, updateUser } = useApi();
    const [loading, setLoading] = useState(false);
    const [currentRoles, setCurrentRoles] = useState([]);

    useEffect(() => {
        if (id) {
            fetchUserDetails();
        }
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            const response = await getUserById(id);
            const user = response.data['content'];
            setCurrentRoles(user.roles); // Store the current roles
            form.setFieldsValue({
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                roles: user.roles  // Set the roles for the form
            });
        } catch (err) {
            console.error("Error fetching user: " + err);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Merge existing roles with form values
            const updatedRoles = values.roles.length > 0 ? values.roles : currentRoles;
            const updatedUser = { ...values, roles: updatedRoles };

            await updateUser(updatedUser);
            message.success("User updated successfully!");
            fetchUsers();  // Fetch updated users list after successful update
            onClose();  // Close the modal after successful update
        } catch (err) {
            console.error("Error editing user: " + err);
            message.error(err.response?.data?.message || "Failed to update user!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            title={`User account  ${username}`}
            bordered={false}
            style={{
                maxWidth: 600,
                margin: 'auto',
                borderRadius: '10px',
                padding: '20px'
            }}
        >
            <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
            >
                <Form.Item name="id" hidden>
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Full Name"
                    name="fullname"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the full name!',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[
                        {
                            required: true,
                            type: 'email',
                            message: 'Please input a valid email!',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Phone"
                    name="phone"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the phone number!',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item name="roles" label="Roles" rules={[{ required: true, message: 'Please select at least one role' }]}>
                    <Select mode="multiple" placeholder="Select roles" allowClear>
                        <Option value="ROLE_ADMIN">Admin</Option>
                        <Option value="ROLE_USER">User</Option>
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Save
                    </Button>
                    <Button onClick={onClose} style={{ marginLeft: '10px' }}>
                        Cancel
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
}

export default EditUser;
