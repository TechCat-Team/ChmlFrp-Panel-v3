interface Window {
    grecaptcha: {
        render: (container: HTMLElement | null, parameters: { sitekey: string; callback: (token: string) => void }) => void;
    };
}