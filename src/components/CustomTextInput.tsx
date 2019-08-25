import React from 'react';
import './CustomTextInput.css';

type CustomTextInputProps = {
    onChange: Function,
    placeholder: string,
    style?: object
    type?: string
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({onChange, placeholder, style, type}) => (
    <input 
        className="custom-text-input"
        onChange={(e) => {onChange(e)}} 
        placeholder={placeholder} 
        style={style}
        type={type}
    />
);

export default CustomTextInput;