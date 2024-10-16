import { Button } from "@chakra-ui/button";

import { Input } from "@chakra-ui/input";

import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Flex, Box, Image } from "@chakra-ui/react";
import GoogleAuth from "../../pages/googleAuth";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";

const Signup = () => {
  const toast = useToast();
  const history = useNavigate();

  const [name, setName] = useState();
  const [email, setEmail] = useState();

  const [password, setPassword] = useState();
  const [auth, setAuth] = useState();

 // const api = "https://api.quotable.io/quotes/random";

  const submitHandler = async () => {
    if (!name || !email || !password) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    console.log(name, email, password);
    //const quote = "Howdy!!";

    //console.log(quote);
    const about = "Howdy!!";
    console.log(about);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/user",
        {
          name,
          email,
          password,
          about,
        },
        config
      );
      console.log(data);
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));

      history("/setAvatar");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  // document.getElementById("pass").addEventListener("keyup", function (event) {
  //   // Number 13 is the "Enter" key on the keyboard
  //   if (event.keyCode === 13) {
  //     // Cancel the default action, if needed
  //     // event.preventDefault();
  //     // Trigger the button element with a click
  //     document.getElementById("Register").click();
  //   }
  // });
  // const setAuth = (e) => {
  //   setoAuth(1);
  //   <GoogleAuth />;
  // };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    const details = jwt_decode(credentialResponse.credential);
    console.log(details);
    setName(details.given_name + " " + details.family_name);
    setEmail(details.email);
    setPassword(details.sub);
    setAuth(!auth);
    if (name && email && password) {
      submitHandler();
    }
  };

  useEffect(() => {
    if (name && email && password) {
      submitHandler();
    }
  }, [auth]);

  return (
    <>
      <Flex
        flexDirection="column"
        bg={" #1f1f1f"}
        p={6}
        borderRadius={8}
        color={"white"}
      >
        <Input
          placeholder="Name"
          type="text"
          variant="filled"
          mb={3}
          color="rgba(255, 255, 255, 0.555)"
          _hover={{ borderColor: "red", border: "1px solid" }}
          bg={"none"}
          border="none"
          borderBottom="solid rgb(143, 143, 143) 2px"
          borderRadius="none"
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Email"
          type="email"
          variant="filled"
          mb={3}
          color="rgba(255, 255, 255, 0.555)"
          _hover={{ borderColor: "red", border: "1px solid" }}
          bg={"none"}
          border="none"
          borderBottom="solid rgb(143, 143, 143) 2px"
          borderRadius="none"
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          variant="filled"
          mb={3}
          color="rgba(255, 255, 255, 0.555)"
          _hover={{ borderColor: "red", border: "1px solid" }}
          bg={"none"}
          border="none"
          borderBottom="solid rgb(143, 143, 143) 2px"
          borderRadius="none"
          onChange={(e) => setPassword(e.target.value)}
          id="pass"
        />
        {/* <Box mb={3} mt={3} display="flex" justifyContent={"center"}>
          <GoogleOAuthProvider clientId="327729156972-u385vbit4lou36stv5f595ljhsdm1tpc.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => {
                console.log("Login Failed");
              }}
            />
          </GoogleOAuthProvider>
        </Box> */}
        <Button colorScheme="blue" mt={4} onClick={submitHandler} id="Register">
          Register
        </Button>
      </Flex>
    </>
  );
};

export default Signup;
