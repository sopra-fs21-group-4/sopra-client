import React from 'react';
import { api, handleError } from '../../helpers/api';
import { Spinner } from '../../views/design/Spinner';
import { withRouter } from 'react-router-dom';
import Message from "../../views/Message";
import parseEmoji from "../../helpers/Emoji";
import { VerticalBox, VerticalScroller } from "../../views/design/Containers";
import User from "../shared/models/User";
import InputField from "../general/InputField";

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: null,
            collapsed: false,
        };
    }

    /**
     * this method posts a message.
     * It takes the current value of the input field and the userId from the local storage
     * to send a message-post-request to the server.
     * The input field's content is cleared afterwards.
     * If the input field is empty beforehand, the operation is canceled.
     */
    async postMessage() {
        try {
            let inputField = document.getElementById(`chatInput${this.props.chatId}`);

            // if there's nothing to send, we cancel the operation
            if (!inputField.value) return;

            // request setup
            const url = `/chat/${this.props.chatId}`;
            const requestBody = JSON.stringify({text: inputField.value});
            const config = { headers: User.getUserAuthentication()};
            const response = await api.post(url, requestBody, config);
            console.log(response);
            inputField.value = "";    // reset input field

        } catch (error) {
            alert(`Something went wrong while fetching the messages: \n${handleError(error)}`);
        }
    }

    async update() {
        if (!this.props.chatId) return;
        try {
            // request setup
            const url = `/chat/${this.props.chatId}`;
            const config = { headers: User.getUserAuthentication()};
            const response = await api.get(url, config);
            // console.log(response);
            this.setState({ messages: response.data });
        } catch (error) {
            alert(`Something went wrong while fetching the messages: \n${handleError(error)}`);
        }
    }

    componentDidMount() {
        this.props.updateLoop.addClient(this);
    }

    componentWillUnmount() {
        this.props.updateLoop.removeClient(this);
    }

    render() {
        return (

            <VerticalBox
                style={{
                    position: 'relative',
                    bottom: 0,
                    height: '100%',

                }}
            >
                <div
                    style={{
                        position: 'relative',
                        height: '100%',
                        paddingBottom: '65px',
                    }}
                >
                    {this.state.messages? this.messageList() : <Spinner/>}
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    padding: '15px',
                }}>
                    <InputField
                        id={`chatInput${this.props.chatId}`}
                        submitAction={() => this.postMessage()}
                        submitButtonText='Send'
                        textFilters={[parseEmoji]}
                    />
                </div>
            </VerticalBox>
        );
    }

    messageList() {
        return (<VerticalScroller style={{
            position: 'relative',
            bottom: '0px',
            height: '100%',
            width: '100%',
            overflow:'auto',
            paddingRight: '10px',
            paddingLeft: '10px',
            display: 'flex',
            flexDirection: 'column-reverse',
        }}>
            {/* double reverse the message list to stay scrolled on the bottom */}
            {this.state.messages.slice().reverse().map(message => {
                return (
                    <Message message={message} />
                );
            })}
        </VerticalScroller>);
    }
}

export default withRouter(Chat);
