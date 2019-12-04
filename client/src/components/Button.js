import React from 'react';

function Button(props) {
    return <a href={props.url}>{props.text}</a>;
}

export default Button;