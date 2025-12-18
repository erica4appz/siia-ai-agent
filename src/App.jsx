import React, { useState, useEffect } from 'react';
import { ProChat } from '@ant-design/pro-chat';
import { ConfigProvider, message, theme } from 'antd';
import enUS from 'antd/locale/en_US';
import axios from 'axios';
const App = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false)
  const getChatHistory = () => {
    setLoading(true)
    axios.post('https://api-dev.siia.ai/route', {
      "prompt": "",
      "user_id": "U-102",
      "user_role": "employee",
      "session_id": "session-test-1",
      "auto_execute": true
    }).then((res) => {
      const existingMessages = res.data?.parameters?.conversation_history || []
      const historyMessages = existingMessages.map((item, index) => {
        return { ...item, message: item.content, id: `${index}_${+new Date()}`, createAt: Date.now() }
      })
      console.log(historyMessages)
      setHistory(historyMessages)
    }).finally(() => {
      setLoading(false)
    })
  }
  useEffect(() => {
    getChatHistory()
  }, []);
  // if (!history.length) return <div>Loading...</div>
  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }} locale={enUS}>
      <div style={{ height: '100vh', width: '100vw', backgroundColor: '#f5f5f5' }}>
        <ProChat
          loading={loading}
          key={history.length}
          helloMessage={false}
          initialChats={history}
          locale="en-US"
          style={{
            height: '100%',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          showClearGuidance={false}
          actions={{
            clear: false, // Disables the "Clear Conversation" button
          }}
          // This function handles the AI logic
          request={async (messages) => {
            const lastMessage = messages[messages.length - 1]
            // Replace this with your actual API call (OpenAI, Gemini, etc.)
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
            console.log(data)
            // For a simple mock response:
            return new Response(data.response);
          }}
          placeholder="Type your message here..."
          greeting="Hello! I'm your AI assistant. How can I help you today?"
          assistantMeta={{
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot',
            title: 'SiiA Assitant',
          }}
          userMeta={{
            avatar: 'https://api.dicebear.com/9.x/miniavs/svg?seed=Jude',
            title: 'Me',
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default App;