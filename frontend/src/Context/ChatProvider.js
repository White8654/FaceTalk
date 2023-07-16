import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [lm, setLm] = useState(false);
  const [latestMessages, setLatestMessages] = useState({});
  const [details, setDetails] = useState(null);
  const [input, setinput] = useState();
  const [newMessage, setNewMessage] = useState("");
  const [emoji, setEmoji] = useState(false);
  const [vdetails, setVdetails] = useState(null);

  const history = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) history("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        details,
        setDetails,
        latestMessages,
        setLatestMessages,
        input,
        setinput,
        newMessage,
        setNewMessage,
        emoji,
        setEmoji,
        vdetails,
        setVdetails,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
