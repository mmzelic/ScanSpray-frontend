// GrayMatter Robotics - UI Frontend Configuration
const config = {
    // When on the same PC, use 'localhost'. 
    // When on a Tablet, change 'localhost' to the PC's Wi-Fi IP (e.g., 192.168.1.50)
    SOCKET_URL: `http://localhost:3001`,
    
    // Display purposes only
    PLC_DISPLAY_IP: '192.168.11.210',

    PULSE_MS: 500, // The time the bit stays '1' before returning to '0'

    AUTH_USER: 'GMR',
    AUTH_PASS: '1234',
    OPERATOR_ID: 'GMR-User' // This is what shows on the Dashboard
};

export default config;