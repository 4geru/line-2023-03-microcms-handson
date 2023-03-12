export const lineNotify = (message) => {
    const params = new URLSearchParams({
        message: message,
    });
    fetch("/api/send_notify?" + params.toString(), {
        headers: { 'Authorization': `Bearer: ${process.env.LINE_NOTIFY_TOKEN}` }
    })
}
