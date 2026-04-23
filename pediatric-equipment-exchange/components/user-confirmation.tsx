
// a confirmation dialogue we can reuse inside of popups instead of window.confirm

"use client";

interface Props {
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel: () => void
}

export default function Confirm( {title, message, onConfirm, onCancel}: Props) {

    return (
        <div> 
            <h1> {title} </h1>
            <p> {message} </p>
            <div className="flex justify-center gap-4">
                <button onClick={onCancel}> Cancel </button>
                <button onClick={onConfirm}> Confirm </button>
            </div>
        </div>
    );
}