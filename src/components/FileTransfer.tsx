import React, { Component, ChangeEvent } from 'react';
import socket from '../constants/socket-context';
import Constants from '../constants/Constants';
import * as Types from '../constants/Types';
import RTC from '../lib/RTC';

type FileTransferProps = {
    roomOwner: boolean;
};

type FileTranferState = {
    sendChannelOpen: boolean;
    receiveChannelOpen: boolean;
    fileName: string;
    fileSize: number;
    requestTransferPermission: boolean;
    sendFileButtonDisabled: boolean;
    abortButtonDisabled: boolean;
    fileInputDisabled: boolean;
    statusMessageText: string;
    downloadAnchorText: string;
    bitrateDivText: string;
    sendProgressMax: number;
    receiveProgressMax: number;
    sendProgressValue: number;
    receiveProgressValue: number;
    anchorDownloadHref: string;
    anchorDownloadFileName: string;
};

class FileTransfer extends Component<FileTransferProps, FileTranferState> {
    state: FileTranferState = {
        sendChannelOpen: false,
        receiveChannelOpen: false,
        fileName: '',
        fileSize: 0,
        requestTransferPermission: false,
        sendFileButtonDisabled: true,
        abortButtonDisabled: true,
        fileInputDisabled: true,
        statusMessageText: '',
        downloadAnchorText: '',
        bitrateDivText: '',
        sendProgressMax: 0,
        receiveProgressMax: 0,
        sendProgressValue: 0,
        receiveProgressValue: 0,
        anchorDownloadHref: '',
        anchorDownloadFileName: '',
    };

    fileReader: FileReader;
    receiveBuffer: any[];
    receivedSize: number;
    bytesPrev: number;
    timestampStart: number | null;
    timestampPrev: number;
    statsInterval: any;
    bitrateMax: number;
    fileInput: any;

    constructor(props: FileTransferProps) {
        super(props);

        this.receiveBuffer = [];
        this.receivedSize = 0;
        this.bytesPrev = 0;
        this.timestampStart = new Date().getTime();
        this.timestampPrev = this.timestampStart;
        this.statsInterval = null;
        this.bitrateMax = 0;
        this.fileReader = new FileReader();

        this.handleSendChannelStatusChange = this.handleSendChannelStatusChange.bind(this);
        this.handleReceiveChannelStatusChange = this.handleReceiveChannelStatusChange.bind(this);
        this.handleSendData = this.handleSendData.bind(this);
        this.handleReceiveData = this.handleReceiveData.bind(this);
        this.handleFileInputChange = this.handleFileInputChange.bind(this);
        this.handleAbortFileTransfer = this.handleAbortFileTransfer.bind(this);
        this.acceptFileTransfer = this.acceptFileTransfer.bind(this);
        this.closeDataChannels = this.closeDataChannels.bind(this);
        this.displayStats = this.displayStats.bind(this);

        RTC.connectPeers('fileDataChannel', this.props.roomOwner);
        RTC.setHandleSendChannelStatusChange(this.handleSendChannelStatusChange);
        RTC.setHandleReceiveChannelStatusChange(this.handleReceiveChannelStatusChange);
        RTC.setReceiveMessageHandler(this.handleReceiveData);
        RTC.setSendChannelBinaryType('arraybuffer');
        RTC.setReceiveChannelBinaryType('arraybuffer');
    }

    componentDidMount(): void {
        /**
         * Received on a file transfer request from other person in the room.
         * Includes file name and file size, and prompts user to accept file transfer.
         */
        socket.on(Constants.FILE_TRANSFER_REQUEST, (data: Types.RTCFileRequest) => {
            console.log(data.size);
            this.setState({ fileName: data.name, fileSize: data.size, requestTransferPermission: true });
        });

        /**
         * Received on a file transfer reply from other person in the room.
         * Starts sending data if accepted.
         */
        socket.on(Constants.FILE_TRANSFER_REPLY, (data: Types.RTCFileReply) => {
            data.accept && this.handleSendData(this.fileInput.files[0]);
        });
    }

    componentWillUnmount(): void {
        RTC.disconnect();
    }

    /**
     * Custom handler for status change on send channel. Needed to re-render component.
     */
    handleSendChannelStatusChange(open: boolean): void {
        this.setState({ sendChannelOpen: open })
    }

    /**
     * Custom handler for receive change on send channel. Needed to re-render component.
     */
    async handleReceiveChannelStatusChange(open: boolean): Promise<any> {
        this.setState({ receiveChannelOpen: open });
        if (open) {
            this.statsInterval = setInterval(this.displayStats, 500);
            await this.displayStats();
        }
    }

    /**
     * Handles data sent over RTC send channel.
     */
    handleSendData(file: File): void {
        if (!RTC.sendChannel) {
            return;
        }

        this.setState({
            statusMessageText: '',
            downloadAnchorText: '',
        });
        if (file.size === 0) {
            this.setState({
                bitrateDivText: '',
                statusMessageText: 'File is empty, please select a non-empty file',
            });
            this.closeDataChannels();
            return;
        }

        this.setState({
            sendProgressMax: file.size,
        });

        const chunkSize = 16384;
        this.fileReader.onerror = error => console.error('Error reading file:', error);
        this.fileReader.onabort = event => console.log('File reading aborted:', event);

        const readSlice = (progressValueOffset: number): void => {
            const slice = file.slice(this.state.sendProgressValue, progressValueOffset + chunkSize);
            this.fileReader.readAsArrayBuffer(slice);
        };

        const handleFileReaderLoadEvent = (event: ProgressEvent): void => {
            if (!RTC.sendChannel) {
                return;
            }
            const result = this.fileReader.result as ArrayBuffer;
            RTC.sendChannel.send(result);
            const progress = result.byteLength + this.state.sendProgressValue;
            this.setState({
                sendProgressValue: progress,
            });
            if (progress < file.size) {
                readSlice(progress);
            }
        };

        this.fileReader.onload = handleFileReaderLoadEvent;
        readSlice(0);
    }

    /**
     * Handles data received over RTC receive channel.
     */
    handleReceiveData(event: MessageEvent): void {
        this.receiveBuffer.push(event.data);
        this.receivedSize += event.data.byteLength;
        this.setState({
            receiveProgressValue: this.receivedSize,
        });

        if (this.receivedSize === this.state.fileSize) {
            const received = new Blob(this.receiveBuffer);
            this.receiveBuffer = [];

            this.setState({
                anchorDownloadHref: URL.createObjectURL(received),
                downloadAnchorText: `Click to download ${this.state.fileName} (${this.state.fileSize} bytes)`,
                anchorDownloadFileName: this.state.fileName,
            });

            const bitrate = Math.round((this.receivedSize * 8) / (new Date().getTime() - (this.timestampStart || 0)));
            this.setState({
                bitrateDivText: `Average Bitrate: ${bitrate} kbits/sec (max: ${this.bitrateMax} kbits/sec)`,
            });

            if (this.statsInterval) {
                clearInterval(this.statsInterval);
                this.statsInterval = null;
            }

            this.closeDataChannels();
        }
    }

    /**
     * Handle file selection.
     */
    handleFileInputChange(event: ChangeEvent<HTMLInputElement>): void {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            this.setState({
                sendFileButtonDisabled: false,
            });

            // This sends it right after you put a file in. We might want a submit button
            RTC.sendSocketMsg(Constants.FILE_TRANSFER_REQUEST, { name: file.name, size: file.size });
        }
    }

    /**
     * Handles file transfer abort.
     */
    handleAbortFileTransfer(): void {
        if (this.fileReader && this.fileReader.readyState === 1) {
            this.fileReader.abort();
            this.setState({
                sendFileButtonDisabled: false,
            });
        }
    }

    /**
     * Response from receiver whether or not receiver wants to accept file transfer.
     */
    acceptFileTransfer(accept: boolean): void {
        this.setState({ requestTransferPermission: false });
        socket.emit(Constants.FILE_TRANSFER_REPLY, { accept });
    }

    /**
     * Resets ui for next file transfer.
     */
    closeDataChannels(): void {
        this.setState({
            fileInputDisabled: false,
            abortButtonDisabled: true,
            sendFileButtonDisabled: false,
        });
    }

    async displayStats(): Promise<any> {
        if (!RTC.localConnection) {
            return;
        }

        if (!RTC.localConnection || RTC.localConnection.iceConnectionState !== 'connected') {
            return;
        }

        const stats: RTCStatsReport = await RTC.localConnection.getStats();
        let activateCandidatePair: any;
        stats.forEach(report => {
            if (report.type === 'transport') {
                activateCandidatePair = stats.get(report.selectedCandidatePairId);
            }
        });

        if (activateCandidatePair) {
            if (this.timestampPrev === activateCandidatePair.timestamp) {
                return;
            }

            const bytesNow = activateCandidatePair.bytesReceived;
            const bitrate =
                (Math.round(bytesNow - this.bytesPrev) * 8) / (activateCandidatePair.timestamp - this.timestampPrev);

            this.setState({
                bitrateDivText: `Current Bitrate: ${bitrate} kbits/sec`,
            });
            this.timestampPrev = activateCandidatePair.timestamp;
            this.bytesPrev = bytesNow;

            if (bitrate > this.bitrateMax) {
                this.bitrateMax = bitrate;
            }
        }
    }

    render(): React.ReactNode {
        if (this.state.requestTransferPermission) {
            return (
                <div>
                    {`Do you wish to accept ${this.state.fileName} of size ${this.state.fileSize}`}
                    <button onClick={(): void => {this.acceptFileTransfer(true)}}>
                        Accept 
                    </button>
                    <button onClick={(): void => {this.acceptFileTransfer(false)}}>
                        Reject 
                    </button>
                </div>
            )
        }

        return (
            <div className="file-transfer">
                File Transfer Component
                <div>
                    <form id="file-info">
                        <input
                            type="file"
                            id="file-input"
                            onChange={this.handleFileInputChange}
                            ref={ref => (this.fileInput = ref)}
                            disabled={!this.state.sendChannelOpen}
                        />
                    </form>
                    <button
                        disabled={this.state.abortButtonDisabled}
                        id="abort-button"
                        onClick={this.handleAbortFileTransfer}
                    >
                        Abort
                    </button>
                </div>
                <div className="file-transfer-progress">
                    <div className="file-transfer-progress-label">Send Progress:</div>
                    <progress id="send-file-progress" max={this.state.sendProgressMax} value={this.state.sendProgressValue}></progress>
                </div>
                <div className="file-transfer-progress">
                    <div className="file-transfer-progress-label">Receive Progress:</div>
                    <progress id="receive-file-progress" max={this.state.receiveProgressMax} value={this.state.receiveProgressValue}></progress>
                </div>
                <div id="bitrate"></div>
                <a id="download" href={this.state.anchorDownloadHref} download={this.state.anchorDownloadFileName}>
                    {this.state.downloadAnchorText}
                </a>
                <span id="status"></span>
            </div>
        );
    }
}

export default FileTransfer;
