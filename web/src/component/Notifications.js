import React, { useMemo, useEffect } from 'react';
import {Button, notification} from 'antd';
import { useNavigate } from 'react-router-dom';
// Tạo Context
const Context = React.createContext({
    name: 'Default',
});

const Notifications = ({ message }) => {
    const [api, contextHolder] = notification.useNotification();

    // Hiển thị thông báo khi `message` thay đổi
    useEffect(() => {
        if (message) {
            api.info({
                message: 'Notification',
                description: (
                    <Context.Consumer>
                        {() => `${message}`}
                    </Context.Consumer>
                ),
                placement: 'topRight',
            });
        }
    }, [api, message]);

    const contextValue = useMemo(
        () => ({
            name: 'Ant Design',
        }),
        [],
    );

    return (
        <Context.Provider value={contextValue}>
            {contextHolder}
        </Context.Provider>
    );
};

export default Notifications;
