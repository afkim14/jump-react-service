import React, { Component, ChangeEvent } from 'react';
import uuid from 'uuid';
import FilesView from '../components/FilesView';
import * as Types from '../constants/Types';
import './FileTransfer.css';
import socket from '../constants/socket-context';
import Constants from '../constants/Constants';

type FileTransferProps = {
    currentRoom: Types.Room;
    displayName: Types.UserDisplay;
    channelsOpen: boolean;
    setReceiveFileHandler: (handler: any) => void;
    updateRoom: (roomid: string, room: Types.Room) => void;
};

type FileTranferState = {
    currentFile: Types.File;
    currentFileToSend: any;
    currentFileSendProgressMax: number;
    currentFileReceiveProgressMax: number;
    currentFileSendProgressValue: number;
    currentFileReceiveProgressValue: number;
    currentFileAnchorDownloadHref: string;
    currentFileAnchorDownloadFileName: string;
    bitrateDivText: string;
    dragging: boolean;
};

class FileTransfer extends Component<FileTransferProps, FileTranferState> {
    state: FileTranferState = {
        currentFile: this.props.currentRoom.files.length > 0 ? this.props.currentRoom.files[0] : {},
        currentFileToSend: null,
        currentFileSendProgressMax: 0,
        currentFileReceiveProgressMax: 0,
        currentFileSendProgressValue: 0,
        currentFileReceiveProgressValue: 0,
        currentFileAnchorDownloadHref: '',
        currentFileAnchorDownloadFileName: '',
        bitrateDivText: '',
        dragging: false,
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

        this.handleSendData = this.handleSendData.bind(this);
        this.handleReceiveData = this.handleReceiveData.bind(this);
        this.handleFileInputChange = this.handleFileInputChange.bind(this);
        this.handleAbortFileTransfer = this.handleAbortFileTransfer.bind(this);

        this.handleDrag = this.handleDrag.bind(this);
        this.handleDragIn = this.handleDragIn.bind(this);
        this.handleDragOut = this.handleDragOut.bind(this);
        this.handleDrop = this.handleDrop.bind(this);

        this.getFilesSentAndReceived = this.getFilesSentAndReceived.bind(this);
        this.submitFile = this.submitFile.bind(this);
        this.acceptFile = this.acceptFile.bind(this);
        this.rejectFile = this.rejectFile.bind(this);

        this.props.setReceiveFileHandler(this.handleReceiveData);
    }

    componentDidMount(): void {
        this.dropRef.current.addEventListener('dragenter', this.handleDragIn);
        this.dropRef.current.addEventListener('dragleave', this.handleDragOut);
        this.dropRef.current.addEventListener('dragover', this.handleDrag);
        this.dropRef.current.addEventListener('drop', this.handleDrop);
    }

    componentWillUnmount(): void {
        this.dropRef.current.removeEventListener('dragenter', this.handleDragIn);
        this.dropRef.current.removeEventListener('dragleave', this.handleDragOut);
        this.dropRef.current.removeEventListener('dragover', this.handleDrag);
        this.dropRef.current.removeEventListener('drop', this.handleDrop);
    }

    /**
     * Handles data sent over RTC send channel.
     */
    handleSendData(file: File): void {
        this.setState({ currentFileSendProgressMax: file.size });

        const chunkSize = 16384;
        this.fileReader.onerror = error => console.error('Error reading file:', error);
        this.fileReader.onabort = event => console.log('File reading aborted:', event);

        const readSlice = (progressValueOffset: number): void => {
            const slice = file.slice(this.state.currentFileSendProgressValue, progressValueOffset + chunkSize);
            this.fileReader.readAsArrayBuffer(slice);
        };

        const handleFileReaderLoadEvent = (event: ProgressEvent): void => {
            if (this.props.currentRoom.rtcConnection) {
                const result = this.fileReader.result as ArrayBuffer;
                this.props.currentRoom.rtcConnection.sendMessage(result);
                const progress = result.byteLength + this.state.currentFileSendProgressValue;
                this.setState({
                    currentFileSendProgressValue: progress,
                });
                if (progress < file.size) {
                    readSlice(progress);
                }
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
            currentFileReceiveProgressValue: this.receivedSize,
        });

        if (this.receivedSize === this.state.currentFile.size) {
            const received = new Blob(this.receiveBuffer);
            this.receiveBuffer = [];

            this.setState({
                currentFileAnchorDownloadHref: URL.createObjectURL(received),
                currentFileAnchorDownloadFileName: this.state.currentFile.name,
            });

            const updatedRoom = this.props.currentRoom;
            updatedRoom.files.forEach(f => {
                if (f.id === this.state.currentFile.id) {    
                    f.completed = true;
                    this.props.updateRoom(updatedRoom.roomid, updatedRoom);
                }
            });

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
            this.submitFile(file);
        }
    }

    /**
     * Handles file transfer abort.
     */
    handleAbortFileTransfer(): void {
        /*
        if (this.fileReader && this.fileReader.readyState === 1) {
            this.fileReader.abort();
            this.setState({
                sendFileButtonDisabled: false,
            });
        }
        */
    }

    async displayStats(): Promise<any> {
        if (!this.props.currentRoom.rtcConnection || !this.props.channelsOpen) {
            return;
        }

        const stats: RTCStatsReport = await this.props.currentRoom.rtcConnection.localConnection.getStats();
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
    handleDrag(e: React.DragEvent<HTMLDivElement>): void {
        e.preventDefault();
        e.stopPropagation();
    };

    /**
     * Handles file drag in
     */
    handleDragIn(e: React.DragEvent<HTMLDivElement>): void {
        e.preventDefault();
        e.stopPropagation();
        this.dragCounter++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            this.setState({ dragging: true });
        }
    };

    /**
     * Handles file drag out
     */
    handleDragOut(e: React.DragEvent<HTMLDivElement>): void {
        e.preventDefault();
        e.stopPropagation();
        this.dragCounter--;
        if (this.dragCounter > 0) return;
        this.setState({ dragging: false });
    };

    /**
     * Handles file drop
     */
    handleDrop(e: React.DragEvent<HTMLDivElement>): void {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            this.submitFile(e.dataTransfer.files[0]);
        }
        this.setState({ dragging: false });
    };

    /**
     * Separate between files sent and files received
     */
    getFilesSentAndReceived(): { sent: Types.File[], received: Types.File[]} {
        const sent: Types.File[] = [];
        const received: Types.File[] = [];
        this.props.currentRoom.files.forEach(f => {
            f.sender.userid === this.props.displayName.userid
                ? sent.push(f)
                : received.push(f);
        });
        return { sent, received };
    }

    /**
     * Stores our version of a File
     * @param file - file that was either dropped or inputted
     */
    submitFile(file: File): void {
        const newFile = {
            id: uuid.v1(),
            sender: this.props.displayName,
            name: file.name,
            size: file.size,
            anchorDownloadHref: '',
            anchorDownloadFileName: '',
            accepted: false,
            completed: false,
        }

        const updatedRoom = this.props.currentRoom;
        updatedRoom.files.push(newFile);
        this.props.updateRoom(updatedRoom.roomid, updatedRoom);
        this.setState({ currentFileToSend: file }, () => {
            this.handleSendData(this.state.currentFileToSend);
        });
    }

    /**
     * Accepts file
     * @param file - file to accept
     */
    acceptFile(file: Types.File): void {
        const updatedRoom = this.props.currentRoom;
        updatedRoom.files.forEach(f => {
            if (f.id === file.id) {    
                f.accepted = true;
                this.props.updateRoom(updatedRoom.roomid, updatedRoom);
                socket.emit(Constants.FILE_ACCEPT, { 
                    sender: file.sender, 
                    roomid: updatedRoom.roomid, 
                    fileid: file.id 
                });
            }
        });
    }
    
    /**
     * Reject file
     * @param file - file to reject
     */
    rejectFile(file: Types.File): void {
        const updatedRoom = this.props.currentRoom;
        updatedRoom.files.forEach(f => {
            if (f.id === file.id) {    
                f.accepted = false;
                this.props.updateRoom(updatedRoom.roomid, updatedRoom);
                socket.emit(Constants.FILE_REJECT, { 
                    sender: file.sender, roomid: 
                    updatedRoom.roomid, fileid: 
                    file.id 
                });
            }
        });
    }

    render(): React.ReactNode {
        const allFiles = this.getFilesSentAndReceived();
        const sentFiles = allFiles.sent;
        const receivedFiles = allFiles.received;
        const openConnection =
            !this.props.currentRoom.requestSent || (this.props.channelsOpen);
        return (
            <div>
                <div
                    className={`file-transfer-container ${this.state.dragging && 'file-transfer-container-drag'}`}
                    ref={this.dropRef}
                >
                    {
                        this.state.dragging ? (
                            <div>
                                <p className="file-transfer-text">Drop file to send.</p>
                            </div>
                        ) : (
                            <input
                                type="file"
                                className="file-input"
                                onChange={this.handleFileInputChange}
                                ref={ref => (this.fileInput = ref)}
                            />
                        )
                    }
                </div>
                {
                    this.props.currentRoom.requestSent && (
                        <div>
                            <p className="file-transfer-header">Sending</p>
                            <FilesView 
                                files={sentFiles}
                                channelsOpen={this.props.channelsOpen}
                                displayName={this.props.displayName} 
                                acceptFile={this.acceptFile}
                                rejectFile={this.rejectFile}
                            />
                            <p className="file-transfer-header">Receiving</p>
                            <FilesView 
                                files={receivedFiles} 
                                channelsOpen={this.props.channelsOpen}
                                displayName={this.props.displayName} 
                                acceptFile={this.acceptFile}
                                rejectFile={this.rejectFile}
                            />
                        </div>
                    )

                    /*
                    <div className="file-container" key={index}>
                        <img src={fileImg} className="file-icon" alt="File is loading..." />
                        <p className="file-name">{file.fileName}</p>
                        <p className="file-size">{file.fileSize}</p>
                        {openConnection ? (
                            file.completed ? (
                                <a
                                    className="file-download"
                                    id="download"
                                    href={this.state.anchorDownloadHref}
                                    download={this.state.anchorDownloadFileName}
                                >
                                    Download
                                </a>
                            ) : this.state.currentFileToSend ? (
                                <p
                                    className="file-download"
                                    onClick={(): void => {
                                        this.handleSendData(this.state.currentFileToSend);
                                    }}
                                >
                                    Send
                                </p>
                            ) : (
                                <p className="file-downloading">Requesting file...</p>
                            )
                        ) : (
                            <p className="file-downloading">Connecting...</p>
                        )}
                    </div>
                    */
                }
            </div>
        );
    }
}

export default FileTransfer;
