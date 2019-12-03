import React from 'react';

function Button(props) {
    return <button type="button">
        {props.text}
    </button>;
}

export default Button;