import React, { useEffect, Fragment } from "react";
import { Col } from "react-bootstrap";
import { gql, useLazyQuery } from "@apollo/client";
// context
import { useMessageDispatch, useMessageState } from "../../context/message";
import { SET_USER_MESSAGES } from "../../context/types";
// component
import Message from "./Message";

const GET_MESSAGES = gql`
  query getMessages($from: String!) {
    getMessages(from: $from) {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;
function Messages() {
  const { users } = useMessageState();
  const dispatch = useMessageDispatch();
  const selectedUser = users?.find((u) => u.selected === true);
  const messages = selectedUser?.messages;
  const [
    getMessages,
    { loading: messagesLoading, data: messagesData },
  ] = useLazyQuery(GET_MESSAGES);

  useEffect(() => {
    if (selectedUser && !selectedUser.messages) {
      getMessages({ variables: { from: selectedUser.username } });
    }
  }, [selectedUser]);

  useEffect(() => {
    if (messagesData) {
      dispatch({
        type: SET_USER_MESSAGES,
        payload: {
          username: selectedUser.username,
          messages: messagesData.getMessages,
        },
      });
    }
  }, [messagesData]);

  let selectedChatMarkup;
  if (!messages && !messagesLoading) {
    selectedChatMarkup = <p>Select a friend</p>;
  } else if (messagesLoading) {
    selectedChatMarkup = <p>Loading...</p>;
  } else if (messages.length) {
    selectedChatMarkup = messages.map((message, index) => (
      <Fragment key={message.uuid}>
        <Message message={message} />
        {index === messages.length - 1 && (
          <div className="invisible">
            <hr className="m-0" />
          </div>
        )}
      </Fragment>
    ));
  } else if (!messages.length) {
    selectedChatMarkup = <p>You're now connected! send your first message</p>;
  }

  return (
    <Col xs={8} className="messages-box d-flex flex-column-reverse">
      {selectedChatMarkup}
    </Col>
  );
}

export default Messages;