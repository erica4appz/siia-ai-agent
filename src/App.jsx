import React, { useState, useEffect } from 'react';
import { ProChat } from '@ant-design/pro-chat';
import { ConfigProvider, theme, FloatButton, Popover } from 'antd';
import { MessageOutlined, CloseOutlined } from '@ant-design/icons';
import enUS from 'antd/locale/en_US';
import axios from 'axios';
import './App.css'

const App = () => {
  const queryParams = new URLSearchParams(window.location.search)
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const urlColor = queryParams.get('color') || '#1677ff';

  const getChatHistory = () => {
    setLoading(true);
    axios.post('https://api-dev.siia.ai/route', {
      "prompt": "",
      "user_id": "U-102",
      "user_role": "employee",
      "session_id": "session-test-1",
      "auto_execute": true
    }).then((res) => {
      const existingMessages = res.data?.parameters?.conversation_history || [];
      const historyMessages = existingMessages.map((item, index) => ({
        ...item,
        message: item.content,
        id: `${index}_${+new Date()}`,
        createAt: Date.now()
      }));
      setHistory(historyMessages);
    }).finally(() => {
      setLoading(false);
    });
  };

  // Fetch history only when the popover is opened
  useEffect(() => {
    if (open && history.length == 0) {
      getChatHistory();
    }
  }, [open]);

  // The chat content inside the popover
  const chatContent = (
    <div style={{ width: 400, height: 500, display: 'flex', flexDirection: 'column' }}>
      <ProChat
        loading={loading}
        key={history.length}
        helloMessage={false}
        initialChats={history}
        locale="en-US"
        style={{ height: '100%' }}
        showClearGuidance={false}
        actions={{ clear: false }}
        request={async (messages) => {
          const lastMessage = messages[messages.length - 1];
          const response = await fetch('https://api-dev.siia.ai/route', {
            method: 'POST',
            body: JSON.stringify({
              "prompt": lastMessage.message,
              "user_id": "U-102",
              "user_role": "employee",
              "session_id": "session-test-1",
              "auto_execute": true
            })
          });
          const data = await response.json();
          return new Response(data.response);
        }}
        assistantMeta={{
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot',
          title: 'SiiA Assistant',
        }}
        userMeta={{
          avatar: 'https://api.dicebear.com/9.x/miniavs/svg?seed=Jude',
          title: 'Me',
        }}
      />
    </div>
  );

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm, token: { colorPrimary: urlColor, controlOutline: "transparent" } }} locale={enUS}>
      <Popover
          content={chatContent}
        title={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px', // Standard Ant Design padding
              borderBottom: '1px solid #f0f0f0' // Optional: adds separation
            }}
          >
            <span style={{ fontWeight: 600 }}>SiiA AI Assistant</span>
            
          </div>
        }
          trigger="click"
          open={open}
          onOpenChange={(newOpen) => setOpen(newOpen)}
          placement="topLeft" // Positions the popover above and to the left of the button
          overlayInnerStyle={{ padding: 0 }} // Remove default padding for a seamless look
        >
          <FloatButton
            icon={open ? <CloseOutlined /> : <MessageOutlined />}
            type="primary"
            style={{ right: 24, bottom: 24, width: 60, height: 60 }}
          />
      </Popover>
    </ConfigProvider>
  );
};

export default App;