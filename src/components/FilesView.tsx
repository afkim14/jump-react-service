import React, { FC } from 'react';
import FileContainer from './FileContainer';
import { File, UserDisplay } from '../constants/Types';
import './FilesView.css';

type FilesViewProps = {
    files: File[];
    channelsOpen: boolean;
    displayName: UserDisplay;
    acceptFile: (file: File) => void;
    rejectFile: (file: File) => void;
};

const FilesView: FC<FilesViewProps> = (props: FilesViewProps) => (
    <div>
        {
            props.files.map((file, index) => {
                return (
                    <FileContainer
                        key={index}
                        file={file}
                        channelsOpen={props.channelsOpen}
                        displayName={props.displayName}
                        acceptFile={props.acceptFile}
                        rejectFile={props.rejectFile}
                    />
                )
            })
        }
    </div>
);

export default FilesView;
