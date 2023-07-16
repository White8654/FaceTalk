import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
  IconButton,
  Spinner,
  Avatar,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";
import styled from "styled-components";

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

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
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
      console.log(data);
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
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      console.log(data._id);
      // setSelectedChat("");
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }
    setGroupChatName("");
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
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
      const { data } = await axios.put(
        `/api/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
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
      const { data } = await axios.put(
        `/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };

  return (
    <>
      <Avatar
        size="md"
        cursor="pointer"
        name={selectedChat.chatName}
        onClick={onOpen}
      />

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Roboto"
            display="flex"
            justifyContent="center"
            bg={"black"}
            color={"white"}
          >
            {selectedChat.chatName}
          </ModalHeader>

          <ModalCloseButton color="white" />
          <ModalBody
            overflowY="auto"
            display="flex"
            flexDir="column"
            alignItems="center"
            bg="#262626"
            w={"100%"}
          >
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  admin={selectedChat.groupAdmin}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
            <FormControl display="flex" alignItems={"center"}>
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                color={"white"}
                bg="#333333"
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                mb={3}
                isLoading={renameloading}
                onClick={handleRename}
                alignSelf={"center"}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add User to group"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
                color={"white"}
                bg="#333333"
              />
            </FormControl>

            {loading ? (
              <Spinner color="white" alignSelf={"center"} />
            ) : (
              <Box maxHeight="300px" w={"100%"} overflowY="auto">
                {searchResult ? (
                  searchResult.map((user) => (
                    // <UserListItem
                    //   key={user._id}
                    //   user={user}
                    //   handleFunction={() => accessChat(user._id)}
                    // />

                    <ContactItems
                      // onClick={() => accessChat(user._id)}
                      key={user._id}
                      onClick={() => handleAddUser(user)}
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
                    {searchResult.length !== 0 && (
                      <Text color="white">Oops...No user found :(</Text>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter
            bg="#262626"
            display={"flex"}
            flexDir={"column"}
            alignItems={"center"}
          >
            <Button onClick={() => handleRemove(user)} colorScheme="red">
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
