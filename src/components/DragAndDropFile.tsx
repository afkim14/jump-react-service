import React, { Component, ChangeEvent, DragEvent } from 'react';

type DragAndDropFileProps = {
    onFileInputChange: (file: File | null) => void;
};

type DragAndDropFileState = {
    dragging: boolean;
};

class DragAndDropFile extends Component<DragAndDropFileProps, DragAndDropFileState> {
    state: DragAndDropFileState = {
        dragging: false,
    };

    dropRef: any;
    fileInput: any;
    dragCounter: number;

    constructor(props: DragAndDropFileProps) {
        super(props);
        this.dropRef = React.createRef();
        this.dragCounter = 0;

        this.handleFileDrag = this.handleFileDrag.bind(this);
        this.handleFileDragIn = this.handleFileDragIn.bind(this);
        this.handleFileDragOut = this.handleFileDragOut.bind(this);
        this.handleFileDrop = this.handleFileDrop.bind(this);
        this.handleFileInputChange = this.handleFileInputChange.bind(this);
    }

    componentDidMount(): void {
        this.dropRef.current.addEventListener('dragenter', this.handleFileDragIn);
        this.dropRef.current.addEventListener('dragleave', this.handleFileDragOut);
        this.dropRef.current.addEventListener('dragover', this.handleFileDrag);
        this.dropRef.current.addEventListener('drop', this.handleFileDrop);
    }

    componentWillUnmount(): void {
        this.dropRef.current.removeEventListener('dragenter', this.handleFileDragIn);
        this.dropRef.current.removeEventListener('dragleave', this.handleFileDragOut);
        this.dropRef.current.removeEventListener('dragover', this.handleFileDrag);
        this.dropRef.current.removeEventListener('drop', this.handleFileDrop);
    }

    handleFileInputChange(event: ChangeEvent<HTMLInputElement>): void {
        console.log('handle file input change2');
        const file = event.target.files ? event.target.files[0] : null;
        this.props.onFileInputChange(file);
    }

    handleFileDragIn(event: DragEvent<HTMLDivElement>): void {
        event.preventDefault();
        event.stopPropagation();
        this.dragCounter++;
        if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
            this.setState({ dragging: true });
        }
    }

    handleFileDragOut(event: DragEvent<HTMLDivElement>): void {
        event.preventDefault();
        event.stopPropagation();
        this.dragCounter--;
        if (this.dragCounter <= 0) {
            this.setState({ dragging: false });
        }
    }

    handleFileDrag(event: DragEvent<HTMLDivElement>): void {
        event.preventDefault();
        event.stopPropagation();
    }

    handleFileDrop(event: DragEvent<HTMLDivElement>): void {
        console.log('hadnle file drop');
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            this.props.onFileInputChange(event.dataTransfer.files[0]);
        }
        this.setState({ dragging: false });
    }

    render(): React.ReactNode {
        return (
            <div>
                Hello world, this is Drag and Drop component.
                <div className={`${this.state.dragging && 'drag-and-drop-container-on-drag'}`} ref={this.dropRef}>
                    {this.state.dragging ? (
                        <div>
                            <p className="drag-and-drop-text">Drop file to send.</p>
                        </div>
                    ) : (
                        <input
                            type="file"
                            // className="file-input"
                            onChange={this.handleFileInputChange}
                            ref={ref => (this.fileInput = ref)}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default DragAndDropFile;
