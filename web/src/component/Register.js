import React, { useState } from 'react';
import { Button, Col, Drawer, Form, Input, message, Row, Space } from 'antd';
import useApi from "../service/api";

const Register = () => {
    const [open, setOpen] = useState(false);
    const { register } = useApi();
    const [form] = Form.useForm();

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    const onFinish = async (values: any) => {
        try {
            const response = await register(values);
            message.success('User registered successfully');
            onClose();
        } catch (err) {
            console.error('Failed to register user:', err);
            message.error(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <>
            <a onClick={showDrawer} style={{ cursor: 'pointer', color: '#1890ff' }}>
                Sign up
            </a>
            <Drawer
                title="Create a new account"
                width={720}
                onClose={onClose}
                open={open}
                bodyStyle={{ paddingBottom: 80 }}
                extra={
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="primary" onClick={() => form.submit()}>
                            Submit
                        </Button>
                    </Space>
                }
            >
                <Form layout="vertical" form={form} onFinish={onFinish} hideRequiredMark>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="username"
                                label="Username"
                                rules={[{ required: true, message: 'Please enter user name' }]}
                            >
                                <Input placeholder="Please enter user name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[{ required: true, message: 'Please enter password' }]}
                            >
                                <Input placeholder="Please enter password" type="password" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="cfPassword"
                                label="Confirm Password"
                                dependencies={['password']}
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
                                <Input placeholder="Please confirm your password" type="password" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
        </>
    );
};

export default Register;
