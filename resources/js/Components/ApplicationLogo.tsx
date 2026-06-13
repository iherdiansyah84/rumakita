export default function ApplicationLogo(props) {
    return (
        <img
            {...props}
            src="/logo.png"
            alt="RumaKita Logo"
            className={`object-contain ${props.className || ''}`}
        />
    );
}
