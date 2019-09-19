import React, { Component, ChangeEvent } from 'react';

type FileTransferProps = {};

type FileTranferState = {
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

    localConnection: RTCPeerConnection;
    remoteConnection: RTCPeerConnection;
    sendChannel: RTCDataChannel;
    receiveChannel: RTCDataChannel | null;
    fileReader: FileReader;
    receiveBuffer: any[];
    receivedSize: number;
    bytesPrev: number;
    timestampPrev: number;
    timestampStart: number | null;
    statsInterval: any;
    bitrateMax: number;
    fileInput: any;

    constructor(props: FileTransferProps) {
        super(props);

        this.remoteConnection = new RTCPeerConnection();
        this.localConnection = new RTCPeerConnection();
        this.sendChannel = this.localConnection.createDataChannel('sendDataChannel');
        this.receiveChannel = null;
        this.receiveBuffer = [];
        this.receivedSize = 0;
        this.bytesPrev = 0;
        this.timestampPrev = 0;
        this.timestampStart = null;
        this.statsInterval = null;
        this.bitrateMax = 0;
        this.fileReader = new FileReader();

        this.createConnection = this.createConnection.bind(this);
        this.handleFileInputChange = this.handleFileInputChange.bind(this);
        this.onSendChannelStateChange = this.onSendChannelStateChange.bind(this);
        this.receiveChannelCallback = this.receiveChannelCallback.bind(this);
        this.handleAbortFileTransfer = this.handleAbortFileTransfer.bind(this);
        this.onReceiveMessageCallback = this.onReceiveMessageCallback.bind(this);
    }

    async createConnection() {
        this.setState({
            abortButtonDisabled: false,
            sendFileButtonDisabled: true,
        });

        this.sendChannel = this.localConnection.createDataChannel('sendDataChannel');
        this.sendChannel.binaryType = 'arraybuffer';
        this.sendChannel.addEventListener('error', error => console.error('Error in sendChannel:', error));

        this.sendChannel.onopen = this.onSendChannelStateChange;
        this.sendChannel.onclose = this.onSendChannelStateChange;
        this.sendChannel.onerror = (error: RTCErrorEvent) => console.error('Error in sendChannel:', error);

        this.localConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) =>
            !event.candidate ||
            this.remoteConnection.addIceCandidate(event.candidate).catch(this.handleAddCandidateError);

        this.remoteConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) =>
            !event.candidate ||
            this.localConnection.addIceCandidate(event.candidate).catch(this.handleAddCandidateError);

        this.remoteConnection.ondatachannel = this.receiveChannelCallback;

        try {
            const offer = await this.localConnection.createOffer();
            await this.getLocalDescription(offer);
        } catch (error) {
            console.log('Failed to create session description: ', error);
        }

        this.setState({
            fileInputDisabled: false,
        });
    }

    handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            this.setState({
                sendFileButtonDisabled: false,
            });
        }
    }

    sendData(file: File) {
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
            receiveProgressMax: file.size,
        });

        const chunkSize = 16384;
        this.fileReader.onerror = error => console.error('Error reading file:', error);
        this.fileReader.onabort = event => console.log('File reading aborted:', event);

        const readSlice = (progressValueOffset: number) => {
            const slice = file.slice(this.state.sendProgressValue, progressValueOffset + chunkSize);
            this.fileReader.readAsArrayBuffer(slice);
        };

        const handleFileReaderLoadEvent = (event: ProgressEvent) => {
            const result = this.fileReader.result as ArrayBuffer;
            this.sendChannel.send(result);
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

    handleAbortFileTransfer() {
        if (this.fileReader && this.fileReader.readyState === 1) {
            this.fileReader.abort();
            this.setState({
                sendFileButtonDisabled: false,
            });
        }
    }

    onSendChannelStateChange() {
        const readyState = this.sendChannel.readyState;
        if (readyState === 'open') {
            this.sendData(this.fileInput.files[0]);
        }
    }

    handleAddCandidateError() {
        console.log('Failed to add candidate.');
    }

    receiveChannelCallback(event: RTCDataChannelEvent) {
        this.receiveChannel = event.channel;
        this.receiveChannel.binaryType = 'arraybuffer';
        this.receiveChannel.onmessage = this.onReceiveMessageCallback;
        this.receiveChannel.onopen = this.onReceiveChannelStateChange;
        this.receiveChannel.onclose = this.onReceiveChannelStateChange;

        this.receivedSize = 0;
        this.bitrateMax = 0;

        this.setState({
            downloadAnchorText: '',
        });
    }

    // TODO: Use remote peers instead of only local
    async getLocalDescription(description: RTCSessionDescriptionInit) {
        await this.localConnection.setLocalDescription(description);
        await this.remoteConnection.setRemoteDescription(description);

        try {
            const answer = await this.remoteConnection.createAnswer();
            await this.getRemoteDescription(answer);
        } catch (error) {
            console.log('Failed to create session description: ', error);
        }
    }

    // TODO: Use remote peers instead of local
    async getRemoteDescription(description: RTCSessionDescriptionInit) {
        await this.remoteConnection.setLocalDescription(description);
        await this.localConnection.setRemoteDescription(description);
    }

    closeDataChannels() {
        this.sendChannel.close();
        if (this.receiveChannel) {
            this.receiveChannel.close();
        }

        this.localConnection.close();
        this.remoteConnection.close();
        this.localConnection = new RTCPeerConnection();
        this.remoteConnection = new RTCPeerConnection();

        this.setState({
            fileInputDisabled: false,
            abortButtonDisabled: true,
            sendFileButtonDisabled: false,
        });
    }

    onReceiveMessageCallback(event: MessageEvent) {
        this.receiveBuffer.push(event.data);
        this.receivedSize += event.data.byteLength;
        this.setState({
            receiveProgressValue: this.receivedSize,
        });

        const file = this.fileInput.files[0];

        if (this.receivedSize === file.size) {
            const received = new Blob(this.receiveBuffer);
            this.receiveBuffer = [];

            this.setState({
                anchorDownloadHref: URL.createObjectURL(received),
                downloadAnchorText: `Click to download ${file.name} (${file.size} bytes)`,
                anchorDownloadFileName: file.name,
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

    async onReceiveChannelStateChange() {
        if (this.receiveChannel && this.receiveChannel.readyState === 'open') {
            this.timestampStart = new Date().getTime();
            this.timestampPrev = this.timestampStart;
            this.statsInterval = setInterval(this.displayStats, 500);
            await this.displayStats();
        }
    }

    async displayStats() {
        if (!this.remoteConnection || this.remoteConnection.iceConnectionState !== 'connected') {
            return;
        }

        const stats: RTCStatsReport = await this.remoteConnection.getStats();
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

    render() {
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
                            // disabled={this.state.fileInputDisabled}
                        />
                    </form>
                    <button
                        disabled={this.state.sendFileButtonDisabled}
                        id="send-file-button"
                        onClick={this.createConnection}
                    >
                        Send File
                    </button>
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
                    <progress id="send-file-progress" max="0" value="0"></progress>
                </div>
                <div className="file-transfer-progress">
                    <div className="file-transfer-progress-label">Receive Progress:</div>
                    <progress id="receive-file-progress" max="0" value="0"></progress>
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
