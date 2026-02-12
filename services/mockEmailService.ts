
export const sendMockEmail = (to: string, subject: string, body: string) => {
  console.log(`%c[Email Sent]`, 'color: green; font-weight: bold;');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  
  // Optional: Visual feedback for the user (can be removed for production feeling)
  // alert(`(Simulated Email)\nTo: ${to}\nSubject: ${subject}`);
};
