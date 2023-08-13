import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function Homepage() {
  const history = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) history("/chats");
  }, [history]);

  return (
    <Container maxW="md" centerContent>
      <Box
        bg=" #1f1f1f"
        w="100%"
        p={4}
        borderWidth="0px"
        m="40px 0 0 0"
        borderRadius="lg"
        boxShadow=" 5px 5px 10px rgba(0, 0, 0, 0.199)"
      >
        <Text
          fontSize="4xl"
          display="flex"
          fontFamily="Roboto"
          color="white"
          justifyContent="center"
          p={3}
          bg=" #1f1f1fk"
          w="100%"
          fontWeight="bold"
        >
          FaceTalk
        </Text>
        <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            <Tab>Login</Tab>
            <Tab>Register</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default Homepage;
