import { FormControl } from "@chakra-ui/form-control";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { AttachmentIcon, Search2Icon } from "@chakra-ui/icons";
import { Icon } from "@chakra-ui/react";
import Landingpage from "../animations/landingPage";
import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Image,
} from "@chakra-ui/react";
import Modalforcall from "./modal/modal2";
import Modalforvcall from "./modal/modal3";
//import { FiVideo, AiOutlineSearch, BsThreeDotsVertical } from "react-icons";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import videoChat from "../pages/videoChat";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import EmojiPicker from "./miscellaneous/emojiPicker";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import { color } from "framer-motion";
//import { useToast } from "@chakra-ui/toast";
const ENDPOINT = "https://facetalk-production.up.railway.app/";
//const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { isOpen: a, onOpen: b, onClose: c } = useDisclosure();
  const { isOpen: d, onOpen: e, onClose: f } = useDisclosure();
  const { isOpen: g, onOpen: h, onClose: i } = useDisclosure();
  //const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState("");

  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);

  const [callStatus, setCallStatus] = useState(null);
  const toast = useToast();
  const id = "test-toast";

  const fileInputRef = useRef(null);
  const history = useNavigate();
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const {
    chats,
    setChats,
    selectedChat,
    latestMessages,
    setLatestMessages,
    setSelectedChat,
    user,
    notification,
    setNotification,
    details,
    setDetails,
    vdetails,
    setVdetails,
    input,
    setinput,
    newMessage,
    setNewMessage,
    emoji,
    setEmoji,
  } = ChatState();

  const loaded = false;

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      const randomId = Math.floor(Math.random() * 1000000);
      const dummyMessage = {
        _id: randomId,
        chat: selectedChat,
        content: newMessage,
        createdAt: new Date().toISOString(),
        isDeleted: [],
        readBy: [],
        sender: {
          pic: user.pic,
          _id: user._id,
          name: user.name,
        },
      };
      console.log(dummyMessage);
      setMessages([...messages, dummyMessage]);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");

        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        console.log(data);
        socket.emit("new message", data);
        const dummyIndex = messages.findIndex(
          (message) => message._id === randomId
        );

        // Replace the dummy message with the actual message received from the server
        if (dummyIndex !== -1) {
          const updatedMessages = [...messages];
          updatedMessages[dummyIndex] = data;
          setMessages(updatedMessages);
        }

        console.log("sending to socket...");

        // setMessages([...messages, data]);
        const index = chats.findIndex((c) => c._id === selectedChat._id);
        if (index !== -1) {
          // Item found in chats, move it to the beginning
          const updatedChats = [
            chats[index],
            ...chats.slice(0, index),
            ...chats.slice(index + 1),
          ];
          setChats(updatedChats);
          setFetchAgain(!fetchAgain);
        }
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message !!!!",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };
  var roomOfcall;
  let callingUserC = user;
  //var roomYouCalled;
  const [call, setCall] = useState(false);

  useEffect(() => {
    if (call) {
      e();
      setCall(!call);
    }
  }, [call]);

  useEffect(() => {
    socket = io(ENDPOINT);

    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    socket.on("receivecall", ({ roomId, callingUser }) => {
      setDetails(callingUser);
      setCall(1);
      e();
      setCallStatus("incoming");

      console.log("call is incoming");
    });
    socket.on("answered call", (roomId) => {
      history(`/room/${roomId}`);
    });

    socket.on("cut call", () => {
      c();
      toast({
        title: "Call Declined!",
        description: "User is Busy !!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    });

    socket.on("voice receivecall", ({ voiceId, callingUser }) => {
      setVdetails(callingUser);
      setCall(1);
      i();
      setCallStatus("incoming");

      console.log("voice call is incoming");
    });
    socket.on("voice answered call", (voiceId) => {
      history(`/voice/${voiceId}`);
    });

    socket.on("voice cut call", () => {
      i();
      toast({
        title: "Call Declined!",
        description: "User is Busy !!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    });

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
        //console.log(messages);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  // const [selectedImage, setSelectedImage] = useState(null);

  // const handleAttachment = () => {
  //   fileInputRef.current.click();
  // };

  // const handleFileSelect = (event) => {
  //   const file = event.target.files[0];
  //   setSelectedImage(URL.createObjectURL(file));
  // };

  // const handleSend = () => {
  //   // Handle sending the message with the selected image here
  //   console.log("Message:", newMessage);
  //   console.log("Selected Image:", selectedImage);
  // };

  const handleAttachmentClick = (userIdd) => {
    b();
    //roomYouCalled = selectedChat._id;
    socket.emit("calling", {
      roomId: userIdd._id,
      userId: userIdd,
      userData: user,
    });
    socket.on("userNotOnline", () => {
      c();
      toast({
        title: "User Offline",
        description: "The user you are trying to call is currently offline.",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
      return;
    });
    //if (roomOfcall) history(`/room/${roomOfcall}`);
  };
  //this.refs.nameInput.getInputDOMNode().focus();

  const handlevAttachmentClick = (userIdd) => {
    h();
    //roomYouCalled = selectedChat._id;
    socket.emit("voice calling", {
      voiceId: userIdd._id,
      userId: userIdd,
      userData: user,
    });
    socket.on("voice userNotOnline", () => {
      i();
      toast({
        title: "User Offline",
        description: "The user you are trying to call is currently offline.",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
      return;
    });
    //if (roomOfcall) history(`/room/${roomOfcall}`);
  };
  //this.refs.nameInput.getInputDOMNode().focus();

  return (
    <Box w="100%" h={"92%"}>
      {" "}
      {emoji != 0 && <EmojiPicker />}
      {details && <Modalforcall />}
      {vdetails && <Modalforvcall />}
      {selectedChat ? (
        <>
          <Box display="flex" justifyContent="space-between" w="100%">
            <Box>
              <Text
                fontSize={{ base: "15px", md: "20px" }}
                pb={3}
                px={2}
                color={"white"}
                w="100%"
                fontFamily="Roboto"
                fontWeight={"extrabold"}
                display="flex"
                alignItems="center"
              >
                <i
                  class="fa-solid fa-arrow-left-long"
                  style={{
                    color: "white",
                    marginRight: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedChat("")}
                ></i>

                {messages &&
                  (!selectedChat.isGroupChat ? (
                    <>
                      <ProfileModal
                        px={3}
                        user={getSenderFull(user, selectedChat.users)}
                      />
                      <Box display={"flex"} flexDir={"column"}>
                        {/* Add the spacing here */}
                        {getSender(user, selectedChat.users)}
                        {istyping ? (
                          <Text
                            color={"yellow"}
                            fontSize={"13px"}
                            fontWeight={"normal"}
                          >
                            Typing...
                          </Text>
                        ) : getSenderFull(user, selectedChat.users) &&
                          getSenderFull(user, selectedChat.users).isOnline ===
                            true ? (
                          <Text
                            color={"#03fc2c"}
                            fontSize={"13px"}
                            fontWeight={"normal"}
                          >
                            Online
                          </Text>
                        ) : (
                          <Text
                            color={"white"}
                            fontSize={"13px"}
                            fontWeight={"normal"}
                          >
                            Offline
                          </Text>
                        )}
                      </Box>
                    </>
                  ) : (
                    <>
                      <UpdateGroupChatModal
                        fetchMessages={fetchMessages}
                        fetchAgain={fetchAgain}
                        setFetchAgain={setFetchAgain}
                      />
                      <Box marginRight="8px" /> {/* Add the spacing here */}
                      {selectedChat.chatName.toUpperCase()}
                    </>
                  ))}
              </Text>
            </Box>
            <Box display={{ base: "none", md: "flex" }} marginTop={"7px"}>
              {selectedChat && selectedChat.isGroupChat === false && (
                <i
                  class="fa-solid fa-phone fa-lg"
                  style={{ color: "white", margin: "20px", cursor: "pointer" }}
                  onClick={() =>
                    handlevAttachmentClick(
                      getSenderFull(user, selectedChat.users)
                    )
                  }
                ></i>
              )}

              {selectedChat && selectedChat.isGroupChat === false && (
                <i
                  class="fa-solid fa-video fa-lg"
                  style={{
                    color: "white",
                    marginTop: "20px",
                    marginRight: "2px",
                    marginBottom: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    handleAttachmentClick(
                      getSenderFull(user, selectedChat.users)
                    )
                  }
                ></i>
              )}
              <i
                class="fa-solid fa-ellipsis-vertical fa-lg"
                style={{ color: "white", margin: "20px", cursor: "pointer" }}
              ></i>

              {/* <IconButton
                //display={{ base: "flex", md: "none" }}
                icon={<Search2Icon />}
                color={"white"}
                bg={"#333333"}
                mr={"10px"}
                onClick={() =>
                  handleAttachmentClick(getSenderFull(user, selectedChat.users))
                }
                //alignSelf={"flex-end"}
              /> */}
              <Modal
                closeOnOverlayClick={false}
                isOpen={a}
                onClose={b}
                size="sm"
              >
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader style={{ textAlign: "center" }}>
                    {getSenderFull(user, selectedChat.users).name}
                  </ModalHeader>
                  {/* //<ModalCloseButton /> */}
                  <ModalBody
                    display="flex"
                    flexDir="column"
                    alignItems="center"
                  >
                    <Image
                      src={
                        getSenderFull(user, selectedChat.users).pic
                          ? `data:image/svg+xml;base64,${
                              getSenderFull(user, selectedChat.users).pic
                            }`
                          : ""
                      }
                      borderRadius="full"
                      width="100px"
                      height="100px"
                    />
                    <h2>Video Calling...</h2>
                  </ModalBody>
                  <ModalFooter
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <Button colorScheme="red" onClick={c}>
                      End Call
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
              <Modal
                closeOnOverlayClick={false}
                isOpen={g}
                onClose={i}
                size="sm"
              >
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader style={{ textAlign: "center" }}>
                    {getSenderFull(user, selectedChat.users).name}
                  </ModalHeader>
                  {/* //<ModalCloseButton /> */}
                  <ModalBody
                    display="flex"
                    flexDir="column"
                    alignItems="center"
                  >
                    <Image
                      src={
                        getSenderFull(user, selectedChat.users).pic
                          ? `data:image/svg+xml;base64,${
                              getSenderFull(user, selectedChat.users).pic
                            }`
                          : ""
                      }
                      borderRadius="full"
                      width="100px"
                      height="100px"
                    />
                    <h2>Voice Calling...</h2>
                  </ModalBody>
                  <ModalFooter
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <Button colorScheme="red" onClick={i}>
                      End Call
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
              {/* <Modal
                closeOnOverlayClick={false}
                isOpen={d}
                onClose={f}
                size="sm"
              >
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader style={{ textAlign: "center" }}>
                    {details && details.name}
                  </ModalHeader>
                 
                  <ModalBody
                    display="flex"
                    flexDir="column"
                    alignItems="center"
                  >
                    <Image
                      src={details && details.pic}
                      alt="Receiver Image"
                      borderRadius="full"
                      width="100px"
                      height="100px"
                    />
                    <h2>Calling...</h2>
                  </ModalBody>
                  <ModalFooter
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <Button
                      colorScheme="red"
                      onClick={() => handleDecline(details)}
                      mr={"15px"}
                    >
                      End Call
                    </Button>
                    <Button
                      colorScheme="green"
                      onClick={() => handleAnswer(details)}
                    >
                      Answer Call
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal> */}
            </Box>
            {selectedChat && selectedChat.isGroupChat === false && (
              <Box display={{ base: "flex", md: "none" }}>
                {" "}
                <Menu>
                  <MenuButton>
                    <i
                      class="fa-solid fa-ellipsis-vertical fa-lg"
                      style={{
                        color: "white",
                        margin: "20px",
                        cursor: "pointer",
                      }}
                    ></i>
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      fontFamily="Roboto"
                      onClick={() =>
                        handlevAttachmentClick(
                          getSenderFull(user, selectedChat.users)
                        )
                      }
                    >
                      voice Call
                    </MenuItem>{" "}
                    <MenuDivider />
                    <MenuItem
                      fontFamily="Roboto"
                      onClick={() =>
                        handleAttachmentClick(
                          getSenderFull(user, selectedChat.users)
                        )
                      }
                    >
                      {" "}
                      Video Call
                    </MenuItem>{" "}
                  </MenuList>
                </Menu>
              </Box>
            )}
          </Box>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              paddingRight: "3px",
              // backgroundColor: "#333333",
              backgroundImage:
                "url('https://wallpaperaccess.com/full/270972.jpg')",
              //height: "100vh",
              //marginTop: "-70px",
              //fontSize: "50px",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              width: "100%",
              height: "100%",
              borderRadius: "8px",
              overflowY: "hidden",
              padding: "5px",
            }}
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
                color="white"
              />
            ) : (
              <div className="messages">
                <ScrollableChat
                  messages={messages}
                  style={{ overflowY: "hidden" }}
                />
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  id="input1"
                  value={newMessage}
                  autoFocus
                  onChange={typingHandler}
                  style={{
                    background: "#121212",
                    paddingLeft: "50px",
                    height: "50px",
                    placeholder: "Enter a message..",
                    fontSize: "20px",
                    fontWeight: "bold",
                    fontFamily: "roboto",
                    color: "white",
                    borderColor: "#8080ff",
                    borderWidth: "2px",
                    borderRadius: "20px",
                    width: "100%",
                    position: "relative",
                  }}
                />
                <i
                  className="fa-solid fa-face-smile fa-2x"
                  style={{
                    color: "white",
                    position: "absolute",
                    left: "5px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  onClick={() => {
                    setEmoji(true);
                  }}
                ></i>
              </div>
            </FormControl>
          </div>
        </>
      ) : (
        // to get socket.io on same page
        <Box
          display={"flex"}
          flexDir={"column"}
          h={"100%"}
          w={"100%"}
          alignItems={"center"}
        >
          <Landingpage />
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            w={"100%"}
            h={"100%"}
          >
            <Text
              color={"white"}
              fontSize="3xl"
              pb={3}
              fontFamily="Roboto"
              fontWeight={"extrabold"}
            >
              Click on a user to start chatting
            </Text>
          </Box>
          {/* {callStatus === "incoming" && (
            <Modal
              closeOnOverlayClick={false}
              isOpen={d}
              onClose={f}
              size="sm"
              key={new Date().getTime()}
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader style={{ textAlign: "center" }}>
                  {details && details.name}
                </ModalHeader>

                <ModalBody display="flex" flexDir="column" alignItems="center">
                  <Image
                    src={
                      details ? `data:image/svg+xml;base64,${details.pic}` : ""
                    }
                    alt="Receiver Image"
                    borderRadius="full"
                    width="100px"
                    height="100px"
                  />
                  <h2>Calling...</h2>
                </ModalBody>
                <ModalFooter
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <Button
                    colorScheme="red"
                    onClick={() => handleDecline(details)}
                    mr={"15px"}
                  >
                    End Call
                  </Button>
                  <Button
                    colorScheme="green"
                    onClick={() => handleAnswer(details)}
                  >
                    Answer Call
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          )} */}
        </Box>
      )}
    </Box>
  );
};

export default SingleChat;
