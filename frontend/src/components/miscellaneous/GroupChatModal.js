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
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";
import ChatLoading from "../ChatLoading";
import styled from "styled-components";
import { Spinner } from "@chakra-ui/spinner";
import { Avatar } from "@chakra-ui/avatar";

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

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const { user, chats, setChats } = ChatState();

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };

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
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please fill all the feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]);
      onClose();
      toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Failed to Create the Chat!",
        description: error.response.data,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered colorScheme="">
        <ModalOverlay />
        <ModalContent width="40%" height="60%" mx="auto" border="1px">
          <ModalHeader borderBottomWidth="1px" bg="black">
            <Text color="white" fontWeight={"bold"}>
              Create Group chat
            </Text>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody
            overflowY="auto"
            bg="#262626"
            d="flex"
            flexDir="column"
            alignItems="center"
          >
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
                color={"white"}
                bg="#333333"
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users eg: John, Jane"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
                color={"white"}
                bg="#333333"
              />
            </FormControl>

            <Box maxHeight="300px" overflowY="auto">
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
              ))}
            </Box>

            {loading ? (
              <Spinner color="white" alignSelf={"center"} />
            ) : (
              <Box maxHeight="300px" overflowY="auto">
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
                      onClick={() => handleGroup(user)}
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

            {/* {loading ? (
              <>
                <Spinner color="white" />
              </>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )} */}
          </ModalBody>
          <ModalFooter bg="#262626">
            <Button onClick={handleSubmit} colorScheme="blue">
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
