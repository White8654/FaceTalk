import React from "react";
import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useNavigate } from "react-router";
import { Flex, Text, Box, Image } from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { Container } from "@chakra-ui/react";

const emailVerify = () => {
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

        <Text>
          Please check your email for a verification message. Thank you!
        </Text>
      </Box>
    </Container>
  );
};

export default emailVerify;
