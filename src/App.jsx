import React, { useState, useEffect } from 'react';
import { ProChat } from '@ant-design/pro-chat';
import { ConfigProvider, theme, Card } from 'antd';
import enUS from 'antd/locale/en_US';
import axios from 'axios';
import './App.css';

const App = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    getChatHistory();
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: { colorPrimary: urlColor, controlOutline: "transparent" }
      }}
      locale={enUS}
    >
      {/* The outer container is forced to 100vw/100vh with no overflow.
        This ensures the iframe content is perfectly edge-to-edge.
      */}
      <div style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Card
          title="SiiA AI Assistant"
          variant="outlined"
          // Remove card border radius and border to blend into the iframe
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
            border: 'none'
          }}
          // body: { flex: 1 } allows the chat area to grow to fill the card
          styles={{
            header: { flex: '0 0 auto' },
            body: {
              padding: 0,
              flex: '1 1 auto',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }
          }}
        >
          <ProChat
            loading={loading}
            key={history.length}
            helloMessage={false}
            initialChats={history}
            locale="en-US"
            style={{ height: '100%', width: '100%' }}
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
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default App;