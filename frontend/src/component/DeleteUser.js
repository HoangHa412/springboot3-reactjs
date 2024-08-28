import useApi from "../service/api";
import {Button, Space, message} from "antd";
import { useState } from "react";

function DeleteUser({ id, onClose,fetchUsers, username }) {
    const { deleteUser } = useApi();
    const [loading, setLoading] = useState(false);

    const handleDeleteUser = async () => {
        setLoading(true);  // Disable button to prevent multiple clicks
        try {
            await deleteUser(id);
            fetchUsers();
            message.success("User deleted successfully!");
            onClose();  // Close the modal after deletion
        } catch (err) {
            console.error("Error deleting user: " + err);
            message.error("Failed to delete user. Please try again.");
        } finally {
            setLoading(false);  // Re-enable the button
        }
    };

    return (
        <>
            <p>Do you want to delete this account?</p>
            <Space>
                <Button type="primary" onClick={handleDeleteUser} loading={loading}>
                    Delete
                </Button>
                <Button onClick={onClose}>
                    Cancel
                </Button>
            </Space>
        </>
    );
}

export default DeleteUser;
