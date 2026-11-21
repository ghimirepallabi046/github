const Button = ({ type, buttonLabel,className}: {type: "submit" | "reset"| "button", buttonLabel: string,className:string}) => {
    return (
        <button type={type} className={className}>{buttonLabel}</button>
     )
    }

    export default Button