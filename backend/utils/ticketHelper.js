import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

export const generateQRAndSendEmail = async (booking, userEmail, eventTitle) => {
  try {
    // Create a unique data string to be inserted into the QR Code. This can include the booking ID, user ID, and seat information.
    // 🌟 [PRESERVED] - Kept the original JSON stringify logic intact
    const qrData = JSON.stringify({
      bookingId: booking._id,
      userId: booking.user,
      seats: booking.seats,
    });

    // Generate a QR Code (as a Base64 Image) from the data string
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // Create an email transporter (Gmail settings)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // The email to put in .env (Your Gmail address)
        pass: process.env.EMAIL_PASS, // App Password to be placed in .env
      },
    });

    // A beautiful HTML email to the user with the event details and the QR Code image embedded.
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🎟️ Your Ticket Confirmation for ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2>Booking Confirmed! 🎉</h2>
          <p>Thank you for booking tickets with us. Here are your details:</p>
          <p><strong>Event:</strong> ${eventTitle}</p>
          <p><strong>Seats Booked:</strong> ${booking.seats.join(', ')}</p>
          <p><strong>Total Paid:</strong> LKR ${booking.totalAmount}</p>
          <br/>
          <p><strong>Scan your QR Code at the gate:</strong></p>
          
          <img src="cid:ticket-qr" alt="Ticket QR Code" style="width:200px; height:200px; border: 1px solid #eee; padding: 5px; background: #fff;" />
          
          <br/>
          <p>See you at the event!</p>
        </div>
      `,
      // 🌟 [UPDATED] - Sending Base64 image securely to Gmail as an Inline Attachment (CID)
      attachments: [
        {
          filename: 'ticket-qr.png',
          path: qrCodeImage, // Generated Base64 string
          cid: 'ticket-qr'   // Identifier linking with src="cid:ticket-qr" in HTML
        }
      ]
    };

    // send email with the ticket and QR code
    await transporter.sendMail(mailOptions);
    console.log('📧 Ticket Email sent successfully with QR!');
    
    return qrCodeImage; // I'll send it back to the server to update the db.
  } catch (error) {
    console.error('❌ Error in QR/Email Helper:', error.message);
  }
};