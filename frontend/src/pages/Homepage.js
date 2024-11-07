import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Image,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import logo from "./logo2.png"; // Import the logo from the same folder

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
        boxShadow="5px 5px 10px rgba(0, 0, 0, 0.199)"
      >
        <Image
          src={logo}
          alt="FaceTalk Logo"
          w={"100%"}
          objectFit="fill"
         
          p={10}
         
          bg="#1f1f1f" // Set background to match the box
        />
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
