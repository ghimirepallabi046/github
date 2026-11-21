const input = ({ type, buttonLabel,className}: {type: "submit" | "reset"| "input", buttonLabel: string,className:string}) => {
    return (
        <input type={type} className={className}>{buttonLabel}</input>
     )
    }

    export default input 