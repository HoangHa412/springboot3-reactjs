import {Button, Form, Input, message} from "antd";
import useApi from "../service/api";
import React, {useState} from "react";
function ForgotPassword({onClose}){
    const {forgotPassword} = useApi();
    const [loading, setLoading] = useState(false);
    const onFinish = async (values) =>{
        setLoading(true);
        try{
            await forgotPassword(values);
            message.success('Password reset email sent successfully!');
            onClose();  // Close the modal after successful email sending
        }catch(e){
            console.error("Error sending password reset email: " + e);
            message.error(e.response?.data?.message ||'Failed to send password reset email!')
        }finally {
            setLoading(false)
        }
    }
    return(
        <Form
            onFinish={onFinish}
            layout="vertical">
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
            <Button type="primary" htmlType="submit" loading={loading} >
                Save
            </Button>
            <Button onClick={onClose} style={{ marginLeft: '10px' }}>
                Cancel
            </Button>
        </Form>
    )
}

export default ForgotPassword;