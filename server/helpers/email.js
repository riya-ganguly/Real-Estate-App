import * as config from "../config.js";

const style = `
   background-color: #eee;
   padding: 20px;
   border-radius: 30px;
`;

export const emailTemplate = (email, content, replyTo, subject) => {

    return {
        Source: config.EMAIL_FROM,
        Destination: {
           ToAddresses: [email],
        },
        Message:{
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `
                    <html>
                        <div style ="${style}">
                            <h1 style ="${style}">Welcome to realist app</h1>
                            ${content}
                            <p>${new Date().getFullYear()}</p>
                        </div>
                    </html>
                    `,
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
    }
}