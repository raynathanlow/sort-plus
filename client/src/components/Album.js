import React from 'react';

function Album(props) {
    return (
        <li>
            <img src={props.image} alt={props.name} />
            <a href={props.publicUrl}>{props.name}</a> | {props.artistNames} | {props.duration} | {props.totalTracks} | {props.explicit}
        </li>
    );
}

export default Album;