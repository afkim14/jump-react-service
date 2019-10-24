import React, { FC } from 'react';

import { File, UserDisplay } from '../constants/Types';
import fileImg from '../assets/images/file-01.png';
import './FileContainer.css';

type FileContainerProps = {
    key: number;
    file: File;
    channelsOpen: boolean;
    displayName: UserDisplay;
    acceptFile: (file: File) => void;
    rejectFile: (file: File) => void;
};

const FileContainer: FC<FileContainerProps> = (props: FileContainerProps) => (
    <div className="file-container">
        <img src={fileImg} className="file-icon" alt="File is loading..." />
        <p className="file-name">{props.file.name}</p>
        <p className="file-size">{props.file.size}</p>
        {
            props.file.accepted ? (
                props.file.completed ? (
                    <a
                        className="file-download"
                        id="download"
                        href={props.file.anchorDownloadHref}
                        download={props.file.anchorDownloadFileName}
                    >
                        Download
                    </a>
                ) : (
                    <div>
                        Progress
                    </div>
                )
            ) : (
                props.file.sender.userid === props.displayName.userid ? (
                    <p>Awaiting approval.</p>
                ) : (
                    <div>
                        <button 
                            className="file-download"
                            disabled={!props.channelsOpen} 
                            onClick={() => {props.acceptFile(props.file)}}
                        >
                            Accept
                        </button>
                        <button 
                            className="file-download"
                            disabled={!props.channelsOpen} 
                            onClick={() => {props.rejectFile(props.file)}}
                        >
                            Reject
                        </button>
                    </div>
                )
            )
        }
    </div>
);

export default FileContainer;
