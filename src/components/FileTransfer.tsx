import React, { Component, ChangeEvent } from 'react';
import socket from '../constants/socket-context';
import Constants from '../constants/Constants';
import * as Types from '../constants/Types';
import RTC from '../lib/RTC';
import './FileTransfer.css';
import fileImg from '../assets/images/file-01.png';

type FileTransferProps = {
    currentRoom: Types.Room;
    onInitialFileSend: Function;
    displayName: Types.UserDisplay;
    updateCompletedFile: Function;
};

type FileTranferState = {
    sendChannelOpen: boolean;
    receiveChannelOpen: boolean;
    requestTransferPermission: boolean;
    sendFileButtonDisabled: boolean;
    abortButtonDisabled: boolean;
    fileInputDisabled: boolean;
    statusMessageText: string;
    bitrateDivText: string;
    sendProgressMax: number;
    receiveProgressMax: number;
    sendProgressValue: number;
    receiveProgressValue: number;
    anchorDownloadHref: string;
    anchorDownloadFileName: string;
    dragging: boolean;
    currentFile: Types.File;
    currentFileToSend: any;
};

class FileTransfer extends Component<FileTransferProps, FileTranferState> {
    state: FileTranferState = {
        sendChannelOpen: false,
        receiveChannelOpen: false,
        requestTransferPermission: false,
        sendFileButtonDisabled: true,
        abortButtonDisabled: true,
        fileInputDisabled: true,
        statusMessageText: '',
        bitrateDivText: '',
        sendProgressMax: 0,
        receiveProgressMax: 0,
        sendProgressValue: 0,
        receiveProgressValue: 0,
        anchorDownloadHref: '',
        anchorDownloadFileName: '',
        dragging: false,
        currentFile: this.props.currentRoom.files.length > 0 ? this.props.currentRoom.files[0] : {},
        currentFileToSend: null
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
    dropRef: any;
    dragCounter: number;

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
        this.dropRef = React.createRef();
        this.dragCounter = 0;

        this.handleSendChannelStatusChange = this.handleSendChannelStatusChange.bind(this);
        this.handleReceiveChannelStatusChange = this.handleReceiveChannelStatusChange.bind(this);
        this.handleSendData = this.handleSendData.bind(this);
        this.handleReceiveData = this.handleReceiveData.bind(this);
        this.handleFileInputChange = this.handleFileInputChange.bind(this);
        this.handleAbortFileTransfer = this.handleAbortFileTransfer.bind(this);
        this.closeDataChannels = this.closeDataChannels.bind(this);
        this.displayStats = this.displayStats.bind(this);

        socket.on(Constants.ROOM_STATUS, (data: Types.RoomStatus) => {
            if (data.full) {
                // TODO: NEW RTC
                RTC.connectPeers('fileDataChannel', this.props.displayName.userid === data.owner);
                RTC.setHandleSendChannelStatusChange(this.handleSendChannelStatusChange);
                RTC.setHandleReceiveChannelStatusChange(this.handleReceiveChannelStatusChange);
                RTC.setReceiveMessageHandler(this.handleReceiveData);
                RTC.setSendChannelBinaryType('arraybuffer');
                RTC.setReceiveChannelBinaryType('arraybuffer');
            }
        });
    }

    componentDidMount(): void {
        this.dropRef.current.addEventListener('dragenter', this.handleDragIn)
        this.dropRef.current.addEventListener('dragleave', this.handleDragOut)
        this.dropRef.current.addEventListener('dragover', this.handleDrag)
        this.dropRef.current.addEventListener('drop', this.handleDrop)
    }

    componentWillUnmount(): void {
        this.dropRef.current.removeEventListener('dragenter', this.handleDragIn)
        this.dropRef.current.removeEventListener('dragleave', this.handleDragOut)
        this.dropRef.current.removeEventListener('dragover', this.handleDrag)
        this.dropRef.current.removeEventListener('drop', this.handleDrop)

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
        this.setState({
            statusMessageText: '',
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
            const result = this.fileReader.result as ArrayBuffer;
            RTC.sendMessage(result);
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

        if (this.receivedSize === this.state.currentFile.fileSize) {
            const received = new Blob(this.receiveBuffer);
            this.receiveBuffer = [];

            this.setState({
                anchorDownloadHref: URL.createObjectURL(received),
                anchorDownloadFileName: this.state.currentFile.fileName,
            });

            this.props.updateCompletedFile(this.props.currentRoom.roomid, this.state.currentFile);

            const bitrate = Math.round((this.receivedSize * 8) / (new Date().getTime() - (this.timestampStart || 0)));
            this.setState({
                bitrateDivText: `Average Bitrate: ${bitrate} kbits/sec (max: ${this.bitrateMax} kbits/sec)`,
            });

            if (this.statsInterval) {
                clearInterval(this.statsInterval);
                this.statsInterval = null;
            }
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
            socket.emit(Constants.FILE_TRANSFER_REQUEST, { name: file.name, size: file.size });
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

    /**
     * Handles file drag
     */
    handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Handles file drag in
     */
    handleDragIn = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        this.dragCounter++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            this.setState({dragging: true})
        }
    }

    /**
     * Handles file drag out
     */
    handleDragOut = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        this.dragCounter--;
        if (this.dragCounter > 0) return
        this.setState({dragging: false})
    }

    /**
     * Handles file drop
     */
    handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            this.setState({ currentFileToSend: e.dataTransfer.files[0] });
            this.props.onInitialFileSend({ 
                sender: this.props.displayName,
                fileName: e.dataTransfer.files[0].name,
                fileSize: e.dataTransfer.files[0].size,
                completed: false
            });
        }
        this.setState({dragging: false})
    }

    render(): React.ReactNode {
        const openConnection = !this.props.currentRoom.requestSent || (this.state.receiveChannelOpen && this.state.sendChannelOpen);
        return (
            <div>
                <div className={`file-transfer-container ${this.state.dragging && 'file-transfer-container-drag'}`} ref={this.dropRef}>
                    {
                        this.state.dragging && (
                            <p className='file-transfer-text'>Drop file to send.</p>
                        )
                    }
                </div>
                {
                    this.props.currentRoom.requestSent && this.props.currentRoom.files.map((file, index) => {
                        return (
                            <div className="file-container" key={index}>
                                <img src={fileImg} className="file-icon" />
                                <p className="file-name">{file.fileName}</p>
                                <p className="file-size">{file.fileSize}</p>
                                {
                                    openConnection ? (
                                        file.completed ? (
                                            <a className='file-download' id="download" href={this.state.anchorDownloadHref} download={this.state.anchorDownloadFileName}>
                                                Download
                                            </a>
                                        ) : (
                                            this.state.currentFileToSend ? (
                                                <p className='file-download' onClick={(): void => {this.handleSendData(this.state.currentFileToSend)}}>Send</p>
                                            ) : (
                                                <p className='file-downloading'>Requesting file...</p>
                                            )
                                        )
                                    ) : (
                                            <p className='file-downloading'>Connecting...</p>
                                    )
                                }
                            </div>
                        )
                    })
                }
            </div>
            
        );
    }
}

export default FileTransfer;
