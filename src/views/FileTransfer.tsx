import React, { Component, Fragment } from 'react';
import { Dispatch } from 'redux';
import uuid from 'uuid';
import DragAndDropFile from '../components/DragAndDropFile';
import CustomButton from '../components/CustomButton';
import ReceivedFiles from '../components/ReceivedFiles';
import * as Types from '../constants/Types';
import './FileTransfer.css';

import { addFileToRoom, SendFile } from '../store/actions/room';
import { connect } from 'react-redux';

type FileTransferProps = {
    currentRoom: Types.Room;
    displayName: Types.UserDisplay;
    channelsOpen: boolean;
    setReceiveFileHandler: (handler: any) => void;
    updateRoom: (roomid: string, room: Types.Room) => void;
    addFileToRoom: (roomId: string, file: File) => void;
    sendFile: (roomId: string, sender: Types.UserDisplay) => void;
};

type FileTranferState = {
    currentFile: Types.FileInfo;
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

        this.props.setReceiveFileHandler(this.handleReceiveData);
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
            updatedRoom.files.forEach((f: Types.FileInfo) => {
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

    handleFileInputChange(file: File | null): void {
        if (file) {
            this.props.addFileToRoom(this.props.currentRoom.roomid, file);
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
        };

        const updatedRoom = this.props.currentRoom;
        updatedRoom.files.push(newFile);
        this.props.updateRoom(updatedRoom.roomid, updatedRoom);
        this.setState({ currentFileToSend: file }, () => {
            this.handleSendData(this.state.currentFileToSend);
        });
    }

    render(): React.ReactNode {
        return (
            <Fragment>
                <DragAndDropFile onFileInputChange={this.handleFileInputChange.bind(this)} />
                {this.props.currentRoom.requestSent && (
                    <div>
                        <p className="file-transfer-header">Sending</p>
                        <p className="file-transfer-header">Receiving</p>
                    </div>
                )}
                {this.props.currentRoom.files.length > 0 && (
                    <CustomButton
                        text={'Send Files'}
                        style={{ backgroundColor: '#F4976C' }}
                        onClick={() => this.props.sendFile(this.props.currentRoom.roomid, this.props.displayName)}
                    />
                )}
                <ReceivedFiles receivedFiles={this.props.currentRoom.receivedFiles} />
            </Fragment>
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    addFileToRoom: (roomId: string, file: File) => dispatch(addFileToRoom(roomId, file)),
    sendFile: (roomId: string, sender: Types.UserDisplay) => dispatch(SendFile(roomId, sender)),
});

export default connect(
    null,
    mapDispatchToProps,
)(FileTransfer);
