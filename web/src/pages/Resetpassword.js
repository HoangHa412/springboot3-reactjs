import React from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import { Button, Form, Input, message } from 'antd';
import useApi from "../service/api";

const ResetPassword = () => {
    const { token } = useParams();
    const { resetPassword } = useApi();
    const {navigate} = useNavigate();
    const handleResetPassword = async (values) => {
        try {
            const resetPasswordRequest = {
                token: token,
                password: values.password,
            };
            await resetPassword(resetPasswordRequest);
            navigate("/");
            message.success('Password reset successfully');
        } catch (err) {
            console.error(err);
            message.error(err.response?.data?.message || 'Reset password failed. Please try again.');
        }
    };

    return (
        <div className="login">
            <div className="login-container">
                <Form
                    name="Reset Password"
                    initialValues={{ remember: true }}
                    style={{ maxWidth: 360, margin: 'auto' }}
                    onFinish={handleResetPassword}
                >
                    <h2 style={{ textAlign: "center" }}>Reset Password</h2>
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
                    <Form.Item>
                        <Button block type="primary" htmlType="submit">
                            Save
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default ResetPassword;
