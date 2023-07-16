import React, { useState } from "react";
import onClickOutside from "react-onclickoutside";
import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Categories,
} from "emoji-picker-react";
import { ChatState } from "../../Context/ChatProvider";

function EmojiPickerComponent() {
  const { newMessage, setNewMessage, emoji, setEmoji } = ChatState();
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [showPicker, setShowPicker] = useState(true);

  const handleClickOutside = () => {
    console.log("onClickOutside() method called");
    setShowPicker(false);
    setEmoji(0);
  };
  EmojiPickerComponent.handleClickOutside = handleClickOutside;

  const handleEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
    const updatedMessage = newMessage + emojiData.emoji;
    setNewMessage(updatedMessage);
    setSelectedEmoji(emojiData.unified);
  };

  return (
    <div style={{ position: "absolute", zIndex: "50" }}>
      {showPicker && (
        <React.Fragment>
          {selectedEmoji && <div>Selected Emoji: {selectedEmoji}</div>}
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            emojiStyle={EmojiStyle.NATIVE}
            categories={[
              {
                name: "Fun and Games",
                category: Categories.ACTIVITIES,
              },
              {
                name: "Smiles & Emotions",
                category: Categories.SMILEYS_PEOPLE,
              },
              {
                name: "Flags",
                category: Categories.FLAGS,
              },
              {
                name: "Yum Yum",
                category: Categories.FOOD_DRINK,
              },
            ]}
          />
        </React.Fragment>
      )}
    </div>
  );
}

const clickOutsideConfig = {
  handleClickOutside: () => EmojiPickerComponent.handleClickOutside,
};

export default onClickOutside(EmojiPickerComponent, clickOutsideConfig);
