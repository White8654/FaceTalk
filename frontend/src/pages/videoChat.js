import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { ChatState } from "../Context/ChatProvider";

const Videochat = () => {
  const { roomId } = useParams();
  const [loggedUser, setLoggedUser] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo"));
  });

  const navigate = useNavigate();
  const videochatRef = useRef(null);

  useEffect(() => {
    const Mymeeting = async () => {
      const appID = 940868252;
      const serverSecret = "f7d211af4dd22da4a936a8ebb7b61961";
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        loggedUser._id,
        loggedUser.name
      );

      // Create instance object from Kit Token.
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: videochatRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPreJoinView: false,
      });
    };

    Mymeeting();

    return () => {
      navigate("/chats");
      window.location.reload(); // Reload the page
    };
  }, [roomId]);

  const handleBackButton = () => {
    navigate("/chats");
    window.location.reload(); // Reload the page
  };

  return (
    <div>
      <div style={{ width: "100vw", height: "100vh" }} ref={videochatRef} />
      <button onClick={handleBackButton}>Back</button>
    </div>
  );
};

export default Videochat;
