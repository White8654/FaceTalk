import React, { useEffect } from "react";
import { Button } from "@chakra-ui/button";

import { Input } from "@chakra-ui/input";
import "./login.css";

import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Flex, Box, Image } from "@chakra-ui/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";

const Login = () => {
  const toast = useToast();
  const history = useNavigate();

  const [email, setEmail] = useState();

  const [password, setPassword] = useState();
  const [auth, setAuth] = useState();

  const submitHandler = async () => {
    if (!email || !password) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    console.log(email, password);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/user/login",
        {
          email,
          password,
        },
        config
      );
      console.log(data);
      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));

      history("/chats");
      // window.location.reload();
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

  const handleGoogleLoginSuccess = (credentialResponse) => {
    const details = jwt_decode(credentialResponse.credential);
    //console.log(details);
    //setName(details.given_name + " " + details.family_name);
    setEmail(details.email);
    setPassword(details.sub);
    if (email && password) submitHandler();
    setAuth(!auth);
  };

  useEffect(() => {
    if (email && password) {
      console.log("called");
      submitHandler();
    }
  }, [auth]);

  // document.getElementById("input").addEventListener("keyup", function (event) {
  //   // Number 13 is the "Enter" key on the keyboard
  //   if (event.keyCode === 13) {
  //     // Cancel the default action, if needed
  //     // event.preventDefault();
  //     // Trigger the button element with a click
  //     document.getElementById("Login").click();
  //   }
  // });
  return (
    <Flex
      flexDirection="column"
      bg={" #1f1f1f"}
      p={6}
      borderRadius={8}
      color={"white"}
    >
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
        id="input"
      />
      <Box mb={3} mt={3} display="flex" justifyContent={"center"}>
        <GoogleOAuthProvider clientId="327729156972-u385vbit4lou36stv5f595ljhsdm1tpc.apps.googleusercontent.com">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => {
              console.log("Login Failed");
            }}
          />
        </GoogleOAuthProvider>
      </Box>
      <Button id="Login" colorScheme="blue" mt={4} onClick={submitHandler}>
        Login
      </Button>
    </Flex>
  );
};

export default Login;
