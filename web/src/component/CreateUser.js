import React from 'react';
import { Button, Form, Input, message, Select, Space } from 'antd';
import useApi from "../service/api";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

function CreateUser() {
    const [form] = Form.useForm();
    const { createUser } = useApi();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const { confirmPassword, ...rest } = values;
            await createUser(rest);
            navigate("/home/listUser");
            message.success('User created successfully!');
        } catch (e) {
            console.error("Error creating user: " + e);
            message.error(e.response?.data?.message || 'User creation failed!');
        }
    };

    const onReset = () => {
        form.resetFields();
    };

    const onFill = () => {
        form.setFieldsValue({
            username: "son",
            fullname: "Son Ha",
            password: "123",
            confirmPassword: "123",  // Added confirmPassword field
            email: "sonha@gmail.com",
            phone: "0123456789",
            roles: ['ROLE_USER'],
        });
    };

    return (
        <div className="form-container">
            <Form
                {...layout}
                form={form}
                name="create-user"
                onFinish={onFinish}
                style={{
                    maxWidth: 600,
                    margin: 'auto',
                    padding: '20px',
                    backgroundColor: '#f0f2f5',
                    borderRadius: '8px',
                }}
            >
                <h1 style={{ textAlign: 'center' }}>Add New User</h1>
                <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: 'Please enter the username' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="fullname"
                    label="Fullname"
                    rules={[{ required: true, message: 'Please enter the fullname' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: 'Please enter the password' }]}
                    hasFeedback
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Please confirm your password' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('The two passwords do not match!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="phone"
                    label="Phone"
                    rules={[{ required: true, message: 'Please enter the phone number' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="roles"
                    label="Roles"
                    rules={[{ required: true, message: 'Please select at least one role' }]}
                >
                    <Select mode="multiple" placeholder="Select roles" allowClear>
                        <Option value="ROLE_ADMIN">Admin</Option>
                        <Option value="ROLE_USER">User</Option>
                    </Select>
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                        <Button htmlType="button" onClick={onReset}>
                            Reset
                        </Button>
                        <Button type="link" htmlType="button" onClick={onFill}>
                            Fill form
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
}

export default CreateUser;
