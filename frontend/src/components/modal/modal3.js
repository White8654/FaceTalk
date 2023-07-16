import React from "react";
import "./modal2.css";
import { useState, useEffect } from "react";
import io from "socket.io-client";

import { ChatState } from "../../Context/ChatProvider";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
const ENDPOINT = "https://facetalk.onrender.com/";
var socket;

const Modal3 = () => {
  return <Modal2 key={new Date().getTime()} />;
};

const Modal2 = () => {
  const history = useNavigate();
  const [show, setShow] = useState(true);
  socket = io(ENDPOINT);
  const toast = useToast();

  const { vdetails, setVdetails, user } = ChatState();
  const [loggedUser, setLoggedUser] = useState();
  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
  }, []); // Run only once when the component mounts

  const handleAnswer = () => {
    socket.emit("voice answer call", {
      voiceId: loggedUser._id,
      userId: vdetails._id,
    });
    socket.on("voice userNotOnline", () => {
      toast({
        title: "User Offline",
        description: "The user you are trying to call is currently offline.",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
      setShow(false);
      return;
    });

    history(`/voice/${loggedUser._id}`);
  };
  const handleDecline = () => {
    socket.emit("voice decline call", { voiceId: loggedUser._id });

    setVdetails(null);
    setShow(false);
  };
  console.log("Modal3 onBoard");

  if (!show) {
    return null; // Don't render anything if showCard is false
  }
  return (
    <>
      {" "}
      {vdetails && show && (
        <div class="card">
          <div class="imgBox">
            <img
              viewBox="0 0 16 16"
              class="bi bi-person-circle"
              width="100px"
              height="100px"
              src={vdetails ? `data:image/svg+xml;base64,${vdetails.pic}` : ""}
              alt="Receiver Image"
            ></img>
          </div>
          <div class="name">
            {vdetails && vdetails.name}
            <p class="p2">Incoming Call</p>
          </div>
          <div class="caller">
            <span id="pick" class="callerBtn" onClick={() => handleAnswer()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-telephone-fill"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"
                ></path>
              </svg>
            </span>
            <span id="end" class="callerBtn" onClick={() => handleDecline()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-telephone-fill"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"
                ></path>
              </svg>
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal3;
