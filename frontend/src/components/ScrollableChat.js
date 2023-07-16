import { Box, Text } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            <Box
              display="flex"
              // flexDir={"column"}

              style={{
                position: "relative",

                backgroundColor: m.content.match(
                  /[\uD800-\uDBFF][\uDC00-\uDFFF]/
                )
                  ? "transparent"
                  : m.sender._id === user._id
                  ? "#BEE3F8"
                  : "#8080ff",
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 3,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
                fontSize: m.content.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/)
                  ? "40px"
                  : "inherit",
                alignSelf: "center",
              }}
            >
              {" "}
              {m.chat.isGroupChat === true && m.sender._id !== user._id && (
                <Text
                  style={{
                    fontSize: "9px",
                    color: m.content.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/)
                      ? "white"
                      : "black",

                    whiteSpace: "nowrap",
                    alignSelf: "flex-start",
                  }}
                >
                  {m.sender.name}
                </Text>
              )}
              <Text style={{}}>{m.content}</Text>
              <Text
                style={{
                  fontSize: "9px",
                  color: m.content.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/)
                    ? "white"
                    : "black",
                  padding: "3px",
                  whiteSpace: "nowrap",
                  alignSelf: "flex-end",
                }}
              >
                {new Date(m.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Box>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
