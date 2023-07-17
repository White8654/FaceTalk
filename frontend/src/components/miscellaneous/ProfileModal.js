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
  IconButton,
  Text,
  Image,
  Avatar,
} from "@chakra-ui/react";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Convert base64 image to regular image

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <Avatar
          size="md"
          cursor="pointer"
          src={user && `data:image/svg+xml;base64,${user.pic}`}
          onClick={onOpen}
        />
      )}
      <Modal
        size={{ base: "sm", md: "lg" }}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" />
        <ModalContent h="580px" bg="gray.800" color="white">
          <ModalHeader
            fontSize="40px"
            fontFamily="Roboto"
            display="flex"
            justifyContent="center"
          >
            {user && user.name}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            //justifyContent="space-between"
          >
            <Image
              width={"30%"}
              src={user && `data:image/svg+xml;base64,${user.pic}`}
              alt="avatar"
              //onClick={() => setSelectedAvatar(index)}
            />
            <Text
              fontSize={{ base: "15px", md: "20px" }}
              fontFamily="Roboto"
              alignSelf={"flex-start"}
              display={"flex"}
            >
              <Text fontWeight={"extrabold"}>Email:</Text> {user && user.email}
            </Text>
            <Text
              fontSize={{ base: "15px", md: "20px" }}
              fontFamily="Roboto"
              alignSelf={"flex-start"}
              display={"flex"}
            >
              <Text fontWeight={"extrabold"}>About:</Text>
              {user && user.about}
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
