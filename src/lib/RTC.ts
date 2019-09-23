import socket from '../constants/socket-context';
import Constants from '../constants/Constants';
import * as Types from '../constants/Types';

const TIMEOUT_MS = 1500;
const RETRY_INTERVAL_MS = 3000;

class RTC {
    localConnection: RTCPeerConnection;
    sendChannel: RTCDataChannel | null;
    receiveChannel: RTCDataChannel | null;
    customSendChannelStatusHandler: any;
    customReceiveChannelStatusHandler: any;
    customReceiveMessageHandler: any;
    attemptReconnectInterval: any;

    constructor() {
        this.localConnection = new RTCPeerConnection();
        this.sendChannel = null;
        this.receiveChannel = null;
        this.customSendChannelStatusHandler = null;
        this.customReceiveChannelStatusHandler = null;
        this.customReceiveMessageHandler = null;
        this.attemptReconnectInterval = null;

        socket.on(Constants.RTC_DESCRIPTION_OFFER, (data: Types.SDP) => {
            this.localConnection.setRemoteDescription(data.sdp)
                .then(() => {
                    console.log('Receiver remote SDP set.');
                    this.localConnection.createAnswer()
                        .then((answer: RTCSessionDescriptionInit) => {
                            this.localConnection.setLocalDescription(answer);
                            socket.emit(Constants.RTC_DESCRIPTION_ANSWER, {
                                sdp: this.localConnection.localDescription
                            });
                        })
                        .catch(this.handleCreateAnswerError);
                })
                .catch(this.handleSetDescriptionError);
        });

        socket.on(Constants.RTC_DESCRIPTION_ANSWER, (data: Types.SDP) => {
            this.localConnection.setRemoteDescription(data.sdp)
                .then(() => {
                    console.log('Sender remote SDP set.');
                })
                .catch(this.handleSetDescriptionError);
        });

        socket.on(Constants.ICE_CANDIDATE, (data: RTCIceCandidate) => {
            this.localConnection.addIceCandidate(data).catch(this.handleAddCandidateError);
        });
    } 
    
    /**
     * Creates data channel and if initiator, creates offer and sends it over socket to room.
     * If sendChannel and receiveChannel does not open up in TIMEOUT_MS, attempt to reconnect.
     */
    connectPeers = (channel: string, initiator: boolean): void => {
        this.sendChannel = this.localConnection.createDataChannel(channel);
        this.sendChannel.onopen = this.handleSendChannelStatusChange;
        this.sendChannel.onclose = this.handleSendChannelStatusChange;

        this.localConnection.ondatachannel = this.receiveChannelCallback;
        this.localConnection.onicecandidate = this.handleOnICECandidate;

        if (initiator) {
            this.localConnection
                .createOffer()
                .then((offer: RTCSessionDescriptionInit) => this.localConnection.setLocalDescription(offer))
                .then(() => {
                    console.log('Sender SDP sent.');
                    socket.emit(Constants.RTC_DESCRIPTION_OFFER, {
                        sdp: this.localConnection.localDescription
                    });
                })
                .catch(this.handleCreateDescriptionError);
        }

        setTimeout(() => {
            if (!this.fullyConnected() && !this.attemptReconnectInterval) {
                console.log('Attempting to reconnect');
                this.attemptReconnectInterval = setInterval(() => {
                    this.disconnect();
                    this.connectPeers(channel, initiator);
                }, RETRY_INTERVAL_MS)
            }
        }, TIMEOUT_MS);
    };

    /**
     * Disconnects from send and receive data channels, also creates new RTCPeerConnection.
     */
    disconnect = (): void => {
        console.log('Disconnect from RTC connection');
        this.sendChannel && (this.sendChannel as RTCDataChannel).close();
        this.receiveChannel && (this.receiveChannel as RTCDataChannel).close();

        this.localConnection.close();

        this.sendChannel = null;
        this.receiveChannel = null;
        this.localConnection = new RTCPeerConnection();
    }

    /**
     * Checks if ready to start data transmission over RTC channels.
     */
    fullyConnected = (): boolean | null => {
        return this.sendChannel && this.sendChannel.readyState === 'open' && this.receiveChannel && this.receiveChannel.readyState === 'open';
    }

    /**
     * Handles status change (open, close) on send channel.
     * If a custom status handler was set, that is also called.
     */
    handleSendChannelStatusChange = (): void => {
        if (this.sendChannel) {
            const open = this.sendChannel.readyState === 'open'
            console.log(`Send channel open status: ${open}`);

            if (this.fullyConnected()) {
                clearInterval(this.attemptReconnectInterval);
            }

            if (this.customSendChannelStatusHandler) {
                this.customSendChannelStatusHandler(open);
            }
        }
    };

    /**
     * Handles status change (open, close) on receive channel.
     * If a custom status handler was set, that is also called.
     */
    handleReceiveChannelStatusChange = (): void => {
        if (this.receiveChannel) {
            const open = this.receiveChannel.readyState;
            console.log(`Receive channel status: ${open}`);

            if (this.fullyConnected()) {
                clearInterval(this.attemptReconnectInterval);
            }

            if (this.customReceiveChannelStatusHandler) {
                this.customReceiveChannelStatusHandler(open);
            }
        }
    }

    /**
     * Sends ICE candidate over socket to others in the room until agreed upon.
     */
    handleOnICECandidate = (e: RTCPeerConnectionIceEvent): void => {
        if (e.candidate) {
            socket.emit(Constants.ICE_CANDIDATE, e.candidate);
        }
    }

    /**
     * Error handling for creating SDP.
     */
    handleCreateDescriptionError = (error: Error): void => {
        console.log(`Unable to create an offer due to error: ${error.toString()}`);
    };

    /**
     * Error handling for setting SDP.
     */
    handleSetDescriptionError = (error: Error): void => {
        console.log(`Something went wrong when setting remote description: ${error.toString()}`);
    }

    /**
     * Error handling for creating answer for an offer.
     */
    handleCreateAnswerError = (error: Error): void => {
        console.log(`Something went wrong when creating Answer to Offer. ${error.toString()}`);
    }

    /**
     * Error handling for adding ICE candidate.
     */
    handleAddCandidateError = (error: Error): void => {
        console.log(`Something went wrong with adding the candidate. ${error.toString()}`);
    };

    /**
     * Callback for when receiveChannel is ready to be set.
     */
    receiveChannelCallback = (event: RTCDataChannelEvent): void => {
        this.receiveChannel = event.channel;
        this.receiveChannel.onopen = this.handleReceiveChannelStatusChange;
        this.receiveChannel.onclose = this.handleReceiveChannelStatusChange;
        this.receiveChannel.onmessage = this.onReceiveMessageCallback;
    };

    /**
     * Callback for when data is received. Calls custom handler if there is one.
     */
    onReceiveMessageCallback = (event: MessageEvent): void => {
        console.log(`Received message from receive channel: ${event}`);
        if (this.customReceiveMessageHandler) {
            this.customReceiveMessageHandler(event);
        }
    }

    /**
     * Sets custom handler for status change on send channel
     */
    setHandleSendChannelStatusChange = (handler: any): void => {
        this.customSendChannelStatusHandler = handler;
    }

    /**
     * Sets custom handler for status change on receive channel
     */
    setHandleReceiveChannelStatusChange = (handler: any): void => {
        this.customReceiveChannelStatusHandler = handler;
    }

    /**
     * Sets custom handler for on message received.
     */
    setReceiveMessageHandler = (handler: any): void => {
        this.customReceiveMessageHandler = handler;
    }

    /**
     * Sets binary type for send channel
     */
    setSendChannelBinaryType = (type: string) => {
        if (this.sendChannel) {
            this.sendChannel.binaryType = type;
        }
    }

    /**
     * Sets binary type for receive channel
     */
    setReceiveChannelBinaryType = (type: string) => {
        if (this.receiveChannel) {
            this.receiveChannel.binaryType = type;
        }
    }

    /**
     * Sends data over send channel
     */
    sendMessage = (msg: any): boolean => {
        if (this.sendChannel) {
            this.sendChannel.send(msg);
            return true;
        }
        return false;
    }


}

const RTCInstance = new RTC();
export default RTCInstance;