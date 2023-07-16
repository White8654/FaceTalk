import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { ChatState } from "../Context/ChatProvider";

const Voicechat = () => {
  const { voiceId } = useParams();
  const [loggedUser, setLoggedUser] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo"));
  });

  const navigate = useNavigate();
  const voicechatRef = useRef(null);

  useEffect(() => {
    const Mymeeting = async () => {
      const appID = 188191483;
      const serverSecret = "eb034cc27d8fd9eafa7237320f43e6ce";
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        voiceId,
        loggedUser._id,
        loggedUser.name
      );

      // Create instance object from Kit Token.
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: voicechatRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPreJoinView: false,
        turnOnCameraWhenJoining: false,
        showScreenSharingButton: false,

        showTurnOffRemoteCameraButton: false, // Whether to display the button for turning off the remote camera. Not displayed by default.
        showTurnOffRemoteMicrophoneButton: false, // Whether to display the button for turning off the remote microphone. Not displayed by default.
        showMyCameraToggleButton: false, // Whether to display the button for toggling my camera. Displayed by default.
        //showMyMicrophoneToggleButton: false, // Whether to display the button for toggling my microphone. Displayed by default.
        showAudioVideoSettingsButton: false, // Whether to display the button for audio and video settings. Displayed by default.
        showTextChat: false, // Whether to display the text chat on the right side. Displayed by default.
        showUserList: false, // Whether to display the participant list. Displayed by default.
        showRemoveUserButton: false,
      });
    };

    Mymeeting();

    return () => {
      navigate("/chats");
      window.location.reload(); // Reload the page
    };
  }, [voiceId]);

  const handleBackButton = () => {
    navigate("/chats");
    window.location.reload(); // Reload the page
  };

  return (
    <div>
      <div style={{ width: "100vw", height: "100vh" }} ref={voicechatRef} />
      <button onClick={handleBackButton}>Back</button>
    </div>
  );
};

export default Voicechat;
