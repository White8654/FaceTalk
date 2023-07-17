import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { getSender } from "../config/ChatLogics";
import { getSenderfull } from "../config/ChatLogics";
import { getSenderImage } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import { Avatar } from "@chakra-ui/avatar";
import GroupChatModal from "./miscellaneous/GroupChatModal";
//import { useNavigate } from "react-router-dom";

import io from "socket.io-client";

import { ChatState } from "../Context/ChatProvider";
import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  border,
} from "@chakra-ui/react";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, HamburgerIcon, ChevronDownIcon } from "@chakra-ui/icons";

import { useNavigate } from "react-router-dom";

import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./miscellaneous/ProfileModal";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";

import UserListItem from "./userAvatar/UserListItem";
import styled from "styled-components";
const ENDPOINT = "http://localhost:5000";

var socket;

const ContactItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  color: white;
  background: ${({ selectedchat, chat }) =>
    selectedchat === chat ? "#8080ff" : "#333333"};
  cursor: pointer;
  opacity: ${({ col }) => (col == true ? "0.5" : "1")};
  border-radius: 10px;
  padding: 7px;
  
  }
`;
const ContactItems = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 95%;
  color: white;
  background: #333333;
  cursor: pointer;
  margin: 10px;
  border-radius: 10px;
  padding: 7px;
  
  }
`;

const DeleteText = styled.span`
  position: absolute;
  color: red;
  font-size: 20px;
  font-weight: bold;
  display: ${({ col }) => (col === true ? "block" : "none")};
  z-index: 10;
  left: 150px;
  align-self: center;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  color: white;
  margin: 0 12px;
`;

const ContactName = styled.span`
  width: 100%;
  font-size: 16px;
  color: white;
  font-weight: bold;
`;
const ContactEmail = styled.span`
  width: 100%;
  font-size: 16px;
  color: white;
  font-weight: bold;
`;

const MessageText = styled.span`
  width: 100%;
  font-size: 14px;
  margin-top: 3px;
  color: white;
`;

const MessageTime = styled.span`
  font-size: 12px;
  margin-right: 10px;
  color: white;
  white-space: nowrap;
`;

const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

const MyChats = ({ fetchAgain }) => {
  const { user, notification, setNotification, chats, setChats } = ChatState();

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [Delete, setDelete] = useState(false);
  const [deletechat, setDeletechat] = useState();

  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, messages, setMessages } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useNavigate();

  socket = io(ENDPOINT);

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  // useEffect(() => {
  //   // Function to handle the back button press
  //   const handleBackButton = (event) => {
  //     event.preventDefault();
  //     logoutHandler();
  //   };

  //   // Add event listener for the popstate event
  //   window.addEventListener("popstate", handleBackButton);

  //   // Clean up the event listener when the component is unmounted
  //   return () => {
  //     window.removeEventListener("popstate", handleBackButton);
  //   };
  // }, []);

  const deleteHandler = async () => {
    setDelete(true);
    if (deletechat) {
      //console.log(1111);
      if (selectedChat && deletechat._id === selectedChat._id)
        setSelectedChat(null);
      const updatedChats = chats.filter((chat) => chat._id !== deletechat._id);
      setChats(updatedChats);

      setDeletechat(null); // Reset the deletechat state after deleting
      setDelete(false);
      try {
        //setLoading(true);

        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        await axios.post(
          `/api/message/del`,
          { chatId: deletechat._id },
          config
        );
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Delete chat",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
      }
    }
  };

  useEffect(() => {
    if (Delete === true) deleteHandler();
  }, [deletechat]);

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      const index = chats.findIndex((c) => c._id === data._id);
      if (index === -1) {
        // Item not found in chats, add it to the beginning
        setChats([data, ...chats]);
      } else {
        // Item found in chats, move it to the beginning
        const updatedChats = [
          chats[index],
          ...chats.slice(0, index),
          ...chats.slice(index + 1),
        ];
        setChats(updatedChats);
      }

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  useEffect(() => {
    if (search) {
      setLoading(true);
      handleSearch();
    } else {
      setSearchResult([]);
    }
  }, [search]);

  const fetchChats = async () => {
    // console.log(user._id);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
      const selectedChatIndex = data.findIndex(
        (chat) => chat._id === selectedChat?._id
      );
      if (selectedChatIndex !== -1) {
        setSelectedChat(data[selectedChatIndex]);
      } else {
        // If the selectedChat is not present, deselect it
        setSelectedChat(null);
      }
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));

    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  const logoutHandler = () => {
    socket.emit("logout", user);
    localStorage.removeItem("userInfo");

    history("/");
  };

  const deleteRef = useRef(null); // Create a ref to the delete component

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteRef.current && !deleteRef.current.contains(event.target)) {
        setDelete(false); // Clicked outside the delete component, setDelete(false)
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // window.addEventListener("beforeunload", logoutHandle);

  // // Function to handle the logout action
  // function logoutHandle(event) {
  //   // Cancel the default behavior of the beforeunload event
  //   event.preventDefault();

  //   // Display the alert message
  //   const confirmationMessage = "Are you sure you want to log out?";
  //   socket.emit("logout", user);

  //   // Call the API if the user chooses to leave
  //   event.returnValue = confirmationMessage; // For Chrome
  //   return confirmationMessage;
  // }
  const [notificationCounts, setNotificationCounts] = useState({});

  useEffect(() => {
    if (selectedChat) {
      function func(selectedchat) {
        const updatedCounts = { ...notificationCounts };

        const chatId = selectedchat._id;
        const count = 0;
        updatedCounts[chatId] = count;

        setNotificationCounts(updatedCounts);
      }
      func(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    // Function to update the notification counts state
    function updateNotificationCounts(notifications) {
      const updatedCounts = { ...notificationCounts };
      notifications.forEach((notification) => {
        const chatId = notification.chat._id;
        const count = updatedCounts[chatId] || 0;
        updatedCounts[chatId] = count + 1;
      });
      setNotificationCounts(updatedCounts);
    }

    // Call the function when the notifications change
    updateNotificationCounts(notification);
  }, [notification]);

  // function mapChatIdToNotificationCount(notifications) {
  //   notifications.forEach((notification) => {
  //     const chatId = notification.chat._id;
  //     const count = chatIdToNotificationCount.get(chatId) || 0;
  //     chatIdToNotificationCount.set(chatId, count + 1);
  //   });

  //   return chatIdToNotificationCount;
  // }

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      w={{ base: selectedChat ? "0%" : "100%", md: "25%" }}
      borderRadius="lg"
      bg="#262626"
    >
      <Box
        pb={3}
        px={3}
        fontFamily="Roboto"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box
          display="flex"
          fontFamily="Roboto"
          alignItems="center"
          w={{ base: "0%", md: "25%" }}
          color="white"
          bg="#262626"
          mt={"2"}
        >
          <ProfileModal user={user}>
            <Avatar
              size="md"
              cursor="pointer"
              //name={user.name}
              src={`data:image/svg+xml;base64,${user.pic}`}
            />
          </ProfileModal>
        </Box>
        <Menu>
          <MenuButton>
            <HamburgerIcon color={"white"} size={"xl"} mr={5} />
          </MenuButton>
          <MenuList>
            <MenuItem fontFamily="Roboto">
              {" "}
              <GroupChatModal>Create Group</GroupChatModal>
            </MenuItem>{" "}
            <MenuDivider />
            <MenuItem fontFamily="Roboto" onClick={deleteHandler}>
              {" "}
              Delete Chat
            </MenuItem>{" "}
            <MenuDivider />
            <MenuItem
              fontFamily="Roboto"
              onClick={logoutHandler}
              color={"black"}
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
      <Box
        w="100%"
        h="10%"
        bg={"#262626"}
        p={"10px"}
        borderTop="3px solid #333333"
        borderBottom="3px solid #333333"
        display={"flex"}
        //flexDir={"column"}
        alignItems={"center"}
        //justifyContent={"center"}
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button
            variant="ghost"
            onClick={onOpen}
            fontFamily="Roboto"
            color="white"
            //marginTop={"4px"}
            bg="#333333"
            _hover={{
              color: "white",
              fontSize: "1.2rem",
              transition: "all 0.5s ease-out",
            }}
            borderRadius="50"
            w="100%"
          >
            <Text d={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent
            width={{ base: "90%", md: "40%" }}
            height="60%"
            mx="auto"
            border="1px"
          >
            <ModalHeader borderBottomWidth="1px" bg="#333333">
              <Text color="white">Search Users</Text>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody overflowY="auto" bg="#121212">
              <Box display="flex" pb={2}>
                <Input
                  placeholder="Search by name or email"
                  mr={2}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  bg="#333333"
                  color="white"
                  borderColor={"#0000cc"}
                  borderWidth="2px"
                />
              </Box>
              {loading ? (
                <Spinner color="white" />
              ) : (
                <Box maxHeight="300px" overflowY="auto">
                  {searchResult.length > 0 ? (
                    searchResult.map((user) => (
                      // <UserListItem
                      //   key={user._id}
                      //   user={user}
                      //   handleFunction={() => accessChat(user._id)}
                      // />

                      <ContactItems
                        onClick={() => accessChat(user._id)}
                        key={user._id}
                      >
                        <Box position="relative" display="inline-block">
                          <Avatar
                            mr={2}
                            size="md"
                            cursor="pointer"
                            src={
                              user
                                ? `data:image/svg+xml;base64,${user.pic}`
                                : undefined
                            }
                            name={user.name}
                            border={"2px"}
                            borderColor={"white"}
                          />
                        </Box>

                        <ContactInfo>
                          <ContactName>{user && user.name}</ContactName>
                          <ContactEmail>
                            {user && "Email: " + user.email}
                          </ContactEmail>
                        </ContactInfo>
                      </ContactItems>
                    ))
                  ) : (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height="100%"
                    >
                      {search.length !== 0 && (
                        <Text color="white">Oops...No user found :(</Text>
                      )}
                    </Box>
                  )}
                </Box>
              )}
              {loadingChat && <Spinner ml="auto" d="flex" />}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        w="100%"
        h="100%"
        fontFamily="Roboto"
        borderRadius="lg"
        overflowY="Scroll"
      >
        {chats ? (
          <Stack overflowY="scroll" maxHeight="90vh">
            {chats.map((chat) => (
              <ContactItem
                onClick={
                  Delete === false
                    ? () => setSelectedChat(chat)
                    : () => setDeletechat(chat)
                }
                selectedchat={selectedChat}
                col={Delete}
                chat={chat}
                key={chat._id}
              >
                {<DeleteText col={Delete}>Delete</DeleteText>}
                <ProfileModal
                  user={loggedUser && getSenderfull(loggedUser, chat.users)}
                >
                  <Box position="relative" display="inline-block">
                    <Avatar
                      mr={2}
                      size="md"
                      cursor="pointer"
                      src={
                        loggedUser && !chat.isGroupChat
                          ? `data:image/svg+xml;base64,${
                              getSenderfull(loggedUser, chat.users).pic
                            }`
                          : undefined
                      }
                      name={
                        loggedUser && !chat.isGroupChat
                          ? getSender(loggedUser, chat.users)
                          : chat.chatName
                      }
                      border={"2px"}
                      borderColor={"white"}
                    />
                    {chat.isGroupChat === false && (
                      <Box
                        position="absolute"
                        top="0"
                        right="0"
                        transform="translate(-70%, -50%)"
                        w="3"
                        h="3"
                        bg={
                          loggedUser &&
                          getSenderfull(loggedUser, chat.users).isOnline ===
                            true
                            ? "green.300"
                            : "gray.400"
                        }
                        borderRadius="50%"
                        border={"1px"}
                      />
                    )}
                  </Box>
                </ProfileModal>
                {/* <Avatar
                  mr={2}
                  size="md"
                  cursor="pointer"
                  name={
                    !chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName
                  }
                  border={"2px"}
                  borderColor={"white"}
                /> */}
                <ContactInfo>
                  <ContactName>
                    {loggedUser && !chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </ContactName>
                  <MessageText>
                    {loggedUser && chat.latestMessage && (
                      <>
                        {chat.latestMessage.sender.name === loggedUser.name
                          ? "You"
                          : chat.latestMessage.sender.name}{" "}
                        :{" "}
                        {chat.latestMessage.content.length > 20
                          ? chat.latestMessage.content.substring(0, 20) + "..."
                          : chat.latestMessage.content}
                      </>
                    )}
                  </MessageText>
                </ContactInfo>
                <Box display={"flex"} flexDir={"column"}>
                  {notificationCounts[chat._id] > 0 && (
                    <NotificationBadge
                      count={notificationCounts[chat._id]}
                      effect={Effect.SCALE}
                    />
                  )}

                  <MessageTime>
                    {chat.latestMessage &&
                      new Date(
                        chat.latestMessage && chat.latestMessage.createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </MessageTime>
                </Box>
              </ContactItem>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
