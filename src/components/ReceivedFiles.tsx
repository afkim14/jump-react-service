import React, { FC, Fragment } from 'react';
import { ReceivedFile } from '../constants/Types';

type ReceivedFilesProps = {
    receivedFiles: ReceivedFile[];
};

const ReceivedFiles: FC<ReceivedFilesProps> = (props: ReceivedFilesProps) => {
    const receivedFiles = props.receivedFiles.map((receivedFile: ReceivedFile) => {
        return (
            <a href={receivedFile.anchorDownloadHref} download={receivedFile.fileName}>
                {receivedFile.fileName}
            </a>
        );
    });
    return (
        <Fragment>
            {receivedFiles.length > 0 && <h1>Click to download received files</h1>}
            {receivedFiles}
        </Fragment>
    );
};

export default ReceivedFiles;
